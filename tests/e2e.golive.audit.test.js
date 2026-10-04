const request = require('supertest');
const app = require('../src/app');
const { supabaseAdmin } = require('../src/config/supabase');

describe('E2E Go-Live Verification & Cross-User Security Audit', () => {
  const userAlphaToken = 'Bearer test-token-e2e-user-alpha';
  const userBravoToken = 'Bearer test-token-e2e-user-bravo';
  const adminToken = 'Bearer test-token-admin-verifier';

  let userARequestId = null;
  let userAInquiryId = null;
  let userBRequestId = null;
  let userBInquiryId = null;

  describe('Phase 1: Student Flow A (User Alpha Request & Inquiry Lifecycle)', () => {
    it('creates a service request with reference files', async () => {
      const res = await request(app)
        .post('/api/v1/services/requests')
        .set('Authorization', userAlphaToken)
        .send({
          service: 'Assignment Writing',
          title: 'Autonomous Multi-Agent Go-Live Audit Analysis',
          subject: 'Software Engineering',
          description: 'Production verification test for complete AssignmentHub workflow.',
          deadline: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
          files: [
            {
              name: 'production_audit_spec.pdf',
              size: 2048,
              extension: 'pdf',
              data: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrCg=='
            }
          ]
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toMatch(/^REQ-\d{8}-\d{3,}$/);
      expect(res.body.data.userId).toBe('e2e-user-alpha');
      userARequestId = res.body.data.id;
      userAInquiryId = res.body.data.inquiryId;
      expect(userAInquiryId).toBeDefined();
    });

    it('verifies request appears in User Alpha My Requests', async () => {
      const res = await request(app)
        .get('/api/v1/services/requests')
        .set('Authorization', userAlphaToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const myReq = res.body.data.find(r => r.id === userARequestId);
      expect(myReq).toBeDefined();
      expect(myReq.userId).toBe('e2e-user-alpha');
    });

    it('verifies inquiry automatically created with initial coordinator message', async () => {
      const res = await request(app)
        .get(`/api/v1/inquiries/${userAInquiryId}`)
        .set('Authorization', userAlphaToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.requestId).toBe(userARequestId);
      expect(res.body.data.userId).toBe('e2e-user-alpha');
      expect(res.body.data.messages.length).toBeGreaterThanOrEqual(1);
    });

    it('allows User Alpha to post a clarification message to their inquiry', async () => {
      const res = await request(app)
        .post(`/api/v1/inquiries/${userAInquiryId}/messages`)
        .set('Authorization', userAlphaToken)
        .send({
          content: 'Hello, please confirm if the audit spec file was received.'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.content).toContain('audit spec file was received');
    });
  });

  describe('Phase 2: Student Flow B (User Bravo Creation & Cross-User Security Isolation)', () => {
    it('creates a service request for User Bravo', async () => {
      const res = await request(app)
        .post('/api/v1/services/requests')
        .set('Authorization', userBravoToken)
        .send({
          service: 'Custom Service',
          isCustom: true,
          customServiceName: 'Quantum Cryptography Simulation',
          title: 'BB84 Protocol Verification',
          subject: 'Physics',
          description: 'Quantum key distribution sim files and theoretical proofs.',
          deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          files: [
            {
              name: 'quantum_keys.zip',
              size: 1024,
              extension: 'zip',
              data: 'data:application/zip;base64,UEsFBgAAAAAAAAAAAAAAAAAAAAAAAA=='
            }
          ]
        });

      expect(res.status).toBe(201);
      userBRequestId = res.body.data.id;
      userBInquiryId = res.body.data.inquiryId;
    });

    it('STRICT ISOLATION: User Bravo CANNOT read User Alpha request (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/v1/services/requests/${userARequestId}`)
        .set('Authorization', userBravoToken);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('STRICT ISOLATION: User Alpha CANNOT read User Bravo request (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/v1/services/requests/${userBRequestId}`)
        .set('Authorization', userAlphaToken);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('STRICT ISOLATION: User Bravo CANNOT read User Alpha inquiry (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/v1/inquiries/${userAInquiryId}`)
        .set('Authorization', userBravoToken);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('STRICT ISOLATION: User Bravo CANNOT send messages into User Alpha inquiry (403 Forbidden)', async () => {
      const res = await request(app)
        .post(`/api/v1/inquiries/${userAInquiryId}/messages`)
        .set('Authorization', userBravoToken)
        .send({ content: 'Malicious message insertion attempt' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('STRICT ISOLATION: User Bravo CANNOT download User Alpha private files (403 Forbidden)', async () => {
      const userAReqRes = await request(app)
        .get(`/api/v1/services/requests/${userARequestId}`)
        .set('Authorization', userAlphaToken);

      const fileUrl = userAReqRes.body.data.files[0].url;

      const fileRes = await request(app)
        .get(fileUrl)
        .set('Authorization', userBravoToken);

      expect(fileRes.status).toBe(403);
    });
  });

  describe('Phase 3: Admin Flow & Workflow Verification', () => {
    it('blocks student token from accessing Admin endpoints (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard/stats')
        .set('Authorization', userAlphaToken);

      expect(res.status).toBe(403);
    });

    it('allows Admin to view real dashboard metrics', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard/stats')
        .set('Authorization', adminToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalRequests).toBeGreaterThanOrEqual(2);
    });

    it('allows Admin to view User Alpha request and details', async () => {
      const res = await request(app)
        .get(`/api/v1/admin/requests/${userARequestId}`)
        .set('Authorization', adminToken);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(userARequestId);
      expect(res.body.data.userId).toBe('e2e-user-alpha');
    });

    it('allows Admin to update request status to in_progress with 75% completion', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/requests/${userARequestId}/status`)
        .set('Authorization', adminToken)
        .send({
          status: 'in_progress',
          statusLabel: 'In Progress',
          progress: 75
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('in_progress');
      expect(res.body.data.progress).toBe(75);
    });

    it('allows Admin to reply to User Alpha inquiry thread', async () => {
      const adminMsg = 'Admin desk confirmed your audit spec file. Reviewing now!';
      const res = await request(app)
        .post(`/api/v1/admin/inquiries/${userAInquiryId}/messages`)
        .set('Authorization', adminToken)
        .send({ content: adminMsg });

      expect(res.status).toBe(201);
      expect(res.body.data.content).toBe(adminMsg);
      expect(res.body.data.senderRole).toBe('team');
    });

    it('verifies User Alpha sees the updated status and Admin reply', async () => {
      const reqRes = await request(app)
        .get(`/api/v1/services/requests/${userARequestId}`)
        .set('Authorization', userAlphaToken);

      expect(reqRes.status).toBe(200);
      expect(reqRes.body.data.status).toBe('in_progress');
      expect(reqRes.body.data.progress).toBe(75);

      const inqRes = await request(app)
        .get(`/api/v1/inquiries/${userAInquiryId}`)
        .set('Authorization', userAlphaToken);

      expect(inqRes.status).toBe(200);
      const messages = inqRes.body.data.messages;
      const adminReply = messages.find(m => m.content.includes('Admin desk confirmed your audit spec'));
      expect(adminReply).toBeDefined();
    });
  });
});
