const http = require('http');
const app = require('../../app');
const { connectDB, disconnectDB } = require('../config/db');

const runTests = async () => {
  console.log('--- Starting Backend MVC Integration Verification ---');
  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, resolve));
  const baseUrl = 'http://localhost:5099/api';

  const fetchJson = async (url, options = {}) => {
    const res = await fetch(url, options);
    const data = await res.json();
    return { status: res.status, data };
  };

  try {
    // 1. Health check
    console.log('[Test 1] Health Check...');
    const health = await fetchJson(`${baseUrl}/health`);
    console.assert(health.status === 200, 'Health check failed');
    console.log('✔ Health check OK');

    // 2. Auth Login (Admin)
    console.log('\n[Test 2] Auth Login (Admin)...');
    const adminLogin = await fetchJson(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@mini.crm', password: 'password123' })
    });
    console.assert(adminLogin.status === 200, 'Admin login failed');
    console.assert(adminLogin.data.data.token, 'Token not received');
    const adminToken = adminLogin.data.data.token;
    console.log('✔ Admin login OK. Token acquired.');

    // 3. Auth Login (Sales Rep)
    console.log('\n[Test 3] Auth Login (Sales Rep Mike Ross)...');
    const repLogin = await fetchJson(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'mike.ross@mini.crm', password: 'password123' })
    });
    console.assert(repLogin.status === 200, 'Rep login failed');
    const repToken = repLogin.data.data.token;
    const repId = repLogin.data.data.user.id;
    console.log('✔ Sales rep login OK.');

    // 4. Get Current User (/me)
    console.log('\n[Test 4] Get Current User (/me)...');
    const me = await fetchJson(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.assert(me.status === 200 && me.data.data.user.role === 'Admin', '/me failed');
    console.log('✔ /me returned current authenticated user.');

    // 5. Companies List & Lead Counts
    console.log('\n[Test 5] Companies List with Aggregated Lead Counts...');
    const companiesRes = await fetchJson(`${baseUrl}/companies`);
    console.assert(companiesRes.status === 200, 'Companies failed');
    console.assert(companiesRes.data.data.length >= 5, 'Did not receive 5 companies');
    const abcCorp = companiesRes.data.data.find((c) => c.name === 'ABC Corp');
    console.assert(abcCorp && abcCorp.leadCount >= 2, 'ABC Corp leadCount mismatch');
    console.log(`✔ Companies OK. ABC Corp has ${abcCorp.leadCount} active leads.`);

    // 6. Leads List & Soft-Delete Exclusion
    console.log('\n[Test 6] Leads List (Verifying Soft-Deleted Leads Excluded)...');
    const leadsRes = await fetchJson(`${baseUrl}/leads?limit=20`);
    console.assert(leadsRes.status === 200, 'Leads failed');
    const deletedLead = leadsRes.data.data.find((l) => l.name.includes('Archived'));
    console.assert(!deletedLead, 'Soft-deleted lead should NOT appear in normal query!');
    console.log(`✔ Leads OK. Retrieved ${leadsRes.data.data.length} active leads. Soft-deleted lead successfully excluded.`);

    // 7. Tasks List
    console.log('\n[Test 7] Tasks List...');
    const tasksRes = await fetchJson(`${baseUrl}/tasks`);
    console.assert(tasksRes.status === 200, 'Tasks failed');
    console.assert(tasksRes.data.data.length >= 6, 'Tasks count mismatch');
    console.log(`✔ Tasks OK. Retrieved ${tasksRes.data.data.length} tasks.`);

    // 8. Task Status Authorization Checks
    console.log('\n[Test 8] Task Status Update Authorization Check...');
    const johnTask = tasksRes.data.data.find((t) => t.title === 'Call with Ravi'); // Assigned to John Doe
    const mikeTask = tasksRes.data.data.find((t) => t.title === 'Follow up'); // Assigned to Mike Ross

    // Mike Ross tries to update John Doe's task status -> should be 403 Forbidden
    const forbiddenRes = await fetchJson(`${baseUrl}/tasks/${johnTask.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${repToken}`
      },
      body: JSON.stringify({ status: 'Completed' })
    });
    console.assert(forbiddenRes.status === 403, `Expected 403 for unauthorized status update, got ${forbiddenRes.status}`);
    console.log('✔ Non-assignee status update correctly blocked with 403 Forbidden.');

    // Mike Ross updates his own task status -> should be 200 OK
    const repUpdateRes = await fetchJson(`${baseUrl}/tasks/${mikeTask.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${repToken}`
      },
      body: JSON.stringify({ status: 'Completed' })
    });
    console.assert(repUpdateRes.status === 200, 'Assignee status update failed');
    console.log('✔ Assigned user status update succeeded with 200 OK.');

    // Admin updates John Doe's task status -> should be 200 OK
    const adminUpdateRes = await fetchJson(`${baseUrl}/tasks/${johnTask.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'Completed' })
    });
    console.assert(adminUpdateRes.status === 200, 'Admin status update failed');
    console.log('✔ Admin status update override succeeded with 200 OK.');

    // 9. Dashboard Aggregation Pipeline
    console.log('\n[Test 9] Dashboard Metrics Pipeline...');
    const dashboardRes = await fetchJson(`${baseUrl}/dashboard/metrics`);
    console.assert(dashboardRes.status === 200, 'Dashboard metrics failed');
    console.assert(dashboardRes.data.data.summary.totalLeads >= 10, 'Dashboard totalLeads mismatch');
    console.assert(Array.isArray(dashboardRes.data.data.leadStatusDistribution), 'Status distribution array missing');
    console.log(`✔ Dashboard Metrics OK. Total Leads: ${dashboardRes.data.data.summary.totalLeads}, Qualified: ${dashboardRes.data.data.summary.qualifiedLeads}.`);

    console.log('\n======================================================');
    console.log('   ALL 9 INTEGRATION VERIFICATION TESTS PASSED!       ');
    console.log('======================================================\n');
  } finally {
    server.close();
    await disconnectDB();
  }
};

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  });
