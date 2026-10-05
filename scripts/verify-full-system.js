/**
 * Comprehensive System Verification Suite
 * Tests Direct Registration, Immediate Login, Profile Management,
 * Service Requests, Inquiries, Admin Flow, Security & Route Integrity
 */

process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../src/app');
const { supabaseAdmin } = require('../src/config/supabase');

async function runComprehensiveVerification(passNumber) {
  console.log(`\n============================================================`);
  console.log(`🚀 STARTING VERIFICATION PASS ${passNumber} / 3`);
  console.log(`============================================================\n`);

  const results = {
    pass: passNumber,
    checks: [],
    failed: 0,
    passed: 0
  };

  function record(name, success, detail = '') {
    if (success) {
      results.passed++;
      results.checks.push({ name, status: 'PASS', detail });
      console.log(`  ✅ [PASS] ${name} ${detail ? `(${detail})` : ''}`);
    } else {
      results.failed++;
      results.checks.push({ name, status: 'FAIL', detail });
      console.error(`  ❌ [FAIL] ${name} - ${detail}`);
    }
  }

  const timestamp = Date.now();
  const testStudent = {
    full_name: `Audit Student ${passNumber}`,
    email: `audit.student.pass${passNumber}.${timestamp}@example.com`,
    mobile: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
    password: `Pass${timestamp}!A`
  };

  let studentToken = null;
  let studentUserId = null;
  let createdRequestId = null;
  let createdInquiryId = null;

  try {
    // 1. Health & Foundation
    const healthRes = await request(app).get('/api/v1/health');
    record('System Health Check', healthRes.status === 200 && healthRes.body.status === 'healthy', `status: ${healthRes.body.status}`);

    // 2. Direct OTP-Free Registration
    console.log(`\n--- Phase 1: Direct Registration (Zero OTP) ---`);
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send(testStudent);

    const regSuccess = regRes.status === 201 && regRes.body.success === true && regRes.body.data?.user?.id;
    record('Direct OTP-Free Registration', regSuccess, `Status ${regRes.status}, User ID: ${regRes.body.data?.user?.id || 'none'}`);

    if (regSuccess) {
      studentUserId = regRes.body.data.user.id;
      if (regRes.body.data.session?.accessToken) {
        studentToken = `Bearer ${regRes.body.data.session.accessToken}`;
        record('Registration Auto-Session Issuance', true, 'Access token issued directly');
      }
    }

    // 3. Immediate Login Without OTP
    console.log(`\n--- Phase 2: Immediate Login Flow ---`);
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testStudent.email,
        password: testStudent.password
      });

    const loginSuccess = loginRes.status === 200 && loginRes.body.success === true && loginRes.body.data?.session?.accessToken;
    record('Immediate Login with Fresh Account', loginSuccess, `Status: ${loginRes.status}`);

    if (loginSuccess) {
      studentToken = `Bearer ${loginRes.body.data.session.accessToken}`;
      studentUserId = loginRes.body.data.user.id;
    }

    // 4. Profile Management & Persistence
    console.log(`\n--- Phase 3: Profile Management ---`);
    const profileRes = await request(app)
      .get('/api/v1/user/profile')
      .set('Authorization', studentToken);

    record('Fetch User Profile', profileRes.status === 200 && profileRes.body.data?.email === testStudent.email, `Profile email matches: ${profileRes.body.data?.email}`);

    const updatedName = `${testStudent.full_name} Verified`;
    const updateProfileRes = await request(app)
      .put('/api/v1/user/profile')
      .set('Authorization', studentToken)
      .send({ full_name: updatedName });

    record('Update User Profile', updateProfileRes.status === 200 && updateProfileRes.body.data?.fullName === updatedName, `Updated name: ${updateProfileRes.body.data?.fullName}`);

    // 5. Service Request Creation
    console.log(`\n--- Phase 4: Service Request Lifecycle ---`);
    const deadline = new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0];
    const reqRes = await request(app)
      .post('/api/v1/services/requests')
      .set('Authorization', studentToken)
      .send({
        service: 'Assignment Writing',
        title: `E2E 3X Pass ${passNumber} Verification Request`,
        subject: 'Computer Networks',
        description: 'Testing complete service workflow and multi-step lifecycle.',
        deadline,
        files: [
          {
            name: 'sample_notes.pdf',
            size: 1024,
            extension: 'pdf',
            data: 'data:application/pdf;base64,JVBERi0xLjQK'
          }
        ]
      });

    const reqCreated = reqRes.status === 201 && reqRes.body.data?.id;
    record('Create Service Request', reqCreated, `Request ID: ${reqRes.body.data?.id}`);

    if (reqCreated) {
      createdRequestId = reqRes.body.data.id;
      createdInquiryId = reqRes.body.data.inquiryId;

      // Verify request appears in user list
      const listReqRes = await request(app)
        .get('/api/v1/services/requests')
        .set('Authorization', studentToken);

      const foundReq = listReqRes.body.data?.find(r => r.id === createdRequestId);
      record('Verify Request in Student List', Boolean(foundReq), `Found request ${createdRequestId}`);
    }

    // 6. Inquiry & Communication
    console.log(`\n--- Phase 5: Student & Inquiry Communication ---`);
    if (createdInquiryId) {
      const studentMsg = `Student query for pass ${passNumber}: Can you provide draft by tomorrow?`;
      const msgRes = await request(app)
        .post(`/api/v1/inquiries/${createdInquiryId}/messages`)
        .set('Authorization', studentToken)
        .send({ content: studentMsg });

      record('Post Message to Inquiry Thread', msgRes.status === 201 && msgRes.body.data?.content === studentMsg, 'Message added');

      const fetchInqRes = await request(app)
        .get(`/api/v1/inquiries/${createdInquiryId}`)
        .set('Authorization', studentToken);

      const hasMessage = fetchInqRes.body.data?.messages?.some(m => m.content === studentMsg);
      record('Fetch Inquiry & Verify Student Message', hasMessage, `Messages count: ${fetchInqRes.body.data?.messages?.length}`);
    }

    // 7. Admin Lifecycle Flow
    console.log(`\n--- Phase 6: Admin Flow & Coordination ---`);
    const adminToken = 'Bearer test-token-admin-verifier';
    if (createdRequestId) {
      const adminReqRes = await request(app)
        .get(`/api/v1/admin/requests/${createdRequestId}`)
        .set('Authorization', adminToken);

      record('Admin View Student Request', adminReqRes.status === 200 && adminReqRes.body.data?.id === createdRequestId, `Admin loaded: ${createdRequestId}`);

      const updateStatusRes = await request(app)
        .patch(`/api/v1/admin/requests/${createdRequestId}/status`)
        .set('Authorization', adminToken)
        .send({
          status: 'in_progress',
          statusLabel: 'In Progress',
          progress: 50
        });

      record('Admin Update Status to In Progress (50%)', updateStatusRes.status === 200 && updateStatusRes.body.data?.progress === 50, 'Status updated');

      if (createdInquiryId) {
        const adminReplyText = `Admin coordinator pass ${passNumber}: We are on schedule!`;
        const adminMsgRes = await request(app)
          .post(`/api/v1/admin/inquiries/${createdInquiryId}/messages`)
          .set('Authorization', adminToken)
          .send({ content: adminReplyText });

        record('Admin Post Reply to Inquiry', adminMsgRes.status === 201 && adminMsgRes.body.data?.content === adminReplyText, 'Admin reply recorded');

        // Verify student can see admin reply
        const studentCheckInq = await request(app)
          .get(`/api/v1/inquiries/${createdInquiryId}`)
          .set('Authorization', studentToken);

        const sawAdminReply = studentCheckInq.body.data?.messages?.some(m => m.content.includes(adminReplyText));
        record('Student Sees Admin Reply in Real Time', sawAdminReply, 'Admin reply verified on student side');
      }
    }

    // 8. Security & Isolation Audit
    console.log(`\n--- Phase 7: Security & Authorization Audit ---`);
    const studentAsAdminRes = await request(app)
      .get('/api/v1/admin/requests')
      .set('Authorization', studentToken);

    record('Security: Student Blocked From Admin Endpoints (RBAC)', studentAsAdminRes.status === 403, `Status: ${studentAsAdminRes.status}`);

    const noAuthRes = await request(app).get('/api/v1/user/profile');
    record('Security: Unauthenticated Access Blocked (401)', noAuthRes.status === 401, `Status: ${noAuthRes.status}`);

    // IDOR check: another student cannot access this student's inquiry
    const otherStudentToken = 'Bearer test-token-e2e-user-bravo';
    if (createdInquiryId) {
      const idorRes = await request(app)
        .get(`/api/v1/inquiries/${createdInquiryId}`)
        .set('Authorization', otherStudentToken);

      record('Security: IDOR Prevention on Inquiries', idorRes.status === 403 || idorRes.status === 404, `Status: ${idorRes.status}`);
    }

    // Clean up created user in Supabase auth to keep DB clean
    if (studentUserId) {
      try {
        await supabaseAdmin.from('profiles').delete().eq('id', studentUserId);
        await supabaseAdmin.auth.admin.deleteUser(studentUserId);
      } catch (cleanErr) {
        // Non-blocking cleanup
      }
    }

  } catch (err) {
    record('Unexpected Execution Error', false, err.message);
  }

  const passSuccess = results.failed === 0;
  console.log(`\n------------------------------------------------------------`);
  console.log(`PASS ${passNumber} RESULT: ${passSuccess ? '🏆 100% SUCCESS' : '❌ FAILED'}`);
  console.log(`Total Checks: ${results.checks.length} | Passed: ${results.passed} | Failed: ${results.failed}`);
  console.log(`------------------------------------------------------------\n`);

  return results;
}

module.exports = { runComprehensiveVerification };

if (require.main === module) {
  runComprehensiveVerification(1)
    .then(res => {
      process.exit(res.failed === 0 ? 0 : 1);
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
