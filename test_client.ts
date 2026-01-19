const BASE_URL = 'http://localhost:3000';
const TOKEN = 'sentinel_dev_key';

async function requestAccess(resourceId: string) {
  console.log(`\n--- Requesting access for: ${resourceId} ---`);
  
  const response = await fetch(`${BASE_URL}/v1/access/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    },
    body: JSON.stringify({
      agent_id: 'test_agent_01',
      resource_id: resourceId,
      intent: {
        summary: 'Running automated tests',
        description: 'Testing the Sentinel Handshake protocol implementation',
        task_id: 'test_run_1'
      },
      ttl_seconds: 60
    })
  });

  const data = await response.json();
  console.log(`Status: ${response.status}`);
  console.log('Response:', JSON.stringify(data, null, 2));
  return data;
}

async function run() {
  // 1. Happy Path
  await requestAccess('dev_db_readonly');

  // 2. Pending Path (Prod)
  const pending = await requestAccess('prod_db_write');

  // 3. Denied Path
  await requestAccess('forbidden_keys');
  
  // 4. Poll Pending (Just to check endpoint)
  if (pending.polling_url) {
    console.log(`\n--- Polling: ${pending.polling_url} ---`);
    const pollRes = await fetch(`${BASE_URL}${pending.polling_url}`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    console.log('Poll Response:', JSON.stringify(await pollRes.json(), null, 2));
  }
}

run().catch(console.error);
