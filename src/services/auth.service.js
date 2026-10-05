const env = require('../config/env');
const { supabase, supabaseAdmin, createScopedClient } = require('../config/supabase');
const otpService = require('./otp.service');
const profileService = require('./profile.service');
const { ROLES } = require('../constants/roles');
const errorMessages = require('../constants/errorMessages');

class AuthService {
  /**
   * Direct OTP-Free Registration: Creates Supabase Auth user & profile immediately
   */
  async register({ fullName, email, mobile, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedMobile = mobile.trim();

    // 1. Check in parallel if email or mobile are already registered in profiles
    const [existingEmailRes, existingMobileRes] = await Promise.all([
      supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle(),
      supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('mobile', normalizedMobile)
        .maybeSingle()
    ]);

    if (existingEmailRes?.data) {
      const customError = new Error(errorMessages.AUTH.EMAIL_ALREADY_EXISTS);
      customError.statusCode = 409;
      customError.code = 'EMAIL_ALREADY_EXISTS';
      throw customError;
    }

    if (existingMobileRes?.data) {
      const customError = new Error(errorMessages.AUTH.MOBILE_ALREADY_EXISTS);
      customError.statusCode = 409;
      customError.code = 'MOBILE_ALREADY_EXISTS';
      throw customError;
    }

    let authUserId;

    // 2. Create user in Supabase Auth via Admin API with auto-confirmed email
    const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName.trim(),
        mobile: normalizedMobile,
        role: ROLES.STUDENT
      }
    });

    if (authError) {
      if (authError.message?.toLowerCase().includes('already') || authError.status === 422) {
        const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers();
        const emailConflict = existingAuthUsers?.users?.find(
          (u) => u.email?.toLowerCase() === normalizedEmail
        );
        if (emailConflict) {
          authUserId = emailConflict.id;
          await supabaseAdmin.auth.admin.updateUserById(authUserId, {
            password,
            email_confirm: true,
            user_metadata: {
              full_name: fullName.trim(),
              mobile: normalizedMobile,
              role: ROLES.STUDENT
            }
          });
        } else {
          const customError = new Error(errorMessages.AUTH.EMAIL_ALREADY_EXISTS);
          customError.statusCode = 409;
          customError.code = 'EMAIL_ALREADY_EXISTS';
          throw customError;
        }
      } else {
        throw new Error(`Failed to create authentication user: ${authError.message}`);
      }
    } else {
      authUserId = newAuthUser.user.id;
    }

    // 3. Create or fetch profile record in database
    let profile;
    try {
      profile = await profileService.createProfile({
        userId: authUserId,
        fullName: fullName.trim(),
        email: normalizedEmail,
        mobile: normalizedMobile,
        role: ROLES.STUDENT
      });
    } catch (profileErr) {
      profile = await profileService.getProfile(authUserId);
    }

    // 4. Generate active session so user is immediately logged in
    let session = null;
    try {
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });

      if (signInData?.session) {
        session = {
          accessToken: signInData.session.access_token,
          refreshToken: signInData.session.refresh_token,
          expiresIn: signInData.session.expires_in,
          tokenType: signInData.session.token_type
        };
      }
    } catch (e) {
      // Sign-in will fall back to manual login if needed
    }

    return {
      message: 'Registration completed successfully.',
      session,
      user: {
        id: authUserId,
        email: normalizedEmail,
        fullName: fullName.trim(),
        mobile: normalizedMobile,
        role: ROLES.STUDENT
      },
      profile
    };
  }

  /**
   * Step 1: Initiate user registration and send Mobile OTP
   */
  async initiateRegistration({ fullName, email, mobile, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedMobile = mobile.trim();

    // 1 & 2. Check in parallel if email or mobile are already registered in profiles
    const [existingEmailRes, existingMobileRes] = await Promise.all([
      supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle(),
      supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('mobile', normalizedMobile)
        .maybeSingle()
    ]);

    if (existingEmailRes?.data) {
      const customError = new Error(errorMessages.AUTH.EMAIL_ALREADY_EXISTS);
      customError.statusCode = 409;
      customError.code = 'EMAIL_ALREADY_EXISTS';
      throw customError;
    }

    if (existingMobileRes?.data) {
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
      devOtp: verificationData.rawOtp,
      otpHint: verificationData.rawOtp,
      rawOtp: verificationData.rawOtp,
      ...verificationData
    };
  }

  /**
   * Step 2: Verify Mobile OTP and create Supabase Auth user & profile
   */
  async verifyAndCompleteRegistration({ verificationId, otp }) {
    // 1. Verify OTP and decrypt temporary password
    const verifiedRecord = await otpService.verifyRegistrationOtp({ verificationId, otp });

    let authUserId;

    // 2. Fast-path: Create user in Supabase Auth via Admin API
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
      // If user already exists, update their password
      if (authError.message?.toLowerCase().includes('already') || authError.status === 422) {
        const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers();
        const emailConflict = existingAuthUsers?.users?.find(
          (u) => u.email?.toLowerCase() === verifiedRecord.email.toLowerCase()
        );
        if (emailConflict) {
          authUserId = emailConflict.id;
          await supabaseAdmin.auth.admin.updateUserById(authUserId, {
            password: verifiedRecord.rawPassword,
            email_confirm: true
          });
        } else {
          throw new Error(`Failed to create authentication user: ${authError.message}`);
        }
      } else {
        throw new Error(`Failed to create authentication user: ${authError.message}`);
      }
    } else {
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

    // 5. Generate active session so user is immediately logged in
    let session = null;
    try {
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: verifiedRecord.email,
        password: verifiedRecord.rawPassword
      });

      if (signInData?.session) {
        session = {
          accessToken: signInData.session.access_token,
          refreshToken: signInData.session.refresh_token,
          expiresIn: signInData.session.expires_in,
          tokenType: signInData.session.token_type
        };
      }
    } catch (e) {
      // Registration is verified; sign-in error will fall back to manual login
    }

    return {
      message: 'Registration and mobile verification completed successfully.',
      session,
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
      devOtp: resendData.rawOtp,
      otpHint: resendData.rawOtp,
      rawOtp: resendData.rawOtp,
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
   * Set New Password (authenticated reset link session or recovery OTP)
   */
  async resetPassword({ password, accessToken, otp, email }) {
    let client;
    if (otp && email) {
      const { data: sessionData, error: verifyErr } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otp.trim(),
        type: 'recovery'
      });
      if (verifyErr || !sessionData?.session?.access_token) {
        const customError = new Error(verifyErr?.message || 'Invalid or expired recovery code.');
        customError.statusCode = 400;
        customError.code = 'INVALID_OTP';
        throw customError;
      }
      client = createScopedClient(sessionData.session.access_token);
    } else if (accessToken) {
      client = createScopedClient(accessToken);
    } else {
      const customError = new Error('Authentication or verification code is required to reset password.');
      customError.statusCode = 401;
      customError.code = 'UNAUTHORIZED';
      throw customError;
    }

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
