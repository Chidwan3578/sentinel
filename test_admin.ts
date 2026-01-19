const BASE_URL = 'http://localhost:3000';
const TOKEN = 'sentinel_dev_key';

async function requestAccess(resourceId: string) {
  console.log(`\n[Client] Requesting access for: ${resourceId}`);
  const response = await fetch(`${BASE_URL}/v1/access/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    },
    body: JSON.stringify({
      agent_id: 'admin_test_agent',
      resource_id: resourceId,
      intent: {
        summary: 'Testing admin flow',
        description: 'Verifying approval workflow',
        task_id: 'admin_test_1'
      },
      ttl_seconds: 300
    })
  });
  const data = await response.json();
  console.log(`[Client] Status: ${response.status}`);
  return data;
}

async function listRequests(status?: string) {
  console.log(`\n[Admin] Listing requests${status ? ` (status=${status})` : ''}`);
  const url = status 
    ? `${BASE_URL}/v1/admin/requests?status=${status}`
    : `${BASE_URL}/v1/admin/requests`;
    
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${TOKEN}` }
  });
  const data = await response.json();
  console.log(`[Admin] Found ${data.length} requests`);
  return data;
}

async function approveRequest(requestId: string) {
  console.log(`\n[Admin] Approving request: ${requestId}`);
  const response = await fetch(`${BASE_URL}/v1/admin/requests/${requestId}/approve`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}` }
  });
  const data = await response.json();
  console.log(`[Admin] Approve Response:`, JSON.stringify(data, null, 2));
  return data;
}

async function denyRequest(requestId: string) {
  console.log(`\n[Admin] Denying request: ${requestId}`);
  const response = await fetch(`${BASE_URL}/v1/admin/requests/${requestId}/deny`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}` }
  });
  const data = await response.json();
  console.log(`[Admin] Deny Response:`, JSON.stringify(data, null, 2));
  return data;
}

async function pollRequest(requestId: string) {
  console.log(`\n[Client] Polling request: ${requestId}`);
  const response = await fetch(`${BASE_URL}/v1/access/requests/${requestId}`, {
    headers: { 'Authorization': `Bearer ${TOKEN}` }
  });
  const data = await response.json();
  console.log(`[Client] Poll Response:`, JSON.stringify(data, null, 2));
  return data;
}

async function run() {
  // 1. Submit a pending request
  const pendingReq = await requestAccess('prod_server_01');
  if (pendingReq.status !== 'PENDING_APPROVAL') {
    throw new Error('Expected PENDING_APPROVAL');
  }
  const reqId = pendingReq.request_id;

  // 2. Verify it shows up in admin list
  const allRequests = await listRequests('PENDING_APPROVAL');
  const found = allRequests.find((r: any) => r.id === reqId);
  if (!found) {
    throw new Error('Request not found in admin list');
  }
  console.log('Verified request is in pending list.');

  // 3. Approve it
  await approveRequest(reqId);

  // 4. Verify client sees approval
  const approvedState = await pollRequest(reqId);
  if (approvedState.status !== 'APPROVED' || !approvedState.secret) {
    throw new Error('Request should be APPROVED with secret');
  }
  console.log('Verified request is approved and secret is available.');

  // 5. Submit another request to deny
  const denyReq = await requestAccess('prod_server_02');
  const denyId = denyReq.request_id;

  // 6. Deny it
  await denyRequest(denyId);

  // 7. Verify client sees denial
  const deniedState = await pollRequest(denyId);
  if (deniedState.status !== 'DENIED' || !deniedState.reason) {
    throw new Error('Request should be DENIED with reason');
  }
  console.log('Verified request is denied.');

  console.log('\nAll admin tests passed!');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
