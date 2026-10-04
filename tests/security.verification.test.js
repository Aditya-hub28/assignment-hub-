const request = require('supertest');
const app = require('../src/app');

describe('Security & Production Verification Test Suite', () => {
  const userAToken = 'Bearer test-token-user-alpha';
  const userBToken = 'Bearer test-token-user-bravo';

  let userARequestId = null;
  let userAInquiryId = null;
  const sampleFileName = 'lecture_notes.pdf';

  // Sample base64 for a minimal dummy PDF/text
  const dummyBase64 = 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrCg==';

  describe('1. Private File Storage & Cross-User File Authorization', () => {
    beforeAll(async () => {
      const deadline = new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0];

      // User Alpha creates a request with an uploaded file
      const res = await request(app)
        .post('/api/v1/services/requests')
        .set('Authorization', userAToken)
        .send({
          service: 'Assignment Writing',
          title: 'Distributed Consensus Security Analysis',
          subject: 'Cybersecurity',
          description: 'Confidential assignment file containing university coursework prompts.',
          deadline,
          files: [
            {
              name: sampleFileName,
              size: 1024 * 50,
              extension: 'pdf',
              data: dummyBase64
            }
          ]
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      userARequestId = res.body.data.id;
      userAInquiryId = `INQ-${userARequestId.replace('REQ-', '')}`;

      // Verify file URL generated points to authorized endpoint, NOT public /uploads
      const fileObj = res.body.data.files[0];
      expect(fileObj).toBeDefined();
      expect(fileObj.url.startsWith(`/api/v1/services/requests/${userARequestId}/files/`)).toBe(true);
      expect(fileObj.url.includes('/uploads/')).toBe(false);
    });

    it('should allow User Alpha (owner) to download their uploaded file', async () => {
      // First get the request to know the exact stored disk filename in the URL
      const reqRes = await request(app)
        .get(`/api/v1/services/requests/${userARequestId}`)
        .set('Authorization', userAToken);

      expect(reqRes.status).toBe(200);
      const fileUrl = reqRes.body.data.files[0].url;

      const fileRes = await request(app)
        .get(fileUrl)
        .set('Authorization', userAToken);

      expect(fileRes.status).toBe(200);
      expect(fileRes.headers['content-disposition']).toContain(sampleFileName);
    });

    it('should allow User Alpha to download via query parameter token', async () => {
      const reqRes = await request(app)
        .get(`/api/v1/services/requests/${userARequestId}`)
        .set('Authorization', userAToken);

      const fileUrl = reqRes.body.data.files[0].url;
      const fileRes = await request(app)
        .get(`${fileUrl}?token=test-token-user-alpha`);

      expect(fileRes.status).toBe(200);
      expect(fileRes.headers['content-disposition']).toContain(sampleFileName);
    });

    it('should DENY User Bravo from downloading User Alpha\'s file (403 Forbidden)', async () => {
      const reqRes = await request(app)
        .get(`/api/v1/services/requests/${userARequestId}`)
        .set('Authorization', userAToken);

      const fileUrl = reqRes.body.data.files[0].url;

      const fileRes = await request(app)
        .get(fileUrl)
        .set('Authorization', userBToken);

      expect(fileRes.status).toBe(403);
      expect(fileRes.body.success).toBe(false);
    });

    it('should DENY Unauthenticated users from downloading files (401 Unauthorized)', async () => {
      const reqRes = await request(app)
        .get(`/api/v1/services/requests/${userARequestId}`)
        .set('Authorization', userAToken);

      const fileUrl = reqRes.body.data.files[0].url;

      const fileRes = await request(app).get(fileUrl);
      expect(fileRes.status).toBe(401);
      expect(fileRes.body.success).toBe(false);
    });

    it('should BLOCK directory traversal attempts on file download', async () => {
      const traversalRes = await request(app)
        .get(`/api/v1/services/requests/${userARequestId}/files/..%2F..%2F..%2Fpackage.json`)
        .set('Authorization', userAToken);

      // Should be rejected by route/basename defense
      expect([400, 404]).toContain(traversalRes.status);
    });
  });

  describe('2. Cross-User Request Ownership Verification', () => {
    it('should allow User Alpha to view their own request', async () => {
      const res = await request(app)
        .get(`/api/v1/services/requests/${userARequestId}`)
        .set('Authorization', userAToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(userARequestId);
    });

    it('should DENY User Bravo from accessing User Alpha\'s request (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/v1/services/requests/${userARequestId}`)
        .set('Authorization', userBToken);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent request ID', async () => {
      const res = await request(app)
        .get('/api/v1/services/requests/REQ-99999999-999')
        .set('Authorization', userAToken);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. Cross-User Inquiry Ownership & Messaging Verification', () => {
    it('should allow User Alpha to open their own inquiry', async () => {
      const res = await request(app)
        .get(`/api/v1/inquiries/${userAInquiryId}`)
        .set('Authorization', userAToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(userAInquiryId);
    });

    it('should DENY User Bravo from opening User Alpha\'s inquiry (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/v1/inquiries/${userAInquiryId}`)
        .set('Authorization', userBToken);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should DENY User Bravo from sending messages to User Alpha\'s inquiry (403 Forbidden)', async () => {
      const res = await request(app)
        .post(`/api/v1/inquiries/${userAInquiryId}/messages`)
        .set('Authorization', userBToken)
        .send({
          content: 'Malicious unauthorized message from User Bravo'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow User Alpha to send a message to their own inquiry', async () => {
      const res = await request(app)
        .post(`/api/v1/inquiries/${userAInquiryId}/messages`)
        .set('Authorization', userAToken)
        .send({
          content: 'Hello, I uploaded my rubric files. Please check!'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.content).toBe('Hello, I uploaded my rubric files. Please check!');
    });
  });

  describe('4. XSS & Payload Sanitization Verification', () => {
    it('should safely treat HTML/JS tags as literal string text in messages without execution', async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      const res = await request(app)
        .post(`/api/v1/inquiries/${userAInquiryId}/messages`)
        .set('Authorization', userAToken)
        .send({
          content: xssPayload
        });

      expect(res.status).toBe(201);
      expect(res.body.data.content).toBe(xssPayload);
    });
  });
});
