const request = require('supertest');
const app = require('../src/app');

describe('Assignment Hub Backend - Authentication & Validation Test Suite', () => {
  describe('Health Check Endpoint', () => {
    it('GET /api/v1/health should return 200 OK and healthy status', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe('healthy');
    });

    it('GET / should return 200 and Landing Page HTML', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.text).toContain('Assignment Hub');
    });

    it('GET /api/v1/non-existent-route should return 404', async () => {
      const res = await request(app).get('/api/v1/non-existent-route');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ROUTE_NOT_FOUND');
    });
  });

  describe('POST /api/v1/auth/register/initiate - Password Validation', () => {
    const basePayload = {
      full_name: 'Aditya Jha',
      email: 'aditya@example.com',
      mobile: '9876543210'
    };

    it('should reject password without uppercase letter (e.g. aditya123)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register/initiate')
        .send({ ...basePayload, password: 'aditya123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject password without lowercase letter (e.g. ADITYA123)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register/initiate')
        .send({ ...basePayload, password: 'ADITYA123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject password without number (e.g. AdityaABC)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register/initiate')
        .send({ ...basePayload, password: 'AdityaABC' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject password with length < 6 (e.g. Adi12)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register/initiate')
        .send({ ...basePayload, password: 'Adi12' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject empty or missing full_name', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register/initiate')
        .send({ ...basePayload, full_name: '', password: 'Aditya123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register/initiate')
        .send({ ...basePayload, email: 'not-an-email', password: 'Aditya123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid mobile number', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register/initiate')
        .send({ ...basePayload, mobile: '12345', password: 'Aditya123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/register/verify-otp - OTP Validation', () => {
    it('should reject invalid OTP length or format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register/verify-otp')
        .send({
          verification_id: '123e4567-e89b-12d3-a456-426614174000',
          otp: '123'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject non-numeric OTP', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register/verify-otp')
        .send({
          verification_id: '123e4567-e89b-12d3-a456-426614174000',
          otp: 'ABCDEF'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid UUID format for verification_id', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register/verify-otp')
        .send({
          verification_id: 'not-a-uuid',
          otp: '123456'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/register - Direct Registration Validation', () => {
    const basePayload = {
      full_name: 'Aditya Direct User',
      email: 'aditya.direct@example.com',
      mobile: '9876543210'
    };

    it('should reject direct register with invalid email typo', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...basePayload, email: 'aditya@gamil.com', password: 'Password123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject direct register with invalid mobile number', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...basePayload, mobile: '12345', password: 'Password123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject direct register with weak password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...basePayload, password: 'weak' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/login - Login Validation', () => {
    it('should reject missing email or password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'aditya@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Protected Routes - Unauthorized Access', () => {
    it('GET /api/v1/user/profile should reject request without Bearer token', async () => {
      const res = await request(app).get('/api/v1/user/profile');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('POST /api/v1/auth/logout should reject request without Bearer token', async () => {
      const res = await request(app).post('/api/v1/auth/logout');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
