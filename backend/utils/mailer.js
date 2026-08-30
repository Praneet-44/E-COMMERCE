const nodemailer = require('nodemailer');

// Get transporter dynamically at send-time to avoid environment loading sequence issues
const getTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
};

/**
 * Send OTP verification email
 * @param {string} to - Recipient email
 * @param {string} otp - Generated OTP
 * @param {string} type - 'registration' or 'login'
 */
const sendOTPMail = async (to, otp, type = 'registration') => {
  const subject = type === 'registration' 
    ? 'FashionHub - Verify Your Account Registration' 
    : 'FashionHub - Account Security Verification Code';

  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 4px; background-color: #ffffff;">
      <div style="text-align: center; border-bottom: 1px solid #f0f0f0; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="color: #1a1a1a; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 2px;">FASHIONHUB</h1>
      </div>
      <div style="color: #333333; line-height: 1.6; font-size: 15px;">
        <p>Hello,</p>
        <p>To complete your ${type === 'registration' ? 'registration' : 'login'} process, please use the following 6-digit verification code:</p>
        <div style="text-align: center; margin: 30px 0; background-color: #f9f9f9; padding: 15px; border-radius: 4px; border: 1px dashed #cccccc;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #111111;">${otp}</span>
        </div>
        <p style="font-size: 13px; color: #666666;">This code is valid for 5 minutes. If you did not request this verification, please ignore this email.</p>
      </div>
      <div style="border-top: 1px solid #f0f0f0; margin-top: 30px; padding-top: 20px; text-align: center; color: #999999; font-size: 11px;">
        <p>&copy; ${new Date().getFullYear()} FashionHub. All rights reserved.</p>
      </div>
    </div>
  `;

  const transporter = getTransporter();

  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"FashionHub" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html: htmlContent,
      });
      console.log(`[MAIL] Successfully sent ${type} OTP to ${to}`);
      return true;
    } catch (error) {
      console.error('[MAIL] Failed to send email via SMTP:', error);
      // Let it fall back to console print
    }
  }

  // Fallback / Log to console if transporter is not set or failed
  console.log(`\n==============================================`);
  console.log(`[AUTH] Fallback/Dev OTP for: ${to}`);
  console.log(`[AUTH] Verification OTP: ${otp}`);
  console.log(`[AUTH] Reason: SMTP not configured or failed to send.`);
  console.log(`==============================================\n`);
  return false;
};

module.exports = {
  sendOTPMail
};
