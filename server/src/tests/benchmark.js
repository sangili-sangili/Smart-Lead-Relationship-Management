const http = require('http');
const app = require('../../app');
const { connectDB, disconnectDB } = require('../config/db');

const benchmark = async () => {
  console.log('===============================================================');
  console.log('      LeadFlow CRM Server Query Performance Benchmark          ');
  console.log('===============================================================');

  await connectDB();
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5097, resolve));
  const baseUrl = 'http://localhost:5097/api';

  // 1. Login to obtain JWT
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@mini.crm', password: 'password123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  const endpoints = [
    { name: 'GET /api/leads (default page)', url: `${baseUrl}/leads` },
    { name: 'GET /api/leads?status=Qualified (index-filtered)', url: `${baseUrl}/leads?status=Qualified` },
    { name: 'GET /api/leads?search=Ravi (search query)', url: `${baseUrl}/leads?search=Ravi` },
    { name: 'GET /api/companies (with lead count aggregation)', url: `${baseUrl}/companies` },
    { name: 'GET /api/tasks (due date sorted)', url: `${baseUrl}/tasks` },
    { name: 'GET /api/dashboard/metrics (single-pass facet aggregation)', url: `${baseUrl}/dashboard/metrics` },
    { name: 'GET /api/notifications (feed with unread count)', url: `${baseUrl}/notifications` }
  ];

  const results = [];
  const ITERATIONS = 10;

  for (const ep of endpoints) {
    const latencies = [];
    let payloadBytes = 0;

    for (let i = 0; i < ITERATIONS; i++) {
      const start = process.hrtime.bigint();
      const res = await fetch(ep.url, { headers: authHeaders });
      const text = await res.text();
      const end = process.hrtime.bigint();

      const ms = Number(end - start) / 1e6;
      latencies.push(ms);
      payloadBytes = text.length;
    }

    latencies.sort((a, b) => a - b);
    const avg = latencies.reduce((sum, val) => sum + val, 0) / latencies.length;
    const p50 = latencies[Math.floor(latencies.length * 0.5)];
    const p95 = latencies[Math.floor(latencies.length * 0.9)];
    const min = latencies[0];
    const max = latencies[latencies.length - 1];

    results.push({
      Endpoint: ep.name,
      'Avg (ms)': avg.toFixed(2),
      'P50 (ms)': p50.toFixed(2),
      'P95 (ms)': p95.toFixed(2),
      'Min (ms)': min.toFixed(2),
      'Payload (bytes)': payloadBytes
    });
  }

  console.table(results);
  console.log('===============================================================\n');

  server.close();
  await disconnectDB();
};

benchmark()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Benchmark error:', err);
    process.exit(1);
  });
