/**
 * AssignmentHub — JSON to Supabase PostgreSQL Migration Script
 * Deterministic, idempotent, repeatable migration for operational data:
 * - data/service_requests.json -> public.service_requests
 * - data/inquiries.json -> public.inquiries & public.inquiry_messages
 * - data/academic_profiles.json -> public.academic_profiles
 */

const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('../src/config/supabase');

const DATA_DIR = path.resolve(process.cwd(), 'data');
const REQUESTS_FILE = path.join(DATA_DIR, 'service_requests.json');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');
const ACADEMICS_FILE = path.join(DATA_DIR, 'academic_profiles.json');

const parseIsoDate = (dateVal) => {
  if (!dateVal) return null;
  try {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      return d.toISOString();
    }
  } catch {}
  return null;
};

async function migrate() {
  console.log('=== STARTING ASSIGNMENTHUB OPERATIONAL DATA MIGRATION ===');

  if (!supabaseAdmin) {
    throw new Error('Supabase client is not configured or missing service-role key.');
  }

  // 1. Audit & Load Data
  const rawRequests = fs.existsSync(REQUESTS_FILE) ? JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf8') || '[]') : [];
  const rawInquiries = fs.existsSync(INQUIRIES_FILE) ? JSON.parse(fs.readFileSync(INQUIRIES_FILE, 'utf8') || '[]') : [];
  const rawAcademics = fs.existsSync(ACADEMICS_FILE) ? JSON.parse(fs.readFileSync(ACADEMICS_FILE, 'utf8') || '{}') : {};

  console.log(`[AUDIT] Found ${rawRequests.length} requests, ${rawInquiries.length} inquiries, ${Object.keys(rawAcademics).length} academic profiles in JSON.`);

  // 2. Prepare & Migrate Service Requests
  const requestRecords = [];
  const seenReqIds = new Set();

  for (const r of rawRequests) {
    if (!r.id || seenReqIds.has(r.id)) continue;
    seenReqIds.add(r.id);

    requestRecords.push({
      id: r.id,
      user_id: r.userId || null,
      user_name: r.userName || 'Student',
      user_email: r.userEmail || null,
      service: r.service || 'Assignment Writing',
      is_custom: Boolean(r.isCustom),
      custom_service_name: r.customServiceName || null,
      title: r.title || 'Academic Request',
      subject: r.subject || 'Standard Coursework',
      description: r.description || '',
      deadline: parseIsoDate(r.deadline),
      additional_instructions: r.additionalInstructions || '',
      service_specific: r.serviceSpecific || {},
      files: r.files || [],
      status: r.status || 'pending',
      status_label: r.statusLabel || 'In Progress',
      progress: typeof r.progress === 'number' ? r.progress : 25,
      inquiry_id: r.inquiryId || `INQ-${r.id.replace('REQ-', '')}`,
      created_at: parseIsoDate(r.createdAt) || new Date().toISOString(),
      updated_at: parseIsoDate(r.updatedAt) || new Date().toISOString()
    });
  }

  console.log(`[MIGRATION] Upserting ${requestRecords.length} service requests to PostgreSQL...`);
  const BATCH_SIZE = 50;
  for (let i = 0; i < requestRecords.length; i += BATCH_SIZE) {
    const chunk = requestRecords.slice(i, i + BATCH_SIZE);
    const { error } = await supabaseAdmin
      .from('service_requests')
      .upsert(chunk, { onConflict: 'id' });
    if (error) {
      throw new Error(`Failed to upsert service_requests batch ${i}: ${error.message}`);
    }
  }
  console.log(`[SUCCESS] Service requests migrated: ${requestRecords.length}`);

  // 3. Prepare & Migrate Inquiries
  const inquiryRecords = [];
  const messageRecords = [];
  const seenInqIds = new Set();
  const seenMsgIds = new Set();

  for (const inq of rawInquiries) {
    if (!inq.id || seenInqIds.has(inq.id)) continue;
    seenInqIds.add(inq.id);

    inquiryRecords.push({
      id: inq.id,
      request_id: inq.requestId || inq.id.replace('INQ-', 'REQ-'),
      user_id: inq.userId || null,
      user_email: inq.userEmail || null,
      user_name: inq.userName || 'Student',
      title: inq.title || 'Academic Service Request',
      subject: inq.subject || 'General Coursework',
      service: inq.service || 'Assignment Writing',
      deadline: parseIsoDate(inq.deadline),
      status: inq.status || 'active',
      status_label: inq.statusLabel || 'In Progress',
      assigned_specialist: inq.assignedSpecialist || 'Admin',
      latest_message: inq.latestMessage || null,
      latest_message_time: parseIsoDate(inq.latestMessageTime),
      unread_count: typeof inq.unreadCount === 'number' ? inq.unreadCount : 0,
      created_at: parseIsoDate(inq.createdAt) || new Date().toISOString(),
      updated_at: parseIsoDate(inq.updatedAt) || new Date().toISOString()
    });

    // Extract messages
    if (Array.isArray(inq.messages)) {
      for (const m of inq.messages) {
        if (!m || !m.content) continue;
        let msgId = m.id || `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        if (seenMsgIds.has(msgId)) {
          msgId = `${msgId}_${inq.id}`;
        }
        seenMsgIds.add(msgId);

        messageRecords.push({
          id: msgId,
          inquiry_id: inq.id,
          request_id: m.requestId || inq.requestId,
          sender_role: m.senderRole || 'user',
          sender_name: m.senderName || 'Student',
          sender_badge: m.senderBadge || null,
          sender_id: m.senderId || null,
          content: m.content,
          attachments: m.attachments || [],
          created_at: parseIsoDate(m.createdAt) || new Date().toISOString()
        });
      }
    }
  }

  console.log(`[MIGRATION] Upserting ${inquiryRecords.length} inquiries to PostgreSQL...`);
  for (let i = 0; i < inquiryRecords.length; i += BATCH_SIZE) {
    const chunk = inquiryRecords.slice(i, i + BATCH_SIZE);
    const { error } = await supabaseAdmin
      .from('inquiries')
      .upsert(chunk, { onConflict: 'id' });
    if (error) {
      throw new Error(`Failed to upsert inquiries batch ${i}: ${error.message}`);
    }
  }
  console.log(`[SUCCESS] Inquiries migrated: ${inquiryRecords.length}`);

  console.log(`[MIGRATION] Upserting ${messageRecords.length} inquiry messages to PostgreSQL...`);
  for (let i = 0; i < messageRecords.length; i += BATCH_SIZE) {
    const chunk = messageRecords.slice(i, i + BATCH_SIZE);
    const { error } = await supabaseAdmin
      .from('inquiry_messages')
      .upsert(chunk, { onConflict: 'id' });
    if (error) {
      throw new Error(`Failed to upsert inquiry_messages batch ${i}: ${error.message}`);
    }
  }
  console.log(`[SUCCESS] Inquiry messages migrated: ${messageRecords.length}`);

  // 4. Prepare & Migrate Academic Profiles
  const academicRecords = [];
  for (const userId of Object.keys(rawAcademics)) {
    const p = rawAcademics[userId];
    if (!userId || !p) continue;

    academicRecords.push({
      user_id: userId,
      student_name: p.studentName || p.student_name || null,
      branch: p.branch || null,
      year: p.year || null,
      semester: p.semester || null,
      division: p.division || null,
      roll_no: p.rollNo || p.roll_no || null,
      created_at: parseIsoDate(p.createdAt) || new Date().toISOString(),
      updated_at: parseIsoDate(p.updatedAt) || new Date().toISOString()
    });
  }

  if (academicRecords.length > 0) {
    console.log(`[MIGRATION] Upserting ${academicRecords.length} academic profiles to PostgreSQL...`);
    const { error } = await supabaseAdmin
      .from('academic_profiles')
      .upsert(academicRecords, { onConflict: 'user_id' });
    if (error) {
      throw new Error(`Failed to upsert academic_profiles: ${error.message}`);
    }
    console.log(`[SUCCESS] Academic profiles migrated: ${academicRecords.length}`);
  } else {
    console.log('[MIGRATION] No existing academic profiles in JSON. Table is initialized and ready.');
  }

  // 5. Verification Phase: Check live PostgreSQL row counts
  console.log('=== VERIFYING DATABASE RECORD COUNTS ===');

  const { count: reqCount, error: reqErr } = await supabaseAdmin
    .from('service_requests')
    .select('*', { count: 'exact', head: true });
  if (reqErr) throw reqErr;

  const { count: inqCount, error: inqErr } = await supabaseAdmin
    .from('inquiries')
    .select('*', { count: 'exact', head: true });
  if (inqErr) throw inqErr;

  const { count: msgCount, error: msgErr } = await supabaseAdmin
    .from('inquiry_messages')
    .select('*', { count: 'exact', head: true });
  if (msgErr) throw msgErr;

  const { count: acadCount, error: acadErr } = await supabaseAdmin
    .from('academic_profiles')
    .select('*', { count: 'exact', head: true });
  if (acadErr) throw acadErr;

  console.log(`[VERIFIED] public.service_requests count in DB: ${reqCount} (Expected: ${requestRecords.length})`);
  console.log(`[VERIFIED] public.inquiries count in DB: ${inqCount} (Expected: ${inquiryRecords.length})`);
  console.log(`[VERIFIED] public.inquiry_messages count in DB: ${msgCount} (Expected: ${messageRecords.length})`);
  console.log(`[VERIFIED] public.academic_profiles count in DB: ${acadCount} (Expected: ${academicRecords.length})`);

  if (reqCount !== requestRecords.length || inqCount !== inquiryRecords.length || msgCount !== messageRecords.length) {
    throw new Error('Record count mismatch between migrated JSON and PostgreSQL.');
  }

  console.log('=== MIGRATION AND INTEGRITY VERIFICATION SUCCEEDED ===');
}

if (require.main === module) {
  migrate().catch((err) => {
    console.error('[FATAL MIGRATION ERROR]', err);
    process.exit(1);
  });
}

module.exports = { migrate };
