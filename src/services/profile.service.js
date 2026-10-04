const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('../config/supabase');
const env = require('../config/env');
const { ROLES } = require('../constants/roles');

const DATA_DIR = path.resolve(process.cwd(), 'data');
const ACADEMICS_FILE = path.join(DATA_DIR, 'academic_profiles.json');

const loadAcademics = () => {
  try {
    if (!fs.existsSync(ACADEMICS_FILE)) return {};
    const raw = fs.readFileSync(ACADEMICS_FILE, 'utf-8');
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
};

const saveAcademics = (data) => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ACADEMICS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[PROFILE_SERVICE] Error saving academic profiles:', err.message);
  }
};

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
  getAcademicDetails(userId) {
    if (!userId) return null;
    const all = loadAcademics();
    return all[userId] || null;
  }

  /**
   * Save student's academic details
   */
  saveAcademicDetails(userId, details = {}) {
    if (!userId) {
      throw new Error('User ID is required to save academic details.');
    }
    const all = loadAcademics();
    all[userId] = {
      ...(all[userId] || {}),
      ...details,
      updatedAt: new Date().toISOString()
    };
    saveAcademics(all);
    return all[userId];
  }
}

module.exports = new ProfileService();
