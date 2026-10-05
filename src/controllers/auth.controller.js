const authService = require('../services/auth.service');

class AuthController {
  /**
   * POST /api/v1/auth/register
   * Direct OTP-Free Registration: Creates user, profile & issues session
   */
  async register(req, res, next) {
    try {
      const { full_name, email, mobile, password } = req.body;
      const result = await authService.register({
        fullName: full_name,
        email,
        mobile,
        password
      });

      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/register/initiate
   * Validates full_name, email, mobile, password and sends mobile OTP
   */
  async initiateRegistration(req, res, next) {
    try {
      const { full_name, email, mobile, password } = req.body;
      const result = await authService.initiateRegistration({
        fullName: full_name,
        email,
        mobile,
        password
      });

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/register/verify-otp
   * Verifies mobile OTP and finalizes Supabase user & profile creation
   */
  async verifyRegistrationOtp(req, res, next) {
    try {
      const { verification_id, otp } = req.body;
      const result = await authService.verifyAndCompleteRegistration({
        verificationId: verification_id,
        otp
      });

      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/register/resend-otp
   * Resends mobile OTP subject to cooldown and max resend limits
   */
  async resendRegistrationOtp(req, res, next) {
    try {
      const { verification_id } = req.body;
      const result = await authService.resendRegistrationOtp({
        verificationId: verification_id
      });

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/login
   * Authenticates with Supabase Auth (Email + Password only, no OTP)
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({
        email,
        password
      });

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/forgot-password
   * Dispatches native Supabase password reset email
   */
  async forgotPassword(req, res, next) {
    try {
      const { email, redirect_to } = req.body;
      const result = await authService.forgotPassword({
        email,
        redirectTo: redirect_to
      });

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/reset-password
   * Sets new password for user with authenticated recovery session
   */
  async resetPassword(req, res, next) {
    try {
      const { password, new_password, otp, email } = req.body;
      const targetPassword = password || new_password;
      const accessToken = req.accessToken || req.headers.authorization?.split(' ')[1];

      const result = await authService.resetPassword({
        password: targetPassword,
        accessToken,
        otp,
        email
      });

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Logs out user and invalidates Supabase session
   */
  async logout(req, res, next) {
    try {
      const accessToken = req.accessToken;
      const result = await authService.logout({
        accessToken
      });

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
