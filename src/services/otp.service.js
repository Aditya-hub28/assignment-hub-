const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { supabaseAdmin } = require('../config/supabase');
const env = require('../config/env');
const smsService = require('./sms.service');
const emailService = require('./email.service');
const errorMessages = require('../constants/errorMessages');

// Generate 32-byte key from service key or secret for temporary payload encryption
const SECRET_KEY = crypto
  .createHash('sha256')
  .update(env.SUPABASE_SERVICE_ROLE_KEY || 'assignmenthub-fallback-secret-key-32b')
  .digest();

class OtpService {
  /**
   * Encrypt temporary password payload with AES-256-GCM
   */
  encryptPassword(plainPassword) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', SECRET_KEY, iv);
    let encrypted = cipher.update(plainPassword, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypt temporary password payload
   */
  decryptPassword(encryptedPayload) {
    try {
      const [ivHex, authTagHex, encryptedHex] = encryptedPayload.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-gcm', SECRET_KEY, iv);
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (err) {
      throw new Error('Failed to securely decrypt registration credentials.');
    }
  }

  /**
   * Generate a cryptographically secure 6-digit numeric OTP
   */
  generateNumericOtp() {
    return crypto.randomInt(100000, 1000000).toString();
  }

  /**
   * Hash OTP before saving to database
   */
  async hashOtp(otp) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(otp, salt);
  }

  /**
   * Compare submitted OTP against stored hash
   */
  async compareOtp(plainOtp, hashedOtp) {
    return bcrypt.compare(plainOtp, hashedOtp);
  }

  /**
   * Create a new registration OTP verification record and send SMS
   */
  async createRegistrationVerification({ fullName, email, mobile, password }) {
    // Generate OTP & prepare credentials in parallel
    const rawOtp = this.generateNumericOtp();
    const [otpHash, encryptedPassword] = await Promise.all([
      this.hashOtp(rawOtp),
      Promise.resolve(this.encryptPassword(password)),
      // Clean up previous unverified records directly
      supabaseAdmin
        .from('otp_verifications')
        .delete()
        .or(`email.eq.${email},mobile.eq.${mobile}`)
        .eq('is_verified', false)
    ]);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + env.OTP.EXPIRY_MINUTES * 60 * 1000);

    // Insert new verification record
    const { data, error } = await supabaseAdmin
      .from('otp_verifications')
      .insert({
        full_name: fullName,
        email,
        mobile,
        password_hash: encryptedPassword,
        otp_hash: otpHash,
        attempts: 0,
        max_attempts: env.OTP.MAX_ATTEMPTS,
        resend_count: 0,
        max_resends: env.OTP.MAX_RESENDS,
        last_sent_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        is_verified: false
      })
      .select('id, expires_at, resend_count')
      .single();

    if (error) {
      throw new Error(`Failed to initialize verification session: ${error.message}`);
    }

    // Dispatch OTP Email with safety race so network delays never block the signup response
    try {
      const emailPromise = emailService.sendOtpEmail(email, rawOtp, fullName);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Email dispatch timeout')), 7000)
      );
      const emailRes = await Promise.race([emailPromise, timeoutPromise]);
      if (emailRes?.messageId) {
        console.log(`[EMAIL DISPATCH SUCCESS] OTP delivered to ${email} (MessageId: ${emailRes.messageId})`);
      }
    } catch (emailErr) {
      console.warn(`[EMAIL DISPATCH NOTICE] Background delivery continuing for ${email}:`, emailErr.message);
    }

    // Optional SMS dispatch in background (never blocks or delays user response)
    if (mobile && env.SMS_PROVIDER !== 'none') {
      smsService.sendOtp(mobile, rawOtp).catch((err) => {
        console.warn('[SMS BACKGROUND NOTICE]:', err.message);
      });
    }

