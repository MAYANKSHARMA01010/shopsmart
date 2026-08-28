import request from 'supertest';
import { env } from '../src/shared/config/env';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../src/server';
import prisma from '../src/shared/config/database';
import jwt from 'jsonwebtoken';

const generateAccessToken = (payload: any) => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
};

describe('ShopSmart — Favorites API Tests', () => {
  let userToken: string;
  let testProductId: string;

  beforeAll(async () => {
    // Clean state
    await prisma.favorite.deleteMany();
    await prisma.wishlist.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    await prisma.category.deleteMany();

    // 1. Create a User
    const user = await prisma.user.create({
      data: {
        name: 'Favorites Tester',
        username: 'favtester',
        email: 'favorites@example.com',
        password: 'hashedpassword',
        role: 'CUSTOMER',
      },
    });
    userToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });

    // 2. Create a Category
    const category = await prisma.category.create({
      data: { name: 'Favorites Category', slug: 'favorites-category' },
    });

    // 3. Create a Product
    const product = await prisma.product.create({
      data: {
        name: 'Favorites Test Product',
        slug: 'favorites-test-product',
        basePrice: 299.99,
        stock: 15,
        categoryId: category.id,
        isVisible: true,
      },
    });
    testProductId = product.id;
  });

  afterAll(async () => {
    await prisma.favorite.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    await prisma.category.deleteMany();
  });

  describe('POST /api/v1/favorites/:productId', () => {
    it('should add a product to favorites', async () => {
      const res = await request(app)
        .post(`/api/v1/favorites/${testProductId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.productId).toBe(testProductId);
    });

    it('should return existing entry if product is already in favorites', async () => {
      const res = await request(app)
        .post(`/api/v1/favorites/${testProductId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.productId).toBe(testProductId);
    });

    it('should return 401 if user is not authenticated', async () => {
      const res = await request(app)
        .post(`/api/v1/favorites/${testProductId}`);
      expect(res.status).toBe(401);
    });

    it('should return 404 if product does not exist', async () => {
      const res = await request(app)
        .post('/api/v1/favorites/non-existent-product-id')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/v1/favorites', () => {
    it('should retrieve the user favorites', async () => {
      const res = await request(app)
        .get('/api/v1/favorites')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].product.name).toBe('Favorites Test Product');
    });
  });

  describe('DELETE /api/v1/favorites/:productId', () => {
    it('should remove a product from favorites', async () => {
      const res = await request(app)
        .delete(`/api/v1/favorites/${testProductId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);

      const checkRes = await request(app)
        .get('/api/v1/favorites')
        .set('Authorization', `Bearer ${userToken}`);
      expect(checkRes.body.data.length).toBe(0);
    });

    it('should return 404 when removing a product not in favorites', async () => {
      const res = await request(app)
        .delete(`/api/v1/favorites/${testProductId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/favorites', () => {
    it('should clear all user favorites', async () => {
      await request(app)
        .post(`/api/v1/favorites/${testProductId}`)
        .set('Authorization', `Bearer ${userToken}`);

      const res = await request(app)
        .delete('/api/v1/favorites')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);

      const checkRes = await request(app)
        .get('/api/v1/favorites')
        .set('Authorization', `Bearer ${userToken}`);
      expect(checkRes.body.data.length).toBe(0);
    });
  });
});
