const request = require('supertest');
const app = require('../../app');

describe('API Foundation & Healthcheck Suite', () => {
  it('GET /api/health should return 200 with operational status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
    expect(res.body.data.service).toBe('LeadFlow CRM API');
  });

  it('GET /api/non-existent-route should return 404 with standardized error envelope', async () => {
    const res = await request(app).get('/api/non-existent-route');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ROUTE_NOT_FOUND');
    expect(res.body.error.message).toContain('not found');
  });
});
