const request = require('supertest');
const app = require('../src/app');
const { supabaseAdmin } = require('../src/config/supabase');

describe('Supabase PostgreSQL Operational Data Migration Test Suite', () => {
  const userAToken = 'Bearer test-token-user-alpha';
  const userBToken = 'Bearer test-token-user-bravo';

  let testRequestId = null;
  let testInquiryId = null;

  describe('1. Service Request & Automatic Inquiry in PostgreSQL', () => {
    it('should create a service request directly in Supabase PostgreSQL', async () => {
      const payload = {
        service: 'Assignment Writing',
        title: 'PostgreSQL Operational Data Migration Verification',
        subject: 'Database Engineering',
        description: 'Verify end-to-end operational database migration to Supabase PostgreSQL.',
        deadline: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
        serviceSpecific: { numberOfPages: 10, formatStyle: 'IEEE' },
        files: [
          {
            name: 'migration_spec.pdf',
            size: 1024 * 10,
            extension: 'pdf',
            data: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrCg=='
          }
        ]
      };

      const res = await request(app)
        .post('/api/v1/services/requests')
        .set('Authorization', userAToken)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toMatch(/^REQ-\d{8}-\d{3}$/);
      testRequestId = res.body.data.id;
      testInquiryId = `INQ-${testRequestId.replace('REQ-', '')}`;

      // Verify row exists directly in public.service_requests table in PostgreSQL
      const { data: dbRow, error } = await supabaseAdmin
        .from('service_requests')
        .select('*')
        .eq('id', testRequestId)
        .single();

      expect(error).toBeNull();
      expect(dbRow).toBeDefined();
      expect(dbRow.id).toBe(testRequestId);
      expect(dbRow.title).toBe(payload.title);
      expect(dbRow.service).toBe(payload.service);
      expect(dbRow.user_id).toBe('user-alpha');
    });

    it('should verify automatic linked inquiry and initial team message exist in PostgreSQL', async () => {
      const { data: inqRow, error: inqErr } = await supabaseAdmin
        .from('inquiries')
        .select('*')
        .eq('request_id', testRequestId)
        .single();

      expect(inqErr).toBeNull();
      expect(inqRow).toBeDefined();
      expect(inqRow.id).toBe(testInquiryId);
      expect(inqRow.status).toBe('active');

      // Verify welcome message in public.inquiry_messages table
      const { data: msgRows, error: msgErr } = await supabaseAdmin
        .from('inquiry_messages')
        .select('*')
        .eq('inquiry_id', testInquiryId);

      expect(msgErr).toBeNull();
      expect(msgRows.length).toBeGreaterThanOrEqual(1);
      const welcomeMsg = msgRows.find(m => m.sender_role === 'team');
      expect(welcomeMsg).toBeDefined();
      expect(welcomeMsg.sender_name).toBe('Admin');
    });

    it('should allow student to send a message and persist in public.inquiry_messages', async () => {
      const messageContent = 'Hello, can you please confirm the IEEE citation style?';
      const msgRes = await request(app)
        .post(`/api/v1/inquiries/${testInquiryId}/messages`)
        .set('Authorization', userAToken)
        .send({ content: messageContent });

      expect(msgRes.status).toBe(201);
      expect(msgRes.body.success).toBe(true);
      expect(msgRes.body.data.content).toBe(messageContent);
      expect(msgRes.body.data.senderRole).toBe('user');

      // Verify in PostgreSQL table
      const { data: savedMsg, error } = await supabaseAdmin
        .from('inquiry_messages')
        .select('*')
        .eq('inquiry_id', testInquiryId)
        .eq('content', messageContent)
        .single();

      expect(error).toBeNull();
      expect(savedMsg).toBeDefined();
      expect(savedMsg.sender_role).toBe('user');
    });
  });

  describe('2. Academic Profiles in PostgreSQL', () => {
    it('should save academic details to public.academic_profiles in PostgreSQL', async () => {
      const academicData = {
        studentName: 'Alpha Student',
        branch: 'Computer Engineering',
        year: '3rd Year',
        semester: 'Semester 5',
        division: 'Division A',
        rollNo: 'COMP-2024-001'
      };

      const putRes = await request(app)
        .put('/api/v1/user/academic-details')
        .set('Authorization', userAToken)
        .send(academicData);

      expect(putRes.status).toBe(200);
      expect(putRes.body.success).toBe(true);
      expect(putRes.body.data.branch).toBe('Computer Engineering');

      // Verify in public.academic_profiles table in Supabase
      const { data: dbRow, error } = await supabaseAdmin
        .from('academic_profiles')
        .select('*')
        .eq('user_id', 'user-alpha')
        .single();

      expect(error).toBeNull();
      expect(dbRow).toBeDefined();
      expect(dbRow.branch).toBe('Computer Engineering');
      expect(dbRow.roll_no).toBe('COMP-2024-001');
    });

    it('should retrieve student academic details from PostgreSQL', async () => {
      const getRes = await request(app)
        .get('/api/v1/user/academic-details')
        .set('Authorization', userAToken);

      expect(getRes.status).toBe(200);
      expect(getRes.body.success).toBe(true);
      expect(getRes.body.data.branch).toBe('Computer Engineering');
      expect(getRes.body.data.rollNo).toBe('COMP-2024-001');
    });
  });

  describe('3. Strict Cross-User Ownership Isolation in PostgreSQL', () => {
    it('should allow User Alpha to view their own request', async () => {
      const res = await request(app)
        .get(`/api/v1/services/requests/${testRequestId}`)
        .set('Authorization', userAToken);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(testRequestId);
    });

    it('should DENY User Bravo from viewing User Alpha\'s request (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/v1/services/requests/${testRequestId}`)
        .set('Authorization', userBToken);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should DENY User Bravo from viewing User Alpha\'s inquiry (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/v1/inquiries/${testInquiryId}`)
        .set('Authorization', userBToken);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should DENY User Bravo from sending messages to User Alpha\'s inquiry (403 Forbidden)', async () => {
      const res = await request(app)
        .post(`/api/v1/inquiries/${testInquiryId}/messages`)
        .set('Authorization', userBToken)
        .send({ content: 'Unauthorized intrusion attempt' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should isolate academic profiles between User Alpha and User Bravo', async () => {
      // User Bravo should have no academic profile saved yet
      const res = await request(app)
        .get('/api/v1/user/academic-details')
        .set('Authorization', userBToken);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeNull();
    });
  });
});
