const request = require('supertest');
const app = require('../src/app');

describe('Inquiries API Test Suite', () => {
  let createdRequestId = null;
  let linkedInquiryId = null;

  beforeAll(async () => {
    // Create a request which automatically provisions an inquiry
    const deadline = new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0];
    const res = await request(app)
      .post('/api/v1/services/requests')
      .send({
        service: 'Assignment Writing',
        title: 'Microservices with Kubernetes and Istio',
        subject: 'Cloud Computing',
        description: 'Detailed analysis of service mesh security and mutual TLS authentication.',
        deadline,
        serviceSpecific: {
          numberOfPages: 8,
          formatStyle: 'Typed (Digital PDF / Word)'
        }
      });

    expect(res.status).toBe(201);
    createdRequestId = res.body.data.id;
    linkedInquiryId = `INQ-${createdRequestId.replace('REQ-', '')}`;
  });

  describe('Automatic Inquiry Provisioning & Retrieval', () => {
    it('should list inquiries including the automatically created channel', async () => {
      const res = await request(app).get('/api/v1/inquiries');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const found = res.body.data.find(
        (inq) => inq.requestId === createdRequestId || inq.id === linkedInquiryId
      );
      expect(found).toBeDefined();
      expect(found.title).toBe('Microservices with Kubernetes and Istio');
      expect(found.messages.length).toBeGreaterThanOrEqual(1);
    });

    it('should fetch an inquiry by its ID', async () => {
      const res = await request(app).get(`/api/v1/inquiries/${linkedInquiryId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(linkedInquiryId);
      expect(res.body.data.requestId).toBe(createdRequestId);
    });

    it('should fetch an inquiry by its linked Request ID', async () => {
      const res = await request(app).get(`/api/v1/inquiries/${createdRequestId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.requestId).toBe(createdRequestId);
    });

    it('should return 404 for non-existent inquiry', async () => {
      const res = await request(app).get('/api/v1/inquiries/INQ-NONEXISTENT-999');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/inquiries/:id/messages - Message Transmission', () => {
    it('should allow sending a message to the inquiry channel', async () => {
      const messageContent = 'Hello, can you confirm if Helm chart templates are required in Section 2?';
      const res = await request(app)
        .post(`/api/v1/inquiries/${linkedInquiryId}/messages`)
        .send({
          content: messageContent
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.content).toBe(messageContent);
      expect(res.body.data.senderRole).toBe('user');
    });

    it('should reject an empty message with 400', async () => {
      const res = await request(app)
        .post(`/api/v1/inquiries/${linkedInquiryId}/messages`)
        .send({
          content: '   '
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should persist sent message in inquiry history on subsequent fetch', async () => {
      const res = await request(app).get(`/api/v1/inquiries/${linkedInquiryId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.messages.length).toBeGreaterThanOrEqual(2);
      const lastMsg = res.body.data.messages[res.body.data.messages.length - 1];
      expect(lastMsg.content).toBe('Hello, can you confirm if Helm chart templates are required in Section 2?');
    });
  });

  describe('Inquiry Security & Duplicate Prevention', () => {
    it('should prevent duplicate inquiries for the same request', async () => {
      const inquiryService = require('../src/services/inquiry.service');
      const inq1 = await inquiryService.createInquiryForRequest({
        id: createdRequestId,
        title: 'Microservices with Kubernetes and Istio'
      });
      const inq2 = await inquiryService.createInquiryForRequest({
        id: createdRequestId,
        title: 'Microservices with Kubernetes and Istio'
      });
      expect(inq1.id).toBe(inq2.id);
    });

    it('should deny unauthorized user from accessing another user inquiry', async () => {
      const inquiryService = require('../src/services/inquiry.service');
      // Create inquiry owned by student A
      const privateInquiry = await inquiryService.createInquiryForRequest({
        id: 'REQ-20261004-999',
        userId: 'user-aaa-111',
        userEmail: 'studentA@college.edu',
        title: 'Private Research Thesis'
      });

      // User B attempts to access it
      await expect(
        inquiryService.getInquiryById(privateInquiry.id, 'user-bbb-222', 'studentB@college.edu')
      ).rejects.toThrow('Access denied');

      // User B attempts to send message to it
      await expect(
        inquiryService.addMessage(
          privateInquiry.id,
          { content: 'Hacking attempt' },
          { id: 'user-bbb-222', email: 'studentB@college.edu' }
        )
      ).rejects.toThrow('Access denied');
    });
  });
});
