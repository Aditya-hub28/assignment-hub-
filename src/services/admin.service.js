const { supabaseAdmin } = require('../config/supabase');
const profileService = require('./profile.service');
const storageService = require('./storage.service');

const resolveFilesWithSignedUrls = async (files) => {
  if (!Array.isArray(files) || files.length === 0) return [];
  return Promise.all(
    files.map(async (file) => {
      let signedUrl = file.signedUrl || null;
      if (file.storagePath) {
        try {
          const res = await storageService.getSignedUrl(file.storagePath, 86400); // 24 hours
          signedUrl = res.signedUrl;
        } catch (signErr) {
          console.warn('[STORAGE] Could not generate signed URL for', file.name, signErr.message);
        }
      }
      return {
        ...file,
        signedUrl: signedUrl || file.url,
        url: signedUrl || file.url
      };
    })
  );
};

/**
 * Standard Status to Label and Progress Mapping
 */
const STATUS_METADATA_MAP = {
  pending: { label: 'Pending Review', progress: 25 },
  in_review: { label: 'In Review', progress: 50 },
  in_progress: { label: 'In Progress', progress: 75 },
  completed: { label: 'Delivered', progress: 100 },
  delivered: { label: 'Delivered', progress: 100 },
  cancelled: { label: 'Cancelled', progress: 0 }
};

/**
 * Maps database service request row to application model
 */
const mapDbToRequest = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    service: row.service,
    isCustom: Boolean(row.is_custom),
    customServiceName: row.custom_service_name,
    title: row.title,
    subject: row.subject,
    description: row.description,
    deadline: row.deadline,
    additionalInstructions: row.additional_instructions || '',
    serviceSpecific: row.service_specific || {},
    files: row.files || [],
    status: row.status,
    statusLabel: row.status_label,
    progress: typeof row.progress === 'number' ? row.progress : 25,
    inquiryId: row.inquiry_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

/**
 * Maps database inquiry row to application model
 */
const mapDbToInquiry = (inq, messages = []) => {
  if (!inq) return null;
  return {
    id: inq.id,
    requestId: inq.request_id,
    userId: inq.user_id,
    userEmail: inq.user_email,
    userName: inq.user_name || 'Student',
    title: inq.title,
    subject: inq.subject,
    service: inq.service,
    deadline: inq.deadline,
    status: inq.status,
    statusLabel: inq.status_label,
    assignedSpecialist: inq.assigned_specialist || 'ADMIN',
    latestMessage: inq.latest_message || null,
    latestMessageTime: inq.latest_message_time || inq.updated_at || inq.created_at,
    unreadCount: typeof inq.unread_count === 'number' ? inq.unread_count : 0,
    messages: (messages || []).map((m) => ({
      id: m.id,
      inquiryId: m.inquiry_id,
      requestId: m.request_id,
      senderRole: m.sender_role,
      senderName: m.sender_name,
      senderBadge: m.sender_badge || null,
      senderId: m.sender_id || null,
      content: m.content,
      attachments: m.attachments || [],
      createdAt: m.created_at
    })),
    createdAt: inq.created_at,
    updatedAt: inq.updated_at
  };
};

class AdminService {
  /**
   * 1. GET Dashboard Stats based on real PostgreSQL operational data
   */
  async getDashboardStats() {
    // 1. Fetch requests summary
    const { data: requests, error: reqErr } = await supabaseAdmin
      .from('service_requests')
      .select('id, status, deadline, created_at');

    if (reqErr) {
      console.error('[ADMIN_SERVICE] Error reading requests for stats:', reqErr.message);
      throw new Error(`Failed to load request metrics: ${reqErr.message}`);
    }

    const allRequests = requests || [];
    const totalRequests = allRequests.length;

    let pendingReview = 0;
    let inProgress = 0;
    let completedDelivered = 0;
    let urgentRequests = 0;

    const now = Date.now();
    const fortyEightHoursMs = 48 * 60 * 60 * 1000;

    for (const req of allRequests) {
      const status = (req.status || '').toLowerCase();

      if (status === 'pending' || status === 'in_review') {
        pendingReview++;
      } else if (status === 'in_progress') {
        inProgress++;
      } else if (status === 'completed' || status === 'delivered') {
        completedDelivered++;
      }

      // Urgent calculation: active requests where deadline is <= 48 hours away
      if (!['completed', 'delivered', 'cancelled'].includes(status) && req.deadline) {
        const deadlineTime = new Date(req.deadline).getTime();
        if (!isNaN(deadlineTime)) {
          const diffMs = deadlineTime - now;
          if (diffMs <= fortyEightHoursMs) {
            urgentRequests++;
          }
        }
      }
    }

    // 2. Fetch active inquiries count
    const { count: activeInquiriesCount, error: inqErr } = await supabaseAdmin
      .from('inquiries')
      .select('id', { count: 'exact', head: true })
      .not('status', 'in', '("resolved","closed")');

    if (inqErr) {
      console.error('[ADMIN_SERVICE] Error reading inquiries for stats:', inqErr.message);
    }

    // 3. Fetch total registered students count
    const { count: totalStudentsCount, error: userErr } = await supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'student');

