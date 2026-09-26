const env = require('../config/env');
const { supabase, supabaseAdmin, createScopedClient } = require('../config/supabase');
const otpService = require('./otp.service');
const profileService = require('./profile.service');
const { ROLES } = require('../constants/roles');
const errorMessages = require('../constants/errorMessages');

class AuthService {
  /**
   * Step 1: Initiate user registration and send Mobile OTP
   */
  async initiateRegistration({ fullName, email, mobile, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedMobile = mobile.trim();

    // 1. Check if email is already registered in profiles
    const { data: existingEmailUser } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingEmailUser) {
      const customError = new Error(errorMessages.AUTH.EMAIL_ALREADY_EXISTS);
      customError.statusCode = 409;
      customError.code = 'EMAIL_ALREADY_EXISTS';
      throw customError;
    }

    // 2. Check if mobile number is already registered in profiles
    const { data: existingMobileUser } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('mobile', normalizedMobile)
      .maybeSingle();

    if (existingMobileUser) {
      const customError = new Error(errorMessages.AUTH.MOBILE_ALREADY_EXISTS);
      customError.statusCode = 409;
      customError.code = 'MOBILE_ALREADY_EXISTS';
      throw customError;
    }

    // 3. Create verification record and dispatch OTP
    const verificationData = await otpService.createRegistrationVerification({
      fullName: fullName.trim(),
      email: normalizedEmail,
      mobile: normalizedMobile,
      password
    });

    return {
      message: 'Verification OTP has been sent to your email address.',
      ...(env.NODE_ENV === 'development' ? { devOtp: verificationData.rawOtp } : {}),
      ...verificationData
    };
  }

  /**
   * Step 2: Verify Mobile OTP and create Supabase Auth user & profile
   */
  async verifyAndCompleteRegistration({ verificationId, otp }) {
    // 1. Verify OTP and decrypt temporary password
    const verifiedRecord = await otpService.verifyRegistrationOtp({ verificationId, otp });

    // 2. Check if auth user already exists in Supabase Auth
    const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers();
    const emailConflict = existingAuthUsers?.users?.find(
      (u) => u.email?.toLowerCase() === verifiedRecord.email.toLowerCase()
    );

    let authUserId;

    if (emailConflict) {
      authUserId = emailConflict.id;
      // Update password to the newly verified password
      await supabaseAdmin.auth.admin.updateUserById(authUserId, {
        password: verifiedRecord.rawPassword,
        email_confirm: true
      });
    } else {
      // 3. Create user in Supabase Auth via Admin API
      const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: verifiedRecord.email,
        password: verifiedRecord.rawPassword,
        email_confirm: true,
        user_metadata: {
          full_name: verifiedRecord.full_name,
          mobile: verifiedRecord.mobile,
          role: ROLES.STUDENT
        }
      });

      if (authError) {
        throw new Error(`Failed to create authentication user: ${authError.message}`);
      }

      authUserId = newAuthUser.user.id;
    }

    // 4. Create profile record in database
    let profile;
    try {
      profile = await profileService.createProfile({
        userId: authUserId,
        fullName: verifiedRecord.full_name,
        email: verifiedRecord.email,
        mobile: verifiedRecord.mobile,
        role: ROLES.STUDENT
      });
    } catch (profileErr) {
      // If profile already exists, fetch it
      profile = await profileService.getProfile(authUserId);
    }

    return {
      message: 'Registration and mobile verification completed successfully.',
      user: {
        id: authUserId,
        email: verifiedRecord.email,
        fullName: verifiedRecord.full_name,
        mobile: verifiedRecord.mobile,
        role: ROLES.STUDENT
      },
      profile
    };
  }

  /**
   * Resend Mobile OTP for pending registration
   */
  async resendRegistrationOtp({ verificationId }) {
    const resendData = await otpService.resendOtp({ verificationId });
    return {
      message: 'A fresh OTP has been sent to your email address.',
      ...(env.NODE_ENV === 'development' ? { devOtp: resendData.rawOtp } : {}),
      ...resendData
    };
  }

  /**
   * User Login with Email and Password
   */
  async login({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();

    // Authenticate with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });

    if (error || !data?.user || !data?.session) {
      const customError = new Error(errorMessages.AUTH.INVALID_CREDENTIALS);
      customError.statusCode = 401;
      customError.code = 'INVALID_CREDENTIALS';
      throw customError;
    }

    // Fetch user profile
    const profile = await profileService.getProfile(data.user.id);

    return {
      message: 'Login successful.',
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresIn: data.session.expires_in,
        tokenType: data.session.token_type
      },
      user: {
        id: data.user.id,
        email: data.user.email,
        role: profile.role
      },
      profile
    };
  }

  /**
   * Forgot Password - triggers native Supabase password reset email
   */
  async forgotPassword({ email, redirectTo }) {
    const normalizedEmail = email.trim().toLowerCase();

    // Trigger Supabase native reset email
    await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: redirectTo || undefined
    });

    // Always return a generic success message to prevent account enumeration
    return {
      message: 'If an account with that email exists, a password reset link has been sent to your inbox.'
    };
  }

  /**
   * Set New Password (authenticated reset link session)
   */
  async resetPassword({ password, accessToken }) {
    const client = accessToken ? createScopedClient(accessToken) : supabase;

    const { data, error } = await client.auth.updateUser({
      password
    });

    if (error) {
      const customError = new Error(error.message || 'Failed to update password.');
      customError.statusCode = 400;
      customError.code = 'PASSWORD_UPDATE_FAILED';
      throw customError;
    }

    return {
      message: 'Your password has been updated successfully. You can now log in.'
    };
  }

  /**
   * Logout user session
   */
  async logout({ accessToken }) {
    if (accessToken) {
      const client = createScopedClient(accessToken);
      await client.auth.signOut();
    }

    return {
      message: 'Logged out successfully.'
    };
  }
}

module.exports = new AuthService();
