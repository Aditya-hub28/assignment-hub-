const path = require('path');
const dotenv = require('dotenv');

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  API_PREFIX: process.env.API_PREFIX || '/api/v1',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // Default College
  DEFAULT_COLLEGE_ID: process.env.DEFAULT_COLLEGE_ID || '00000000-0000-0000-0000-000000000001',

  // OTP Configuration
  OTP: {
    EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 5,
    MAX_ATTEMPTS: parseInt(process.env.OTP_MAX_ATTEMPTS, 10) || 5,
    LOCKOUT_MINUTES: parseInt(process.env.OTP_LOCKOUT_MINUTES, 10) || 5,
    RESEND_COOLDOWN_SECONDS: parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS, 10) || 60,
    MAX_RESENDS: parseInt(process.env.OTP_MAX_RESENDS, 10) || 3
  },

  // SMS Configuration
  SMS_PROVIDER: process.env.SMS_PROVIDER || 'console',
  FAST2SMS_API_KEY: process.env.FAST2SMS_API_KEY || '',
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '',

  // Email Configuration
  EMAIL: {
    PROVIDER: process.env.EMAIL_PROVIDER || 'smtp',
    SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
    SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 465,
    SMTP_SECURE: process.env.SMTP_SECURE !== 'false',
    SMTP_USER: (process.env.SMTP_USER && !process.env.SMTP_USER.includes('adityacareer12') && !process.env.SMTP_USER.includes('freefiregamepro32'))
      ? process.env.SMTP_USER
      : (process.env.GMAIL_USER && !process.env.GMAIL_USER.includes('adityacareer12') && !process.env.GMAIL_USER.includes('freefiregamepro32'))
        ? process.env.GMAIL_USER
        : 'instag102938@gmail.com',
    SMTP_PASS: (process.env.SMTP_PASS && !process.env.SMTP_PASS.includes('xexw') && !process.env.SMTP_PASS.includes('qbvc') && process.env.SMTP_PASS.replace(/\s+/g, '').length === 16)
      ? process.env.SMTP_PASS
      : (process.env.GMAIL_APP_PASSWORD && !process.env.GMAIL_APP_PASSWORD.includes('xexw') && !process.env.GMAIL_APP_PASSWORD.includes('qbvc') && process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, '').length === 16)
        ? process.env.GMAIL_APP_PASSWORD
        : 'bgcywxnpgygigixl',
    FROM: process.env.EMAIL_FROM || '"Assignment Hub" <instag102938@gmail.com>'
  }
};

module.exports = env;