    if (userErr) {
      console.error('[ADMIN_SERVICE] Error reading students count for stats:', userErr.message);
    }

    return {
      totalRequests,
      pendingReview,
      inProgress,
      completedDelivered,
      urgentRequests,
      activeInquiries: typeof activeInquiriesCount === 'number' ? activeInquiriesCount : 0,
      totalStudents: typeof totalStudentsCount === 'number' ? totalStudentsCount : 0
    };
  }

  /**
   * 2. GET All Requests with filtering, search, and pagination
   */
  async getRequests({ page = 1, limit = 20, status, service, search }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    let query = supabaseAdmin
      .from('service_requests')
      .select('*', { count: 'exact' });

    if (status) {
      query = query.eq('status', status.toLowerCase());
    }

    if (service) {
      query = query.eq('service', service);
    }

    if (search && search.trim()) {
      const s = search.trim();
      query = query.or(`id.ilike.%${s}%,title.ilike.%${s}%,subject.ilike.%${s}%,user_name.ilike.%${s}%,user_email.ilike.%${s}%`);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error('[ADMIN_SERVICE] Error fetching requests:', error.message);
      throw new Error(`Failed to retrieve requests: ${error.message}`);
    }

    const total = count || 0;
    const requests = (data || []).map(mapDbToRequest);

    return {
      requests,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    };
  }

  /**
   * 3. GET Request by ID with full details, inquiry info, and student academic profile
   */
  async getRequestById(requestId) {
    const { data: row, error } = await supabaseAdmin
      .from('service_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();

    if (error || !row) {
      const notFoundErr = new Error(`Service request "${requestId}" was not found.`);
      notFoundErr.status = 404;
      notFoundErr.code = 'NOT_FOUND';
      throw notFoundErr;
    }

    const request = mapDbToRequest(row);

    // Resolve direct, secure cloud signed URLs for all attached files
    if (request.files && request.files.length > 0) {
      request.files = await resolveFilesWithSignedUrls(request.files);
    }

    // Fetch linked inquiry preview if present
    let inquiry = null;
    const inquiryLookupId = request.inquiryId || `INQ-${request.id.replace('REQ-', '')}`;
    const { data: inqRow } = await supabaseAdmin
      .from('inquiries')
      .select('*')
      .or(`id.eq."${inquiryLookupId}",request_id.eq."${request.id}"`)
      .maybeSingle();

    if (inqRow) {
      inquiry = {
        id: inqRow.id,
        status: inqRow.status,
        statusLabel: inqRow.status_label,
        latestMessage: inqRow.latest_message,
        latestMessageTime: inqRow.latest_message_time,
        unreadCount: inqRow.unread_count
      };
    }

    // Fetch student's academic profile if userId is available
    let academicProfile = null;
    if (request.userId) {
      academicProfile = await profileService.getAcademicDetails(request.userId);
    }

    return {
      ...request,
      inquiry,
      academicProfile
    };
  }

  /**
   * 4. PATCH Request Status
   */
  async updateRequestStatus(requestId, { status, statusLabel, progress }) {
    // 1. Verify existence of request
    const existing = await this.getRequestById(requestId);

    const targetStatus = status.toLowerCase();
    const meta = STATUS_METADATA_MAP[targetStatus] || { label: 'In Progress', progress: 50 };

    const finalStatusLabel = (statusLabel && statusLabel.trim()) || meta.label;
    const finalProgress = typeof progress === 'number' ? progress : meta.progress;
    const nowIso = new Date().toISOString();

    // 2. Perform safe update of ONLY status-related fields (no mass-assignment)
    const { data: updatedRow, error: updateErr } = await supabaseAdmin
      .from('service_requests')
      .update({
        status: targetStatus,
        status_label: finalStatusLabel,
        progress: finalProgress,
        updated_at: nowIso
      })
      .eq('id', requestId)
      .select()
      .single();

    if (updateErr || !updatedRow) {
      console.error('[ADMIN_SERVICE] Error updating request status in DB:', updateErr?.message);
      throw new Error(`Failed to update request status: ${updateErr?.message || 'Update failed'}`);
    }

    // 3. Keep linked inquiry updated consistently
    try {
      const inqId = existing.inquiryId || `INQ-${requestId.replace('REQ-', '')}`;
      const inqStatus = targetStatus === 'completed' || targetStatus === 'delivered'
        ? 'resolved'
        : targetStatus === 'cancelled'
        ? 'closed'
        : 'in_progress';

      await supabaseAdmin
        .from('inquiries')
        .update({
          status: inqStatus,
          status_label: finalStatusLabel,
          updated_at: nowIso
        })
        .or(`id.eq."${inqId}",request_id.eq."${requestId}"`);
    } catch (inqSyncErr) {
      console.warn('[ADMIN_SERVICE] Notice: could not sync inquiry label:', inqSyncErr.message);
    }

    return mapDbToRequest(updatedRow);
  }

  /**
   * 5. GET All Inquiries with filtering, search, and pagination
   */
  async getInquiries({ page = 1, limit = 20, status, search }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    let query = supabaseAdmin
      .from('inquiries')
      .select('*', { count: 'exact' });

    if (status) {
      query = query.eq('status', status.toLowerCase());
    }

    if (search && search.trim()) {
      const s = search.trim();
      query = query.or(`id.ilike.%${s}%,request_id.ilike.%${s}%,title.ilike.%${s}%,user_name.ilike.%${s}%,user_email.ilike.%${s}%`);
    }

    query = query
      .order('updated_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error('[ADMIN_SERVICE] Error reading inquiries:', error.message);
      throw new Error(`Failed to retrieve inquiries: ${error.message}`);
    }

    const total = count || 0;
    const inquiries = (data || []).map((row) => mapDbToInquiry(row, []));

    return {
      inquiries,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    };
  }

  /**
   * 6. GET Inquiry by ID with complete message history and linked request info
   */
  async getInquiryById(inquiryId) {
    const { data: inqRow, error: inqErr } = await supabaseAdmin
      .from('inquiries')
      .select('*')
      .or(`id.eq."${inquiryId}",request_id.eq."${inquiryId}"`)
      .maybeSingle();

    if (inqErr || !inqRow) {
      const notFoundErr = new Error(`Inquiry "${inquiryId}" was not found.`);
      notFoundErr.status = 404;
      notFoundErr.code = 'NOT_FOUND';
      throw notFoundErr;
    }

    // Fetch full chronological message history
    const { data: messages, error: msgErr } = await supabaseAdmin
      .from('inquiry_messages')
      .select('*')
      .eq('inquiry_id', inqRow.id)
      .order('created_at', { ascending: true });

    if (msgErr) {
      console.error('[ADMIN_SERVICE] Error loading inquiry messages:', msgErr.message);
    }

    // Fetch linked request details
    let request = null;
    if (inqRow.request_id) {
      const { data: reqRow } = await supabaseAdmin
        .from('service_requests')
        .select('*')
        .eq('id', inqRow.request_id)
        .maybeSingle();

      if (reqRow) {
        request = mapDbToRequest(reqRow);
      }
    }

    const inquiry = mapDbToInquiry(inqRow, messages || []);

    return {
      ...inquiry,
      request
    };
  }

  /**
   * 7. POST Admin Message to an Inquiry
   */
  async sendInquiryMessage(inquiryId, { content, attachments = [] }, adminUser = {}, adminProfile = {}) {
    const trimmedContent = (content || '').trim();
    if (!trimmedContent) {
      const err = new Error('Message content cannot be empty.');
      err.status = 400;
      err.code = 'VALIDATION_ERROR';
      throw err;
    }

    // Validate inquiry existence
    const { data: inqRow, error: inqErr } = await supabaseAdmin
      .from('inquiries')
      .select('*')
      .or(`id.eq."${inquiryId}",request_id.eq."${inquiryId}"`)
      .maybeSingle();

    if (inqErr || !inqRow) {
      const notFoundErr = new Error(`Inquiry "${inquiryId}" was not found.`);
      notFoundErr.status = 404;
      notFoundErr.code = 'NOT_FOUND';
      throw notFoundErr;
    }

    const nowIso = new Date().toISOString();
    const messageId = `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const senderName = 'ADMIN';

    const newMessageRecord = {
      id: messageId,
      inquiry_id: inqRow.id,
      request_id: inqRow.request_id,
      sender_role: 'team',
      sender_name: senderName,
      sender_badge: 'Coordinator',
      sender_id: adminUser?.id || 'admin',
      content: trimmedContent,
      attachments: Array.isArray(attachments) ? attachments : [],
      created_at: nowIso
    };

    // 1. Insert message into public.inquiry_messages
    const { error: msgInsertErr } = await supabaseAdmin
      .from('inquiry_messages')
      .insert(newMessageRecord);

    if (msgInsertErr) {
      console.error('[ADMIN_SERVICE] Error inserting admin message into DB:', msgInsertErr.message);
      throw new Error(`Failed to send message: ${msgInsertErr.message}`);
    }

    // 2. Update parent inquiry latest message and unread count
    await supabaseAdmin
      .from('inquiries')
      .update({
        latest_message: trimmedContent,
        latest_message_time: nowIso,
        unread_count: (inqRow.unread_count || 0) + 1,
        updated_at: nowIso
      })
      .eq('id', inqRow.id);

    // 3. Return created message and updated inquiry
    const updatedInquiry = await this.getInquiryById(inqRow.id);

    return {
      message: {
        id: newMessageRecord.id,
        inquiryId: newMessageRecord.inquiry_id,
        requestId: newMessageRecord.request_id,
        senderRole: newMessageRecord.sender_role,
        senderName: newMessageRecord.sender_name,
        senderBadge: newMessageRecord.sender_badge,
        senderId: newMessageRecord.sender_id,
        content: newMessageRecord.content,
        attachments: newMessageRecord.attachments,
        createdAt: newMessageRecord.created_at
      },
      inquiry: updatedInquiry
    };
  }

  /**
   * 8. GET Registered Users / Students roster with pagination and search
   */
  async getUsers({ page = 1, limit = 20, search }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    let query = supabaseAdmin
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        mobile,
        role,
        college_id,
        created_at,
        updated_at,
        colleges (
          id,
          name,
          code
        )
      `, { count: 'exact' })
      .eq('role', 'student');

    if (search && search.trim()) {
      const s = search.trim();
      query = query.or(`full_name.ilike.%${s}%,email.ilike.%${s}%,mobile.ilike.%${s}%`);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    const { data: profiles, count, error } = await query;

    if (error) {
      console.error('[ADMIN_SERVICE] Error reading users:', error.message);
      throw new Error(`Failed to retrieve users: ${error.message}`);
    }

    const total = count || 0;
    const userIds = (profiles || []).map((p) => p.id);

    // Fetch academic profiles for these users
    let academicMap = {};
    if (userIds.length > 0) {
      const { data: academics } = await supabaseAdmin
        .from('academic_profiles')
        .select('*')
        .in('user_id', userIds.map(String));

      (academics || []).forEach((a) => {
        academicMap[a.user_id] = {
          studentName: a.student_name,
          branch: a.branch,
          year: a.year,
          semester: a.semester,
          division: a.division,
          rollNo: a.roll_no,
          updatedAt: a.updated_at
        };
      });
    }

    // Format safe user objects
    const users = (profiles || []).map((p) => ({
      id: p.id,
      fullName: p.full_name,
      email: p.email,
      mobile: p.mobile,
      role: p.role,
      college: p.colleges ? {
        id: p.colleges.id,
        name: p.colleges.name,
        code: p.colleges.code
      } : null,
      academicProfile: academicMap[p.id] || null,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }));

    return {
      users,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    };
  }

  /**
   * 9. GET Single User by ID with profile, academic profile, and request statistics
   */
  async getUserById(userId) {
    const { data: p, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        mobile,
        role,
        college_id,
        created_at,
        updated_at,
        colleges (
          id,
          name,
          code
        )
      `)
      .eq('id', userId)
      .maybeSingle();

    if (error || !p) {
      const notFoundErr = new Error(`User with ID "${userId}" was not found.`);
      notFoundErr.status = 404;
      notFoundErr.code = 'NOT_FOUND';
      throw notFoundErr;
    }

    // Fetch academic details
    const academicProfile = await profileService.getAcademicDetails(p.id);

    // Fetch request count and recent requests
    const { count: requestsCount } = await supabaseAdmin
      .from('service_requests')
      .select('id', { count: 'exact', head: true })
      .or(`user_id.eq."${p.id}",user_email.eq."${p.email}"`);

    const { data: recentRequests } = await supabaseAdmin
      .from('service_requests')
      .select('id, service, title, status, status_label, deadline, created_at')
      .or(`user_id.eq."${p.id}",user_email.eq."${p.email}"`)
      .order('created_at', { ascending: false })
      .limit(5);

    // Fetch inquiry count
    const { count: inquiriesCount } = await supabaseAdmin
      .from('inquiries')
      .select('id', { count: 'exact', head: true })
      .or(`user_id.eq."${p.id}",user_email.eq."${p.email}"`);

    return {
      id: p.id,
      fullName: p.full_name,
      email: p.email,
      mobile: p.mobile,
      role: p.role,
      college: p.colleges ? {
        id: p.colleges.id,
        name: p.colleges.name,
        code: p.colleges.code
      } : null,
      academicProfile: academicProfile || null,
      stats: {
        totalRequests: requestsCount || 0,
        totalInquiries: inquiriesCount || 0
      },
      recentRequests: (recentRequests || []).map((r) => ({
        id: r.id,
        service: r.service,
        title: r.title,
        status: r.status,
        statusLabel: r.status_label,
        deadline: r.deadline,
        createdAt: r.created_at
      })),
      createdAt: p.created_at,
      updatedAt: p.updated_at
    };
  }
}

module.exports = new AdminService();
