const nodemailer = require('nodemailer');
const env = require('../config/env');

/**
 * Email Service for Assignment Hub
 * Handles OTP emails, welcome emails, and password resets
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initPromise = this.initTransporter();
  }

  /**
   * Initialize Nodemailer Transporter
   */
  async initTransporter() {
    if (env.EMAIL.SMTP_USER && env.EMAIL.SMTP_PASS) {
      const cleanPass = env.EMAIL.SMTP_PASS.replace(/\s+/g, '');
      if (env.EMAIL.SMTP_HOST.includes('gmail')) {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          pool: true,
          maxConnections: 3,
          auth: {
            user: env.EMAIL.SMTP_USER,
            pass: cleanPass
          }
        });
      } else {
        this.transporter = nodemailer.createTransport({
          host: env.EMAIL.SMTP_HOST,
          port: env.EMAIL.SMTP_PORT,
          secure: env.EMAIL.SMTP_SECURE,
          pool: true,
          maxConnections: 3,
          auth: {
            user: env.EMAIL.SMTP_USER,
            pass: cleanPass
          }
        });
      }
      console.log(`[EMAIL SERVICE] Connected via Gmail SMTP (${env.EMAIL.SMTP_USER})`);
    } else {
      // Create Ethereal test account or console fallback for zero-config development
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
        console.log('[EMAIL SERVICE] Initialized in Ethereal Test Mode (Web previews available)');
      } catch (err) {
        console.warn('[EMAIL SERVICE] Ethereal fallback failed, will log to console:', err.message);
        this.transporter = null;
      }
    }
  }

  /**
   * Send 6-digit OTP verification code to user's email
   * @param {string} to - Recipient email
   * @param {string} otp - 6-digit OTP code
   * @param {string} [name='Student'] - Recipient name
   */
  async sendOtpEmail(to, otp, name = 'Student') {
    const subject = `${otp} is your Assignment Hub verification code`;
    const cleanTo = (typeof to === 'string' ? to.trim().toLowerCase() : String(to || '')).replace(/[\u200B-\u200D\uFEFF]/g, '').trim();

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #f7f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a;">
  <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e1e4e8; border-radius: 12px; padding: 32px 28px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);">
    <div style="font-size: 20px; font-weight: 700; color: #4f46e5; margin-bottom: 20px;">
      Assignment Hub
    </div>
    <div style="font-size: 15px; color: #374151; line-height: 1.5; margin-bottom: 20px;">
      Hello ${name},
    </div>
    <div style="font-size: 14px; color: #4b5563; line-height: 1.5; margin-bottom: 24px;">
      Use the following verification code to complete your signup:
    </div>
    <div style="background-color: #f3f4f6; border-radius: 8px; padding: 18px; text-align: center; margin-bottom: 24px;">
      <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #1f2937;">${otp}</span>
    </div>
    <div style="font-size: 13px; color: #6b7280; line-height: 1.5; margin-bottom: 24px;">
      This code is valid for ${env.OTP.EXPIRY_MINUTES} minutes. If you did not request this, please ignore this email.
    </div>
    <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; font-size: 12px; color: #9ca3af;">
      Assignment Hub Student Portal
    </div>
  </div>
</body>
</html>`;

    console.log('\n================== [EMAIL SERVICE] ==================');
    console.log(`To: ${to} (${name})`);
    console.log(`Subject: ${subject}`);
    console.log(`OTP Code: [ ${otp} ]`);
    console.log('=====================================================\n');

    if (!this.transporter && this.initPromise) {
      await this.initPromise;
    }
    if (!this.transporter) {
      await this.initTransporter();
    }

    if (this.transporter) {
      try {
        const fromAddress = env.EMAIL.SMTP_USER
          ? `"Assignment Hub" <${env.EMAIL.SMTP_USER}>`
          : env.EMAIL.FROM;

        const info = await this.transporter.sendMail({
          from: fromAddress,
          replyTo: env.EMAIL.SMTP_USER || fromAddress,
          to: cleanTo,
          subject,
          text: `Your Assignment Hub verification code is: ${otp}. Valid for ${env.OTP.EXPIRY_MINUTES} minutes.`,
          html,
          headers: {
            'X-Entity-Ref-ID': `otp-${cleanTo}-${Date.now()}`
          }
        });

        console.log(`[EMAIL SERVICE SUCCESS] OTP email delivered to ${to}. MessageId: ${info.messageId}`);

        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log(`[EMAIL PREVIEW LINK] Open email in browser: ${previewUrl}`);
        }

        return {
          success: true,
          messageId: info.messageId,
          previewUrl: previewUrl || null
        };
      } catch (err) {
        console.error('[EMAIL ERROR] Failed to send email via transporter:', err.message);
        return {
          success: false,
          error: err.message,
          fallback: true
        };
      }
    }

    return { success: true, messageId: `dev-${Date.now()}` };
  }
}

module.exports = new EmailService();
