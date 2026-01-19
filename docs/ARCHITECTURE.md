# Sentinel Architecture

This document provides a high-level overview of Sentinel's architecture, components, and design decisions.

## Table of Contents

- [System Overview](#system-overview)
- [Core Components](#core-components)
- [Data Flow](#data-flow)
- [API Design](#api-design)
- [Security Model](#security-model)
- [Database Schema](#database-schema)
- [Deployment Architecture](#deployment-architecture)
- [Design Decisions](#design-decisions)

## System Overview

Sentinel is a **secret management system built for AI agents**. Unlike traditional secret managers that focus on human users, Sentinel addresses the unique challenges of autonomous agents:

1. **Intent Transparency**: Agents explain *why* they need access
2. **Audit Trail**: Complete history of who accessed what and why
3. **Human Oversight**: Configurable approval workflows for sensitive resources
4. **Time-Limited Access**: Secrets expire automatically after use

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         AI Agents                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Coding Agent │  │  CEO Agent   │  │ Deploy Agent │   ...   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼──────────────────┼──────────────────┼────────────────┘
          │                  │                  │
          │ Sentinel SDK     │ Sentinel SDK     │ Sentinel SDK
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                    ┌────────▼─────────┐
                    │  REST API        │
                    │  (Hono Server)   │
                    │                  │
                    │  - Auth          │
                    │  - Policy Engine │
                    │  - Request Logic │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  SQLite Database │
                    │                  │
                    │  - Requests      │
                    │  - Audit Log     │
                    └──────────────────┘
                             │
                    ┌────────▼─────────┐
                    │  Admin Interface │
                    │  (Overseer)      │
                    │                  │
                    │  - Review Queue  │
                    │  - Approve/Deny  │
                    │  - Audit Viewer  │
                    └──────────────────┘
```

## Core Components

### 1. Vault Server (`src/server.ts`)

The main REST API server built with [Hono](https://hono.dev/).

**Responsibilities**:
- Handle incoming access requests from agents
- Authenticate requests via bearer token
- Apply policy rules to determine access decisions
- Manage secret lifecycle (creation, expiration)
- Persist requests and audit logs
- Serve admin API for human oversight

**Technology Stack**:
- **Runtime**: Bun
- **Framework**: Hono (lightweight HTTP framework)
- **Database**: SQLite via `bun:sqlite`
- **Authentication**: Bearer token middleware

**Key Endpoints**:
- `POST /v1/access/request` - Request secret access
- `GET /v1/access/requests/:id` - Poll request status
- `GET /v1/admin/requests` - List all requests
- `POST /v1/admin/requests/:id/approve` - Approve request
- `POST /v1/admin/requests/:id/deny` - Deny request

### 2. Client SDK (`skills/sentinel-client/`)

TypeScript library for AI agents to interact with Sentinel.

**Responsibilities**:
- Provide type-safe API for requesting secrets
- Handle authentication (API token management)
- Implement polling logic for pending approvals
- Retry failed requests with exponential backoff
- Provide clear error messages and typed exceptions

**Key Features**:
- Environment variable configuration
- Automatic polling for `PENDING_APPROVAL` status
- TypeScript type safety
- Custom error classes (`SentinelError`, `SentinelNetworkError`, `SentinelTimeoutError`)

**Usage Pattern**:
```typescript
const client = new SentinelClient({ ... });
const result = await client.requestWithPolling({
  resourceId: 'prod_db',
  intent: { task_id, summary, description },
  ttlSeconds: 3600,
});
```

### 3. Overseer (Admin API)

Human-in-the-loop interface for reviewing and approving access requests.

**Current State**: REST API endpoints only
**Planned**: Web-based dashboard UI

**Capabilities**:
- View all pending approval requests
- Review agent intent and context
- Approve or deny requests
- View audit trail
- Filter by status, agent, resource, timeframe

### 4. Policy Engine

Determines whether to approve, deny, or escalate access requests.

**Current Implementation** (MVP):
Simple string-matching rules in `server.ts`:
```typescript
if (resourceId.includes('prod') || resourceId.includes('sensitive')) {
  return 'PENDING_APPROVAL';
} else if (resourceId.includes('forbidden')) {
  return 'DENIED';
} else {
  return 'APPROVED';
}
```

**Planned Enhancements**:
- Integration with policy-as-code systems (OPA, Cedar)
- Resource-specific rules (e.g., DB credentials require approval, API keys auto-approve)
- Time-based policies (e.g., no prod access on weekends without approval)
- Agent-specific policies (trusted agents get more auto-approvals)
- Risk scoring based on intent analysis

## Data Flow

### Request Flow (Success Case)

```
1. Agent needs secret
   ↓
2. Agent calls SDK: client.requestWithPolling(...)
   ↓
3. SDK sends POST /v1/access/request
   ↓
4. Server authenticates bearer token
   ↓
5. Server logs intent to audit trail
   ↓
6. Policy engine evaluates request
   ↓
7a. APPROVED → Return secret immediately
   ↓
8. Agent uses secret for task
   ↓
9. Secret expires after TTL
```

### Request Flow (Requires Approval)

```
1. Agent requests sensitive resource
   ↓
2. SDK sends POST /v1/access/request
   ↓
3. Policy engine returns PENDING_APPROVAL
   ↓
4. Server returns 202 with polling_url
   ↓
5. SDK starts polling GET /v1/access/requests/:id
   ↓
6. Admin reviews request via Overseer
   ↓
7. Admin approves → POST /v1/admin/requests/:id/approve
   ↓
8. Server updates status to APPROVED
   ↓
9. Next poll returns secret
   ↓
10. Agent uses secret
```

### Request Flow (Denied)

```
1. Agent requests forbidden resource
   ↓
2. Policy engine returns DENIED
   ↓
3. Server returns 403 with reason
   ↓
4. SDK throws SentinelError
   ↓
5. Agent handles denial gracefully
```

## API Design

### Request Schema

```typescript
// POST /v1/access/request
{
  "agent_id": "coding-agent-001",
  "resource_id": "aws_prod_credentials",
  "intent": {
    "task_id": "TASK-123",
    "summary": "Deploy v2.0.0 to production",
    "description": "Need AWS credentials to run terraform apply for production deployment"
  },
  "ttl_seconds": 3600
}
```

### Response Schema

```typescript
// APPROVED
{
  "request_id": "req_abc123",
  "status": "APPROVED",
  "secret": {
    "type": "aws_credentials",
    "value": "AKIAIOSFODNN7EXAMPLE",
    "expires_at": "2026-01-18T15:30:00Z"
  }
}

// PENDING_APPROVAL
{
  "request_id": "req_def456",
  "status": "PENDING_APPROVAL",
  "message": "This resource requires human approval",
  "polling_url": "/v1/access/requests/req_def456"
}

// DENIED
{
  "request_id": "req_ghi789",
  "status": "DENIED",
  "reason": "Policy violation: Access to this resource is forbidden"
}
```

### Status Codes

- `200 OK` - Request approved, secret included
- `202 Accepted` - Request pending approval, poll for status
- `403 Forbidden` - Request denied by policy
- `401 Unauthorized` - Invalid/missing bearer token
- `404 Not Found` - Request ID not found
- `400 Bad Request` - Invalid request format

## Security Model

### Authentication

**Current**: Single bearer token (`sentinel_dev_key` for development)

**Production Recommendation**:
- Environment-based tokens (different per environment)
- Per-agent tokens (revocable, auditable)
- Token rotation (automated, scheduled)

**Future Enhancements**:
- mTLS for agent authentication
- JWT tokens with claims
- API key management system

### Authorization

**Policy-Based Access Control**:
1. All requests pass through policy engine
2. Policies evaluate: agent_id, resource_id, intent, time, context
3. Decisions: APPROVED, PENDING_APPROVAL, DENIED

**Intent Validation**:
- Required fields: task_id, summary, description
- Stored for audit trail
- Used for approval decisions

### Secret Lifecycle

```
1. Request Created
   ↓
2. Policy Evaluation
   ↓
3. Approval (auto or manual)
   ↓
4. Secret Generated/Retrieved
   ↓
5. Secret Delivered (with TTL)
   ↓
6. Secret Expires
   ↓
7. Access Revoked
```

**TTL Enforcement**:
- Default: 3600 seconds (1 hour)
- Configurable per request
- Hard expiration (no renewal without new request)
- Expired secrets cannot be retrieved

### Audit Trail

Every request is logged with:
- Request ID (unique identifier)
- Agent ID (who requested)
- Resource ID (what was requested)
- Intent (why it was requested)
- Timestamp (when)
- Status (approved/denied/pending)
- Decision maker (policy or human admin)

**Immutable Log**:
- Requests are never deleted
- Status updates are appended
- Complete history preserved

## Database Schema

### `requests` Table

```sql
CREATE TABLE requests (
  id TEXT PRIMARY KEY,           -- req_abc123
  agent_id TEXT,                 -- coding-agent-001
  resource_id TEXT,              -- aws_prod_credentials
  intent TEXT,                   -- JSON: {task_id, summary, description}
  status TEXT,                   -- APPROVED | PENDING_APPROVAL | DENIED
  response TEXT,                 -- JSON: full response payload
  created_at TEXT                -- ISO 8601 timestamp
);
```

**Indexes** (recommended for production):
```sql
CREATE INDEX idx_status ON requests(status);
CREATE INDEX idx_agent_id ON requests(agent_id);
CREATE INDEX idx_created_at ON requests(created_at);
```

## Deployment Architecture

### Development

```
┌─────────────────┐
│  Local Machine  │
│                 │
│  Sentinel       │
│  Port 3000      │
│                 │
│  sentinel.db    │
└─────────────────┘
```

### Production (Recommended)

```
┌──────────────────────────────────────────┐
│              Load Balancer               │
│              (with TLS)                  │
└────────────────┬─────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼───┐    ┌───▼───┐    ┌───▼───┐
│Server1│    │Server2│    │Server3│
│       │    │       │    │       │
│Sentinel    │Sentinel    │Sentinel
└───┬───┘    └───┬───┘    └───┬───┘
    │            │            │
    └────────────┼────────────┘
                 │
         ┌───────▼────────┐
         │  Shared SQLite │
         │  (or Postgres) │
         └────────────────┘
```

**Key Components**:
- **TLS Termination**: Reverse proxy (nginx, Caddy)
- **Load Balancing**: Multiple Sentinel instances
- **Shared Database**: SQLite on shared volume or Postgres
- **Monitoring**: Prometheus + Grafana
- **Logging**: Centralized logging (ELK, Loki)

### Docker Deployment

See `docker-compose.yml` for single-node deployment.

For production, consider:
- Docker Swarm or Kubernetes
- Volume management for SQLite
- Health checks and auto-restart
- Resource limits (CPU, memory)

## Design Decisions

### Why SQLite?

**Pros**:
- Zero configuration
- Serverless (no separate DB process)
- Perfect for MVP and small-medium deployments
- ACID transactions
- Fast for read-heavy workloads

**Cons**:
- Limited concurrency (single writer)
- No network access (must be on same filesystem)
- Not ideal for multi-region deployments

**Migration Path**: Schema is simple and can migrate to Postgres/MySQL for larger deployments.

### Why Bun?

- Fast startup time (critical for CLI tools)
- Built-in SQLite support
- Native TypeScript support
- Great developer experience
- Growing ecosystem

### Why Hono?

- Lightweight and fast
- TypeScript-first
- Great middleware ecosystem
- Multi-runtime support (Bun, Node, Deno, Cloudflare Workers)

### Why Intent-Based Access?

Traditional secret managers answer "what" (what secret do you need?).

Sentinel adds "why" (why do you need it?):
- **Audit**: Humans can review and understand agent actions
- **Trust**: Transparency builds confidence in AI systems
- **Debugging**: Intent helps diagnose issues
- **Compliance**: Required for regulatory environments

### Why Human-in-the-Loop?

AI agents can be unpredictable. For sensitive operations:
- Human approval provides safety net
- Policies can evolve based on observed patterns
- Builds organizational trust in AI systems
- Required for certain compliance frameworks

## Future Enhancements

### Short Term (v1.1 - v1.3)
- Web-based admin dashboard
- PostgreSQL support
- Advanced policy language (OPA/Cedar)
- Slack/Discord notifications

### Medium Term (v2.0+)
- Multi-region support
- Vault backend integration (HashiCorp Vault, AWS Secrets Manager)
- RBAC and multi-user admin
- OpenTelemetry observability
- Secret rotation automation

### Long Term (v3.0+)
- ML-based anomaly detection
- Risk scoring and automatic escalation
- Integration with SIEM systems
- Compliance reporting (SOC 2, HIPAA, PCI)
- Agent identity verification (beyond tokens)

---

## Additional Resources

- [README.md](../README.md) - Getting started guide
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
- [SECURITY.md](../SECURITY.md) - Security best practices
- [API Reference](https://sentinel.subcode.ventures/docs/api) - Complete API documentation (coming soon)
