/**
 * Server Integration Tests
 * Framework: Vitest + Supertest
 *
 * Migrated from Mocha/Chai (M1 — Vitest migration milestone).
 * Test behaviour is identical to the previous suite.
 */
import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../src/server';

describe('ShopSmart — Integration Tests (API + Database)', () => {

  describe('GET /api/health', () => {
    it('should return 200 with status ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
    });

    it('should include timestamp and database/redis status fields', async () => {
      const res = await request(app).get('/api/health');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('database');
      expect(res.body).toHaveProperty('redis');
    });
  });

  describe('GET /api/products', () => {
    it('should return 200 and an array of products', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return 404 for a non-existent product ID', async () => {
      const res = await request(app).get('/api/products/999999');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Product not found');
    });
  });

  describe('POST /api/products (Validation)', () => {
    it('should return 400 with validation errors for invalid product data', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({ name: '', price: -10 });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('status', 'fail');
      expect(res.body).toHaveProperty('errors');
      expect(Array.isArray(res.body.errors)).toBe(true);
    });
  });

});
