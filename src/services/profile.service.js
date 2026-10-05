const { supabaseAdmin } = require('../config/supabase');
const env = require('../config/env');
const { ROLES } = require('../constants/roles');

class ProfileService {
  /**
   * Get user profile by user UUID including associated college details
   */
  async getProfile(userId, client = supabaseAdmin) {
    const { data: profile, error } = await client
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
      .single();

    if (error || !profile) {
      // Auto-heal: If user is authenticated in Supabase Auth but profile row is missing
      try {
        const { data: authUserData } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (authUserData?.user) {
          const u = authUserData.user;
          const meta = u.user_metadata || {};
          const fullName = meta.full_name || meta.fullName || u.email.split('@')[0];
          const mobile = meta.mobile || null;
          const role = meta.role || ROLES.STUDENT;

          const { data: createdProf, error: createErr } = await supabaseAdmin
            .from('profiles')
            .upsert({
              id: userId,
              full_name: fullName,
              email: u.email,
              mobile: mobile,
              role: role,
              college_id: env.DEFAULT_COLLEGE_ID
            })
            .select()
            .single();

          if (createdProf && !createErr) {
            return {
              id: createdProf.id,
              fullName: createdProf.full_name,
              email: createdProf.email,
              mobile: createdProf.mobile,
              role: createdProf.role,
              college: null,
              createdAt: createdProf.created_at,
              updatedAt: createdProf.updated_at
            };
          }
        }
      } catch (healErr) {
        console.warn('[PROFILE AUTO-HEAL FAILED]:', healErr.message);
      }

      const customError = new Error('User profile not found.');
      customError.statusCode = 404;
      customError.code = 'PROFILE_NOT_FOUND';
      throw customError;
    }

    return {
      id: profile.id,
      fullName: profile.full_name,
      email: profile.email,
      mobile: profile.mobile,
      role: profile.role,
      college: profile.colleges
        ? {
            id: profile.colleges.id,
            name: profile.colleges.name,
            code: profile.colleges.code
          }
        : null,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    };
  }

  /**
   * Create profile record after successful auth user creation
   */
  async createProfile({ userId, fullName, email, mobile, role = ROLES.STUDENT, collegeId }) {
    const targetCollegeId = collegeId || env.DEFAULT_COLLEGE_ID;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        full_name: fullName,
        email,
        mobile,
        role,
        college_id: targetCollegeId
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user profile: ${error.message}`);
    }

    return data;
  }

  /**
   * Update allowed profile fields (full_name) for an authenticated user
   */
  async updateProfile(userId, updates, client = supabaseAdmin) {
    const allowedUpdates = {};
    if (updates.full_name !== undefined) {
      allowedUpdates.full_name = updates.full_name;
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return this.getProfile(userId, client);
    }

    const { error } = await client
      .from('profiles')
      .update(allowedUpdates)
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return this.getProfile(userId, client);
  }

  /**
   * Get student's academic details (branch, year, semester, etc.)
   */
  async getAcademicDetails(userId) {
    if (!userId) return null;
    try {
      const { data, error } = await supabaseAdmin
        .from('academic_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) return null;

      return {
        studentName: data.student_name,
        branch: data.branch,
        year: data.year,
        semester: data.semester,
        division: data.division,
        rollNo: data.roll_no,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (err) {
      console.error('[PROFILE_SERVICE] Error reading academic details from DB:', err.message);
      return null;
    }
  }

  /**
   * Save student's academic details
   */
  async saveAcademicDetails(userId, details = {}) {
    if (!userId) {
      throw new Error('User ID is required to save academic details.');
    }

    const payload = {
      user_id: userId,
      student_name: details.studentName || details.student_name || null,
      branch: details.branch || null,
      year: details.year || null,
      semester: details.semester || null,
      division: details.division || null,
      roll_no: details.rollNo || details.roll_no || null,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('academic_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('[PROFILE_SERVICE] Error saving academic details in DB:', error.message);
      throw new Error(`Failed to save academic details: ${error.message}`);
    }

    return {
      studentName: data.student_name,
      branch: data.branch,
      year: data.year,
      semester: data.semester,
      division: data.division,
      rollNo: data.roll_no,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}

module.exports = new ProfileService();
