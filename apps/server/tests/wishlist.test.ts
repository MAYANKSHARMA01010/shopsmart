import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../src/server';
import prisma from '../src/shared/config/database';
import jwt from 'jsonwebtoken';

const generateAccessToken = (payload: any) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET || 'default-access-secret', { expiresIn: '15m' });
};

describe('ShopSmart — Wishlist API Tests', () => {
  let userToken: string;
  let testProductId: string;

  beforeAll(async () => {
    // Ensure clean state (delete in FK dependency order)
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
        name: 'Wishlist Tester',
        username: 'wishlisttester',
        email: 'wishlist@example.com',
        password: 'hashedpassword',
        role: 'CUSTOMER',
      },
    });
    userToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });

    // 2. Create a Category
    const category = await prisma.category.create({
      data: { name: 'Wishlist Category', slug: 'wishlist-category' },
    });

    // 3. Create a Product
    const product = await prisma.product.create({
      data: {
        name: 'Wishlist Test Product',
        slug: 'wishlist-test-product',
        basePrice: 199.99,
        stock: 10,
        categoryId: category.id,
        isVisible: true,
      },
    });
    testProductId = product.id;
  });

  afterAll(async () => {
    await prisma.wishlist.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    await prisma.category.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/v1/wishlist/:productId', () => {
    it('should add a product to the wishlist', async () => {
      const res = await request(app)
        .post(`/api/v1/wishlist/${testProductId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.productId).toBe(testProductId);
    });

    it('should return existing entry if product is already in wishlist', async () => {
      const res = await request(app)
        .post(`/api/v1/wishlist/${testProductId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.productId).toBe(testProductId);
    });

    it('should return 401 if user is not authenticated', async () => {
      const res = await request(app).post(`/api/v1/wishlist/${testProductId}`);
      expect(res.status).toBe(401);
    });

    it('should return 404 if product does not exist', async () => {
      const res = await request(app)
        .post('/api/v1/wishlist/non-existent-product-id')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/v1/wishlist', () => {
    it('should retrieve the user wishlist', async () => {
      const res = await request(app)
        .get('/api/v1/wishlist')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].product.name).toBe('Wishlist Test Product');
    });
  });

  describe('DELETE /api/v1/wishlist/:productId', () => {
    it('should remove a product from the wishlist', async () => {
      const res = await request(app)
        .delete(`/api/v1/wishlist/${testProductId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);

      const checkRes = await request(app)
        .get('/api/v1/wishlist')
        .set('Authorization', `Bearer ${userToken}`);
      expect(checkRes.body.data.length).toBe(0);
    });

    it('should return 404 when removing a product not in the wishlist', async () => {
      const res = await request(app)
        .delete(`/api/v1/wishlist/${testProductId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/wishlist', () => {
    it('should clear the entire wishlist', async () => {
      // Re-add to clear
      await request(app)
        .post(`/api/v1/wishlist/${testProductId}`)
        .set('Authorization', `Bearer ${userToken}`);

      const res = await request(app)
        .delete('/api/v1/wishlist')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);

      const checkRes = await request(app)
        .get('/api/v1/wishlist')
        .set('Authorization', `Bearer ${userToken}`);
      expect(checkRes.body.data.length).toBe(0);
    });
  });
});
