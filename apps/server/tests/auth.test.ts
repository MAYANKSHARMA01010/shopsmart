import request from 'supertest';
import { describe, it, expect, vi } from 'vitest';
import crypto from 'crypto';
import app from '../src/server';
import prisma from '../src/shared/config/database';


describe('ShopSmart — Auth Integration Tests', () => {
  const testEmail = `user-${Math.random().toString(36).substring(7)}@example.com`;
  const testUsername = `user_${Math.random().toString(36).substring(7)}`;
  const testPassword = 'Password123!';
  const testName = 'Test User';

  let accessToken: string;
  let refreshToken: string;

  describe('POST /api/auth/register', () => {
    it('should register a new user and return tokens', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: testName,
          email: testEmail,
          username: testUsername,
          password: testPassword,
        });

      console.log('Register Response:', res.body);
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user).toHaveProperty('email', testEmail);
      expect(res.body.data.user).toHaveProperty('username', testUsername);
      expect(res.body.data.user).not.toHaveProperty('password');

      // Verify cart was created
      const cart = await prisma.cart.findUnique({
        where: { userId: res.body.data.user.id },
      });
      expect(cart).not.toBeNull();
    });

    it('should auto-derive username if not provided', async () => {
      const email = `auto-${Math.random().toString(36).substring(7)}@example.com`;
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Auto User',
          email: email,
          password: testPassword,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user).toHaveProperty('username');
      expect(res.body.data.user.username).toBe(email.split('@')[0]);
    });

    it('should return 409 if email already registered', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: testName,
          email: testEmail,
          password: testPassword,
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if password is weak', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: testName,
          email: `weak-${Date.now()}@example.com`,
          password: '123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should log in successfully with email and password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          identifier: testEmail,
          password: testPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');

      accessToken = res.body.data.accessToken;
      refreshToken = res.body.data.refreshToken;
    });

    it('should log in successfully with username and password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          identifier: testUsername,
          password: testPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should return 401 for incorrect password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          identifier: testEmail,
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user info when authenticated', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user).toHaveProperty('email', testEmail);
    });

    it('should return 401 when access token is missing', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update user profile details', async () => {
      const updatedName = 'Updated Name';
      const res = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: updatedName,
          phone: '+919876543210',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.user).toHaveProperty('name', updatedName);
      expect(res.body.data.user).toHaveProperty('phone', '+919876543210');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token using a valid refresh token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');

      // Update tokens
      accessToken = res.body.data.accessToken;
      refreshToken = res.body.data.refreshToken;
    });

    it('should return 401 if refresh token is rotated/revoked', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should log out successfully and revoke refresh token', async () => {
      // Do a fresh login to get a valid refresh token (avoids ordering issues with token rotation above)
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ identifier: testEmail, password: testPassword });
      const freshRefreshToken = loginRes.body.data.refreshToken;

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken: freshRefreshToken });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Logged out successfully');

      // Refreshing with the revoked token should now fail
      const refreshRes = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: freshRefreshToken });

      expect(refreshRes.status).toBe(401);
    });
  });

  describe('OTP Verification Flow (5-Minute Expiry & One-Time Use)', () => {
    it('should generate a 5-minute expiring OTP for email verification and verify it', async () => {
      const randomSpy = vi.spyOn(crypto, 'randomInt').mockReturnValue(654321 as never);

      // 1. Send OTP
      const sendRes = await request(app)
        .post('/api/v1/auth/send-email-otp')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(sendRes.status).toBe(200);
      expect(sendRes.body.data.expiresInSeconds).toBe(300);
      expect(sendRes.body.data.debugOtp).toBeUndefined(); // Zero plaintext OTP leakage

      // 2. Fail with invalid OTP
      const failRes = await request(app)
        .post('/api/v1/auth/verify-email-otp')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ otp: '000000' });

      expect(failRes.status).toBe(400);
      expect(failRes.body.message).toContain('Invalid verification code');

      // 3. Succeed with valid OTP
      const verifyRes = await request(app)
        .post('/api/v1/auth/verify-email-otp')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ otp: '654321' });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.data.user.isEmailVerified).toBe(true);

      // 4. Reusing the OTP immediately fails (one-time use / expired on verify)
      const reuseRes = await request(app)
        .post('/api/v1/auth/verify-email-otp')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ otp: '654321' });

      expect(reuseRes.status).toBe(400);

      randomSpy.mockRestore();
    });

    it('should reject phone OTP when phone is not set, and verify successfully when set', async () => {
      const randomSpy = vi.spyOn(crypto, 'randomInt').mockReturnValue(987654 as never);

      // 0. Reset phone to empty
      await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ phone: '' });

      // 1. Send phone OTP without phone set -> 400
      const sendNoPhoneRes = await request(app)
        .post('/api/v1/auth/send-phone-otp')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(sendNoPhoneRes.status).toBe(400);

      // 2. Update profile with phone
      await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ phone: '+919876543210' });

      // 3. Send phone OTP -> 200
      const sendPhoneRes = await request(app)
        .post('/api/v1/auth/send-phone-otp')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(sendPhoneRes.status).toBe(200);
      expect(sendPhoneRes.body.data.debugOtp).toBeUndefined();

      // 4. Verify phone OTP -> 200
      const verifyPhoneRes = await request(app)
        .post('/api/v1/auth/verify-phone-otp')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ otp: '987654' });

      expect(verifyPhoneRes.status).toBe(200);
      expect(verifyPhoneRes.body.data.user.isPhoneVerified).toBe(true);

      randomSpy.mockRestore();
    });
  });
});


