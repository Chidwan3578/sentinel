import { Hono } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';
import { Database } from 'bun:sqlite';
import { join } from 'path';
import type { AccessRequest, AccessResponse, AccessStatus } from './types';

const app = new Hono();

// Persistence: SQLite
const dbPath = join(import.meta.dir, '../sentinel.db');
const db = new Database(dbPath);

// Initialize schema
db.run(`
  CREATE TABLE IF NOT EXISTS requests (
    id TEXT PRIMARY KEY,
    agent_id TEXT,
    resource_id TEXT,
    intent TEXT,
    status TEXT,
    response TEXT,
    created_at TEXT
  )
`);

// Secret key for dev
const API_TOKEN = 'sentinel_dev_key';

// Middleware: Logger & Auth
app.use('/v1/*', bearerAuth({ token: API_TOKEN }));

app.post('/v1/access/request', async (c) => {
  try {
    const body = await c.req.json<AccessRequest>();
    const requestId = `req_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();
    
    // 1. Audit Logging (The "Intent")
    console.log(`[AUDIT] Request from ${body.agent_id} for ${body.resource_id}`);
    console.log(`[AUDIT] Intent: ${body.intent.summary} (${body.intent.task_id})`);

    // 2. Policy Engine (Mock)
    let status: AccessStatus = 'APPROVED';
    let response: AccessResponse = {
      request_id: requestId,
      status: 'APPROVED'
    };

    if (body.resource_id.includes('prod') || body.resource_id.includes('sensitive')) {
      status = 'PENDING_APPROVAL';
      response = {
        request_id: requestId,
        status: 'PENDING_APPROVAL',
        message: 'This resource requires human approval. Check status later.',
        polling_url: `/v1/access/requests/${requestId}`
      };
    } else if (body.resource_id.includes('forbidden')) {
      status = 'DENIED';
      response = {
        request_id: requestId,
        status: 'DENIED',
        reason: 'Policy Violation: Blocked by static policy.'
      };
    } else {
      // Approved
      response.secret = {
        type: 'dummy_secret',
        value: `super_secret_value_for_${body.resource_id}`,
        expires_at: new Date(Date.now() + body.ttl_seconds * 1000).toISOString()
      };
    }

    // Store state
    const insert = db.prepare(`
      INSERT INTO requests (id, agent_id, resource_id, intent, status, response, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(requestId, body.agent_id, body.resource_id, JSON.stringify(body.intent), status, JSON.stringify(response), now);

    return c.json(response, status === 'DENIED' ? 403 : status === 'PENDING_APPROVAL' ? 202 : 200);

  } catch (err) {
    console.error(err);
    return c.json({ error: 'Invalid Request' }, 400);
  }
});

app.get('/v1/access/requests/:id', (c) => {
  const id = c.req.param('id');
  const record = db.query('SELECT * FROM requests WHERE id = ?').get(id) as any;

  if (!record) {
    return c.json({ error: 'Request not found' }, 404);
  }
  
  return c.json(JSON.parse(record.response));
});

// --- Admin API ---

// List all requests
app.get('/v1/admin/requests', (c) => {
  const statusFilter = c.req.query('status');
  let query = 'SELECT * FROM requests';
  let params: string[] = [];
  
  if (statusFilter) {
    query += ' WHERE status = ?';
    params.push(statusFilter);
  }
  
  query += ' ORDER BY created_at DESC';
  
  const requests = db.query(query).all(...params);
  
  // Parse payload for each
  const results = requests.map((r: any) => ({
    ...r,
    intent: JSON.parse(r.intent),
    response: JSON.parse(r.response)
  }));
  
  return c.json(results);
});

// Approve request
app.post('/v1/admin/requests/:id/approve', (c) => {
  const id = c.req.param('id');
  const record = db.query('SELECT * FROM requests WHERE id = ?').get(id) as any;

  if (!record) {
    return c.json({ error: 'Request not found' }, 404);
  }

  if (record.status !== 'PENDING_APPROVAL') {
     return c.json({ error: `Cannot approve request with status ${record.status}` }, 400);
  }

  const response = JSON.parse(record.response);
  const resourceId = record.resource_id;

  // Update logic
  const newStatus = 'APPROVED';
  // Standard TTL for admin approval: 1 hour (mock)
  const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();
  
  const newPayload: AccessResponse = {
    request_id: id,
    status: newStatus,
    secret: {
      type: 'dummy_secret',
      value: `super_secret_value_for_${resourceId}`,
      expires_at: expiresAt
    }
  };

  db.prepare('UPDATE requests SET status = ?, response = ? WHERE id = ?').run(newStatus, JSON.stringify(newPayload), id);

  return c.json(newPayload);
});

// Deny request
app.post('/v1/admin/requests/:id/deny', (c) => {
  const id = c.req.param('id');
  const record = db.query('SELECT * FROM requests WHERE id = ?').get(id) as any;

  if (!record) {
    return c.json({ error: 'Request not found' }, 404);
  }

  if (record.status !== 'PENDING_APPROVAL') {
     return c.json({ error: `Cannot deny request with status ${record.status}` }, 400);
  }

  const newStatus = 'DENIED';
  const newPayload: AccessResponse = {
    request_id: id,
    status: newStatus,
    reason: 'Denied by administrator.'
  };

  db.prepare('UPDATE requests SET status = ?, response = ? WHERE id = ?').run(newStatus, JSON.stringify(newPayload), id);

  return c.json(newPayload);
});

export default app;
