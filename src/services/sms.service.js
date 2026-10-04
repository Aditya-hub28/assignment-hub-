const env = require('../config/env');

/**
 * SMS Service for OTP dispatching
 * Modular design allowing easy integration of real SMS gateways (Fast2SMS, Twilio, MSG91)
 */
class SmsService {
  /**
   * Send OTP via SMS
   * @param {string} mobile - Recipient mobile number
   * @param {string} otp - 6 digit OTP
   * @returns {Promise<{ success: boolean, messageId?: string }>}
   */
  async sendOtp(mobile, otp) {
    const message = `Your Assignment Hub verification OTP is ${otp}. Valid for ${env.OTP.EXPIRY_MINUTES} minutes. Please do not share it with anyone.`;

    switch (env.SMS_PROVIDER.toLowerCase()) {
      case 'fast2sms':
        return this.sendViaFast2Sms(mobile, otp, message);
      case 'twilio':
        return this.sendViaTwilio(mobile, message);
      case 'console':
      default:
        return this.sendViaConsole(mobile, otp, message);
    }
  }

  /**
   * Development Console Logger
   */
  async sendViaConsole(mobile, otp, message) {
    console.log('\n================== [SMS SERVICE (DEV)] ==================');
    console.log(`To: ${mobile}`);
    console.log(`OTP: [ ${otp} ]`);
    console.log(`Message: ${message}`);
    console.log('=========================================================\n');

    return {
      success: true,
      messageId: `dev-${Date.now()}`
    };
  }

  /**
    * Fast2SMS Integration
   */
  async sendViaFast2Sms(mobile, otp, message) {
    if (!env.FAST2SMS_API_KEY) {
      console.warn('[WARN] FAST2SMS_API_KEY not configured. Falling back to console.');
      return this.sendViaConsole(mobile, otp, message);
    }

    try {
      // Normalize mobile to 10 digits for Indian Fast2SMS
      const cleanNumber = mobile.replace(/\D/g, '').slice(-10);

      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'q',
          message: `Your Assignment Hub verification OTP is ${otp}. Valid for ${env.OTP.EXPIRY_MINUTES} minutes.`,
          numbers: cleanNumber
        }),
        signal: AbortSignal.timeout(3000)
      });

      const data = await response.json();
      if (!data.return) {
        const errorMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || 'Fast2SMS dispatch failed');
        console.warn(`[SMS NOTICE] Fast2SMS: ${errorMsg}`);
        // Fallback print OTP in terminal so local testing is never blocked
        await this.sendViaConsole(mobile, otp, message);
        return { success: false, error: errorMsg, fallback: true };
      }

      console.log(`[SMS SUCCESS] Real SMS dispatched via Fast2SMS to ${cleanNumber}`);
      return { success: true, messageId: data.request_id };
    } catch (err) {
      console.error('[SMS ERROR] Fast2SMS network error:', err.message);
      await this.sendViaConsole(mobile, otp, message);
      return { success: false, error: err.message, fallback: true };
    }
  }

  /**
   * Twilio Integration
   */
  async sendViaTwilio(mobile, message) {
    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
      console.warn('[WARN] Twilio credentials not configured. Falling back to console.');
      return this.sendViaConsole(mobile, '******', message);
    }

    try {
      const auth = Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString('base64');
      const params = new URLSearchParams();
      params.append('To', mobile);
      params.append('From', env.TWILIO_PHONE_NUMBER);
      params.append('Body', message);

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        }
      );

      const data = await response.json();
      if (response.status >= 400) {
        throw new Error(data.message || 'Twilio dispatch failed');
      }

      return { success: true, messageId: data.sid };
    } catch (err) {
      console.error('[SMS ERROR] Twilio failure:', err.message);
      return { success: false, error: err.message };
    }
  }
}

module.exports = new SmsService();
