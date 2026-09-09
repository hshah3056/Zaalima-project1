import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter = null;
let isTestAccount = false;

export const getTransporter = async () => {
  if (transporter) return { transporter, isTestAccount };

  const host = process.env.MAIL_HOST || process.env.SMTP_HOST;
  const port = Number(process.env.MAIL_PORT || process.env.SMTP_PORT) || 465;
  const encryption = (process.env.MAIL_ENCRYPTION || '').toLowerCase();
  const secure = encryption === 'ssl' || port === 465 || process.env.SMTP_SECURE === 'true';

  const user = process.env.MAIL_USERNAME || process.env.SMTP_USER;
  const pass = process.env.MAIL_PASSWORD || process.env.SMTP_PASS;

  if (host && user && pass) {
    // Production SMTP configuration using MAIL_* or SMTP_* settings
    transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: secure, // true for port 465 / SSL, false for port 587 / TLS
      auth: {
        user: user,
        pass: pass,
      },
    });
    isTestAccount = false;
    console.log(`[Email Config] Configured production SMTP transport (${host}:${port}, secure=${secure})`);
  } else {
    // Fall back to Ethereal test account automatically for local testing
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      isTestAccount = true;
      console.log(`[Email Config] MAIL_* credentials missing. Initialized Ethereal Test Account (${testAccount.user})`);
    } catch (err) {
      console.error('[Email Config] Failed to create test email account:', err);
      throw err;
    }
  }

  return { transporter, isTestAccount };
};

export const verifyTransporter = async () => {
  try {
    const { transporter } = await getTransporter();
    await transporter.verify();
    console.log('[Email Config] SMTP Connection Verified Successfully!');
    return true;
  } catch (error) {
    console.error('[Email Config] SMTP Transporter verification failed:', error.message);
    return false;
  }
};
