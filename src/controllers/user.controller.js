const profileService = require('../services/profile.service');

class UserController {
  /**
   * GET /api/v1/user/profile
   * Returns current authenticated user's profile and associated college
   */
  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const profile = await profileService.getProfile(userId, req.scopedClient);

      return res.status(200).json({
        success: true,
        data: {
          profile
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/user/profile
   * Updates allowed profile attributes (e.g. full_name)
   */
  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { full_name } = req.body;

      const updatedProfile = await profileService.updateProfile(
        userId,
        { full_name },
        req.scopedClient
      );

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: {
          profile: updatedProfile
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/user/me
   * Quick identity check returning user and profile info
   */
  async getMe(req, res, next) {
    try {
      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: req.user.id,
            email: req.user.email,
            role: req.profile?.role || 'student'
          },
          profile: req.profile
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/user/academic-details
   * Get student's academic branch, year, semester, etc.
   */
  async getAcademicDetails(req, res, next) {
    try {
      const userId = req.user.id;
      const details = await profileService.getAcademicDetails(userId);
      return res.status(200).json({
        success: true,
        data: details || null
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/user/academic-details
   * Update student's academic branch, year, semester, roll no, etc.
   */
  async updateAcademicDetails(req, res, next) {
    try {
      const userId = req.user.id;
      const details = req.body || {};
      const updated = await profileService.saveAcademicDetails(userId, details);
      return res.status(200).json({
        success: true,
        message: 'Academic details updated successfully.',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
