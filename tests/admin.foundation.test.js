const request = require('supertest');
const app = require('../src/app');
const serviceRequestService = require('../src/services/serviceRequest.service');

describe('Admin Backend Foundation Test Suite', () => {
  const studentToken = 'Bearer test-token-student-charlie';
  const adminToken = 'Bearer test-token-admin-lead';

  let testRequestId = null;
  let testInquiryId = null;

  beforeAll(async () => {
    // 1. Create a real request in PostgreSQL by a student to test admin workflows against
    const deadline = new Date(Date.now() + 86400000 * 3).toISOString();
    const reqRes = await request(app)
      .post('/api/v1/services/requests')
      .set('Authorization', studentToken)
      .send({
        service: 'Assignment Writing',
        title: 'Cloud Computing Security Model',
        subject: 'Computer Science',
        description: 'Design and analysis of fault-tolerant distributed security architecture.',
        deadline
      });

    expect(reqRes.status).toBe(201);
    expect(reqRes.body.success).toBe(true);
    testRequestId = reqRes.body.data.id;
    testInquiryId = reqRes.body.data.inquiryId || `INQ-${testRequestId.replace('REQ-', '')}`;
  });

  describe('1. Authentication & Role Authorization on /api/v1/admin/*', () => {
    it('should reject unauthenticated requests with HTTP 401', async () => {
      const res = await request(app).get('/api/v1/admin/dashboard/stats');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject authenticated student user with HTTP 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard/stats')
        .set('Authorization', studentToken);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should reject student even if attempting to forge role in body or query parameters', async () => {
      const res = await request(app)
        .get('/api/v1/admin/requests?role=admin')
        .set('Authorization', studentToken)
        .send({ role: 'admin' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should allow authenticated admin user with HTTP 200', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard/stats')
        .set('Authorization', adminToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalRequests');
      expect(res.body.data).toHaveProperty('pendingReview');
      expect(res.body.data).toHaveProperty('inProgress');
      expect(res.body.data).toHaveProperty('completedDelivered');
      expect(res.body.data).toHaveProperty('urgentRequests');
      expect(res.body.data).toHaveProperty('activeInquiries');
      expect(res.body.data).toHaveProperty('totalStudents');
    });
  });

  describe('2. Admin Dashboard Stats Endpoint', () => {
    it('should return real non-fabricated PostgreSQL metrics', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard/stats')
        .set('Authorization', adminToken);

      expect(res.status).toBe(200);
      const stats = res.body.data;
      expect(typeof stats.totalRequests).toBe('number');
      expect(stats.totalRequests).toBeGreaterThanOrEqual(1);
      expect(typeof stats.urgentRequests).toBe('number');
      expect(typeof stats.activeInquiries).toBe('number');
      expect(typeof stats.totalStudents).toBe('number');

      // Ensure no fabricated fields are returned
      expect(stats).not.toHaveProperty('revenue');
      expect(stats).not.toHaveProperty('profit');
      expect(stats).not.toHaveProperty('fakeAnalytics');
    });
  });

  describe('3. Admin Request Management', () => {
    it('should return paginated requests across all students', async () => {
      const res = await request(app)
        .get('/api/v1/admin/requests?page=1&limit=10')
        .set('Authorization', adminToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(10);
      expect(typeof res.body.total).toBe('number');
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);

      // Verify request structure
      const item = res.body.data[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('title');
      expect(item).toHaveProperty('status');
      expect(item).toHaveProperty('service');
    });

    it('should filter requests by status and search term', async () => {
      const res = await request(app)
        .get('/api/v1/admin/requests?status=pending&search=Cloud')
        .set('Authorization', adminToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      for (const reqItem of res.body.data) {
        expect(reqItem.status).toBe('pending');
      }
    });

    it('should return full request detail by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/admin/requests/${testRequestId}`)
        .set('Authorization', adminToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testRequestId);
      expect(res.body.data.title).toBe('Cloud Computing Security Model');
      expect(res.body.data).toHaveProperty('inquiry');
      expect(res.body.data).toHaveProperty('files');
    });

    it('should return 404 for nonexistent request ID', async () => {
      const res = await request(app)
        .get('/api/v1/admin/requests/REQ-99999999-999')
        .set('Authorization', adminToken);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('4. Admin Request Status Mutation & Protection', () => {
    it('should successfully update request status and auto-map label & progress', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/requests/${testRequestId}/status`)
        .set('Authorization', adminToken)
        .send({ status: 'in_progress' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('in_progress');
      expect(res.body.data.statusLabel).toBe('In Progress');
      expect(res.body.data.progress).toBe(75);
    });

    it('should reject invalid status with HTTP 400', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/requests/${testRequestId}/status`)
        .set('Authorization', adminToken)
        .send({ status: 'invalid_status_xyz' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should prevent mass assignment or changing ownership/id', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/requests/${testRequestId}/status`)
        .set('Authorization', adminToken)
        .send({
          status: 'in_review',
          id: 'REQ-FORGED-999',
          userId: 'hacker-user',
          userEmail: 'hacker@example.com'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(testRequestId); // ID not changed
      expect(res.body.data.userId).toBe('student-charlie'); // Ownership not changed
      expect(res.body.data.status).toBe('in_review');
    });

    it('should return 404 when patching status of nonexistent request', async () => {
      const res = await request(app)
        .patch('/api/v1/admin/requests/REQ-99999999-999/status')
        .set('Authorization', adminToken)
        .send({ status: 'completed' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('5. Admin Inquiries & Desk Messaging', () => {
    it('should list all inquiries with pagination', async () => {
      const res = await request(app)
        .get('/api/v1/admin/inquiries?page=1&limit=10')
        .set('Authorization', adminToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(typeof res.body.total).toBe('number');
    });

    it('should get inquiry details with full message history and linked request', async () => {
      const res = await request(app)
        .get(`/api/v1/admin/inquiries/${testInquiryId}`)
        .set('Authorization', adminToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testInquiryId);
      expect(Array.isArray(res.body.data.messages)).toBe(true);
      expect(res.body.data.messages.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data).toHaveProperty('request');
    });

    it('should allow admin to send a message to student inquiry and persist it in PostgreSQL', async () => {
      const content = 'Hello student! Our academic coordinator has reviewed your security model requirements.';
      const res = await request(app)
        .post(`/api/v1/admin/inquiries/${testInquiryId}/messages`)
        .set('Authorization', adminToken)
        .send({ content });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.content).toBe(content);
      expect(res.body.data.senderRole).toBe('team');
      expect(res.body.data.senderBadge).toBe('Coordinator');

      // Verify that student can now read this message in their inquiry
      const studentView = await request(app)
        .get(`/api/v1/inquiries/${testInquiryId}`)
        .set('Authorization', studentToken);

      expect(studentView.status).toBe(200);
      const studentMsgs = studentView.body.data.messages;
      const found = studentMsgs.find(m => m.content === content);
      expect(found).toBeDefined();
      expect(found.senderRole).toBe('team');
    });

    it('should reject empty message content with HTTP 400', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/inquiries/${testInquiryId}/messages`)
        .set('Authorization', adminToken)
        .send({ content: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 when messaging nonexistent inquiry', async () => {
      const res = await request(app)
        .post('/api/v1/admin/inquiries/INQ-99999999-999/messages')
        .set('Authorization', adminToken)
        .send({ content: 'Nonexistent inquiry test' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('6. Admin Student Roster & Safety', () => {
    it('should list students without exposing passwords, secrets, or service keys', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users?page=1&limit=10')
        .set('Authorization', adminToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);

      for (const u of res.body.data) {
        expect(u).toHaveProperty('id');
        expect(u).toHaveProperty('email');
        expect(u).not.toHaveProperty('password');
        expect(u).not.toHaveProperty('encrypted_password');
        expect(u).not.toHaveProperty('access_token');
        expect(u).not.toHaveProperty('refresh_token');
        expect(u).not.toHaveProperty('service_role');
      }
    });

    it('should return 404 for nonexistent user ID', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', adminToken);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('7. Concurrency-Safe Request ID Generation in PostgreSQL', () => {
    it('should generate unique incremental request IDs under concurrent calls', async () => {
      // Simulate concurrent requests being created simultaneously
      const parallelCalls = [
        serviceRequestService.createRequest({
          service: 'Assignment Writing',
          title: 'Concurrent Test 1',
          subject: 'Math',
          description: 'Desc 1',
          deadline: new Date().toISOString()
        }, { id: 'concurrent-user-1', email: 'c1@example.com' }),
        serviceRequestService.createRequest({
          service: 'Assignment Writing',
          title: 'Concurrent Test 2',
          subject: 'Physics',
          description: 'Desc 2',
          deadline: new Date().toISOString()
        }, { id: 'concurrent-user-2', email: 'c2@example.com' }),
        serviceRequestService.createRequest({
          service: 'Assignment Writing',
          title: 'Concurrent Test 3',
          subject: 'Chemistry',
          description: 'Desc 3',
          deadline: new Date().toISOString()
        }, { id: 'concurrent-user-3', email: 'c3@example.com' })
      ];

      const results = await Promise.all(parallelCalls);
      const ids = results.map(r => r.id);

      // Check format
      for (const id of ids) {
        expect(id).toMatch(/^REQ-\d{8}-\d{3,}$/);
      }

      // Check uniqueness (no duplicates)
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('8. Student Workflow Regression Check', () => {
    it('should preserve student My Requests listing and ownership isolation', async () => {
      const res = await request(app)
        .get('/api/v1/services/requests')
        .set('Authorization', studentToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      for (const r of res.body.data) {
        expect(r.userId).toBe('student-charlie');
      }
    });

    it('should preserve student academic details update and retrieval', async () => {
      const updateRes = await request(app)
        .put('/api/v1/user/academic-details')
        .set('Authorization', studentToken)
        .send({
          studentName: 'Charlie Student',
          branch: 'Electronics and Computer Engineering',
          year: '2nd Year',
          semester: 'Semester 4',
          division: 'Division B',
          rollNo: 'EXCP-2024-042'
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.data.branch).toBe('Electronics and Computer Engineering');

      const getRes = await request(app)
        .get('/api/v1/user/academic-details')
        .set('Authorization', studentToken);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.studentName).toBe('Charlie Student');
      expect(getRes.body.data.rollNo).toBe('EXCP-2024-042');
    });
  });
});
