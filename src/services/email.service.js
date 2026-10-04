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
    const subject = `Your Assignment Hub Verification Code: ${otp}`;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F3F0FF; margin: 0; padding: 20px; }
    .card { max-width: 520px; margin: 20px auto; background: #ffffff; border-radius: 20px; padding: 36px 30px; box-shadow: 0 10px 30px rgba(108, 99, 255, 0.12); border: 2px solid #EBE6FF; }
    .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
    .brand-icon { width: 38px; height: 38px; background: linear-gradient(135deg, #6C63FF, #8B7CFF); border-radius: 12px; display: inline-block; vertical-align: middle; text-align: center; line-height: 38px; color: #fff; font-size: 20px; font-weight: bold; }
    .brand-title { font-size: 22px; font-weight: 800; color: #25233A; display: inline-block; vertical-align: middle; margin-left: 8px; }
    h2 { color: #25233A; font-size: 20px; margin-top: 0; margin-bottom: 12px; font-weight: 700; }
    p { color: #6E688D; font-size: 15px; line-height: 1.6; margin: 8px 0; }
    .otp-box { background: #FAF8FF; border: 2px dashed #6C63FF; border-radius: 16px; padding: 22px; text-align: center; margin: 28px 0; }
    .otp-code { font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #6C63FF; font-family: monospace; display: block; }
    .otp-caption { font-size: 13px; color: #8A85A5; margin-top: 8px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #F0EDFA; font-size: 12px; color: #9A95B5; }
    .badge { display: inline-block; background: #E8F8F0; color: #2E9B66; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">
      <span class="brand-icon">📚</span>
      <span class="brand-title">Assignment Hub</span>
    </div>
    
    <div><span class="badge">SECURE EMAIL VERIFICATION</span></div>
    
    <h2>Hello, ${name}!</h2>
    <p>Thank you for signing up with Assignment Hub. Please use the 6-digit verification code below to complete your registration:</p>
    
    <div class="otp-box">
      <span class="otp-code">${otp}</span>
      <div class="otp-caption">Valid for <strong>${env.OTP.EXPIRY_MINUTES} minutes</strong>. Please do not share this with anyone.</div>
    </div>
    
    <p>If you did not request this verification, you can safely ignore this email. No changes will be made to your account.</p>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} Assignment Hub. All rights reserved.</p>
      <p>Secure Student Portal Authentication</p>
    </div>
  </div>
</body>
</html>
    `;

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
          to,
          subject,
          text: `Your Assignment Hub verification OTP is ${otp}. Valid for ${env.OTP.EXPIRY_MINUTES} minutes.`,
          html,
          headers: {
            'X-Priority': '1 (Highest)',
            'X-MSMail-Priority': 'High',
            'Importance': 'High'
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
