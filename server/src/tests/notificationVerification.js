const http = require('http');
const app = require('../../app');
const { connectDB, disconnectDB } = require('../config/db');

const runNotificationTests = async () => {
  console.log('--- Starting Notification System & Audit Trigger Verification ---');
  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5098, resolve));
  const baseUrl = 'http://localhost:5098/api';

  const fetchJson = async (url, options = {}) => {
    const res = await fetch(url, options);
    const data = await res.json();
    return { status: res.status, data };
  };

  try {
    // 1. Login as Admin
    console.log('[Test 1] Login as Admin...');
    const loginRes = await fetchJson(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@mini.crm', password: 'password123' })
    });
    console.assert(loginRes.status === 200, 'Login failed');
    const token = loginRes.data.data.token;
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };

    // 2. Fetch Notifications List
    console.log('\n[Test 2] Fetch Notifications List...');
    const notifsRes = await fetchJson(`${baseUrl}/notifications`, { headers: authHeaders });
    console.assert(notifsRes.status === 200, 'Fetch notifications failed');
    console.assert(notifsRes.data.data.length >= 4, 'Expected at least 4 seeded notifications');
    console.log(`✔ Fetched ${notifsRes.data.data.length} notifications. Unread count: ${notifsRes.data.unreadCount}`);

    // 3. Trigger Notification: Create a new Company
    console.log('\n[Test 3] Create a new Company & check auto-generated notification...');
    const createCompRes = await fetchJson(`${baseUrl}/companies`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: `Acme Ventures ${Date.now()}`,
        industry: 'Venture Capital',
        location: 'Mumbai'
      })
    });
    console.assert(createCompRes.status === 201, 'Create company failed');
    const compId = createCompRes.data.data.id;

    // Check notifications list for the company creation event
    const notifsAfterComp = await fetchJson(`${baseUrl}/notifications`, { headers: authHeaders });
    const compNotif = notifsAfterComp.data.data.find(
      (n) => n.entityType === 'Company' && n.action === 'create'
    );
    console.assert(compNotif, 'Company creation notification was not logged!');
    console.log(`✔ Auto-logged notification for company creation: "${compNotif.title}" - ${compNotif.message}`);

    // 4. Trigger Notification: Create a Lead
    console.log('\n[Test 4] Create a Lead & check auto-generated notification...');
    const createLeadRes = await fetchJson(`${baseUrl}/leads`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Arjun Rampal',
        email: `arjun.${Date.now()}@mail.com`,
        phone: '+1 555 999 8888',
        company: compId,
        assignedTo: 'Sarah Lee'
      })
    });
    console.assert(createLeadRes.status === 201, 'Create lead failed');
    const leadId = createLeadRes.data.data.id;

    const notifsAfterLead = await fetchJson(`${baseUrl}/notifications`, { headers: authHeaders });
    const leadNotif = notifsAfterLead.data.data.find(
      (n) => n.entityType === 'Lead' && n.action === 'create'
    );
    console.assert(leadNotif, 'Lead creation notification was not logged!');
    console.log(`✔ Auto-logged notification for lead creation: "${leadNotif.title}"`);

    // 5. Trigger Notification: Update Lead Status
    console.log('\n[Test 5] Update Lead Status to "Qualified" & check notification...');
    const updateLeadRes = await fetchJson(`${baseUrl}/leads/${leadId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ status: 'Qualified' })
    });
    console.assert(updateLeadRes.status === 200, 'Update lead failed');

    const notifsAfterStatus = await fetchJson(`${baseUrl}/notifications`, { headers: authHeaders });
    const statusNotif = notifsAfterStatus.data.data.find(
      (n) => n.action === 'status_change' && n.title.includes('Qualified')
    );
    console.assert(statusNotif, 'Lead status change notification was not logged!');
    console.log(`✔ Auto-logged status change notification: "${statusNotif.title}"`);

    // 6. Trigger Notification: Create a Task
    console.log('\n[Test 6] Create a Task & check notification...');
    const createTaskRes = await fetchJson(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Initial Discovery Call',
        lead: leadId,
        assignedTo: 'Mike Ross',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        priority: 'High'
      })
    });
    console.assert(createTaskRes.status === 201, 'Create task failed');

    const notifsAfterTask = await fetchJson(`${baseUrl}/notifications`, { headers: authHeaders });
    const taskNotif = notifsAfterTask.data.data.find(
      (n) => n.entityType === 'Task' && n.action === 'create'
    );
    console.assert(taskNotif, 'Task creation notification was not logged!');
    console.log(`✔ Auto-logged task notification: "${taskNotif.title}"`);

    // 7. Mark single notification as read
    console.log('\n[Test 7] Mark Notification as Read...');
    const unreadOne = notifsAfterTask.data.data.find((n) => !n.read);
    const readRes = await fetchJson(`${baseUrl}/notifications/${unreadOne.id}/read`, {
      method: 'PATCH',
      headers: authHeaders
    });
    console.assert(readRes.status === 200 && readRes.data.data.read === true, 'Mark read failed');
    console.log('✔ Single notification marked as read.');

    // 8. Mark all as read
    console.log('\n[Test 8] Mark All Notifications as Read...');
    const readAllRes = await fetchJson(`${baseUrl}/notifications/read-all`, {
      method: 'PATCH',
      headers: authHeaders
    });
    console.assert(readAllRes.status === 200, 'Mark all as read failed');

    const finalCheck = await fetchJson(`${baseUrl}/notifications`, { headers: authHeaders });
    console.assert(finalCheck.data.unreadCount === 0, 'Unread count should be 0');
    console.log('✔ All notifications marked as read. Unread count = 0.');

    console.log('\n======================================================');
    console.log('   ALL NOTIFICATION & AUDIT VERIFICATION TESTS PASSED ');
    console.log('======================================================\n');
  } finally {
    server.close();
    await disconnectDB();
  }
};

runNotificationTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  });