    return {
      verificationId: data.id,
      verification_id: data.id,
      email,
      expiresAt: data.expires_at,
      resendCooldownSeconds: env.OTP.RESEND_COOLDOWN_SECONDS,
      previewUrl: null,
      rawOtp
    };
  }

  /**
   * Verify registration OTP
   */
  async verifyRegistrationOtp({ verificationId, otp }) {
    const { data: record, error } = await supabaseAdmin
      .from('otp_verifications')
      .select('*')
      .eq('id', verificationId)
      .single();

    if (error || !record || record.is_verified) {
      const customError = new Error(errorMessages.OTP.VERIFICATION_NOT_FOUND);
      customError.statusCode = 400;
      customError.code = 'VERIFICATION_NOT_FOUND';
      throw customError;
    }

    const now = new Date();

    // 1. Check temporary lock
    if (record.locked_until && new Date(record.locked_until) > now) {
      const remainingSeconds = Math.ceil((new Date(record.locked_until).getTime() - now.getTime()) / 1000);
      const customError = new Error(`Account verification is temporarily locked. Try again in ${Math.ceil(remainingSeconds / 60)} minutes.`);
      customError.statusCode = 429;
      customError.code = 'OTP_LOCKED';
      throw customError;
    }

    // 2. Check expiration
    if (new Date(record.expires_at) < now) {
      const customError = new Error(errorMessages.OTP.EXPIRED_OTP);
      customError.statusCode = 400;
      customError.code = 'OTP_EXPIRED';
      throw customError;
    }

    // 3. Check attempts count
    if (record.attempts >= record.max_attempts) {
      const lockUntil = new Date(now.getTime() + env.OTP.LOCKOUT_MINUTES * 60 * 1000);
      await supabaseAdmin
        .from('otp_verifications')
        .update({ locked_until: lockUntil.toISOString() })
        .eq('id', verificationId);

      const customError = new Error(errorMessages.OTP.MAX_ATTEMPTS_EXCEEDED);
      customError.statusCode = 429;
      customError.code = 'MAX_ATTEMPTS_EXCEEDED';
      throw customError;
    }

    // 4. Verify OTP match
    const isMatch = await this.compareOtp(otp, record.otp_hash);

    if (!isMatch) {
      const newAttempts = record.attempts + 1;
      const updates = { attempts: newAttempts };

      if (newAttempts >= record.max_attempts) {
        updates.locked_until = new Date(now.getTime() + env.OTP.LOCKOUT_MINUTES * 60 * 1000).toISOString();
      }

      await supabaseAdmin
        .from('otp_verifications')
        .update(updates)
        .eq('id', verificationId);

      if (newAttempts >= record.max_attempts) {
        const customError = new Error(errorMessages.OTP.MAX_ATTEMPTS_EXCEEDED);
        customError.statusCode = 429;
        customError.code = 'MAX_ATTEMPTS_EXCEEDED';
        throw customError;
      }

      const remaining = record.max_attempts - newAttempts;
      const customError = new Error(`Invalid OTP. You have ${remaining} attempt(s) remaining.`);
      customError.statusCode = 400;
      customError.code = 'INVALID_OTP';
      throw customError;
    }

    // Mark as verified
    await supabaseAdmin
      .from('otp_verifications')
      .update({ is_verified: true })
      .eq('id', verificationId);

    // Decrypt the original password for Supabase Auth account creation
    const rawPassword = this.decryptPassword(record.password_hash);

    return {
      ...record,
      rawPassword
    };
  }

  /**
   * Resend OTP
   */
  async resendOtp({ verificationId }) {
    const { data: record, error } = await supabaseAdmin
      .from('otp_verifications')
      .select('*')
      .eq('id', verificationId)
      .single();

    if (error || !record || record.is_verified) {
      const customError = new Error(errorMessages.OTP.VERIFICATION_NOT_FOUND);
      customError.statusCode = 400;
      customError.code = 'VERIFICATION_NOT_FOUND';
      throw customError;
    }

    const now = new Date();

    // Check temporary lock
    if (record.locked_until && new Date(record.locked_until) > now) {
      const remainingSeconds = Math.ceil((new Date(record.locked_until).getTime() - now.getTime()) / 1000);
      const customError = new Error(`Verification is temporarily locked. Try again in ${Math.ceil(remainingSeconds / 60)} minutes.`);
      customError.statusCode = 429;
      customError.code = 'OTP_LOCKED';
      throw customError;
    }

    // Check resend limit
    if (record.resend_count >= record.max_resends) {
      const customError = new Error(errorMessages.OTP.MAX_RESENDS_EXCEEDED);
      customError.statusCode = 429;
      customError.code = 'MAX_RESENDS_EXCEEDED';
      throw customError;
    }

    // Check cooldown (60 seconds)
    const lastSent = new Date(record.last_sent_at);
    const elapsedSeconds = Math.floor((now.getTime() - lastSent.getTime()) / 1000);

    if (elapsedSeconds < env.OTP.RESEND_COOLDOWN_SECONDS) {
      const waitTime = env.OTP.RESEND_COOLDOWN_SECONDS - elapsedSeconds;
      const customError = new Error(`Please wait ${waitTime} seconds before requesting a new OTP.`);
      customError.statusCode = 429;
      customError.code = 'RESEND_COOLDOWN';
      throw customError;
    }

    // Generate new OTP & hash
    const rawOtp = this.generateNumericOtp();
    const otpHash = await this.hashOtp(rawOtp);
    const expiresAt = new Date(now.getTime() + env.OTP.EXPIRY_MINUTES * 60 * 1000);

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('otp_verifications')
      .update({
        otp_hash: otpHash,
        attempts: 0,
        resend_count: record.resend_count + 1,
        last_sent_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        locked_until: null
      })
      .eq('id', verificationId)
      .select('id, expires_at, resend_count, max_resends')
      .single();

    if (updateError) {
      throw new Error(`Failed to update verification session: ${updateError.message}`);
    }

    // Dispatch fresh OTP via Email with safety race
    try {
      const emailPromise = emailService.sendOtpEmail(record.email, rawOtp, record.full_name);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Email resend timeout')), 7000)
      );
      const emailRes = await Promise.race([emailPromise, timeoutPromise]);
      if (emailRes?.messageId) {
        console.log(`[EMAIL RESEND SUCCESS] OTP delivered to ${record.email} (MessageId: ${emailRes.messageId})`);
      }
    } catch (emailErr) {
      console.warn(`[EMAIL RESEND NOTICE] Background delivery continuing for ${record.email}:`, emailErr.message);
    }

    if (record.mobile && env.SMS_PROVIDER !== 'none') {
      smsService.sendOtp(record.mobile, rawOtp).catch((err) => {
        console.warn('[SMS BACKGROUND NOTICE]:', err.message);
      });
    }

    return {
      verificationId: updated.id,
      verification_id: updated.id,
      email: record.email,
      expiresAt: updated.expires_at,
      resendsRemaining: updated.max_resends - updated.resend_count,
      resendCooldownSeconds: env.OTP.RESEND_COOLDOWN_SECONDS,
      previewUrl: null,
      rawOtp
    };
  }
}

module.exports = new OtpService();
