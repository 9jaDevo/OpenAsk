import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server.js';

describe('Health endpoint', () => {
    it('returns health status with database info', async () => {
        const res = await request(app).get('/health');
        // May return 200 (ok) or 503 (degraded) depending on DB connection
        expect([200, 503]).toContain(res.status);
        expect(res.body).toHaveProperty('status');
        expect(res.body).toHaveProperty('version', '1.0.0');
        expect(res.body).toHaveProperty('database');
        expect(res.body.database).toHaveProperty('connected');
        expect(res.body.database).toHaveProperty('state');
    });
});
