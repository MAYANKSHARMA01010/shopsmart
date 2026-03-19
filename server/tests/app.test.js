const request = require('supertest');
const app = require('../src/server');
const prisma = require('../src/models/prismaClient');

describe('ShopSmart Backend API', () => {
  
  afterAll(async () => {
    // Close Prisma connection after all tests to allow Jest to exit clearly
    await prisma.$disconnect();
  });

  describe('GET /api/health', () => {
    it('should return 200 and status ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('database', 'PostgreSQL');
    });
  });

  describe('GET /api/products', () => {
    it('should return 200 and an array of products', async () => {
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      
      // If there are products, check their shape
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('id');
        expect(res.body[0]).toHaveProperty('name');
        expect(res.body[0]).toHaveProperty('price');
      }
    });

    it('should return 404 for a non-existent product ID', async () => {
      const res = await request(app).get('/api/products/999999');
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error', 'Product not found');
    });
  });
});
