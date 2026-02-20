const { Resend } = require('resend');

// Lazy-initialize so missing API key doesn't crash the server at startup
let _resend = null;
const getResend = () => {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key || key === 're_your_api_key_here') {
      return null; // Not configured yet
    }
    _resend = new Resend(key);
  }
  return _resend;
};

/**
 * Send OTP email to user via Resend
 * @param {string} toEmail - Recipient email
 * @param {string} otp - 6-digit OTP code
 * @param {string} username - User's name for personalization
 */
const sendOtpEmail = async (toEmail, otp, username = 'User') => {
  const resend = getResend();

  // Fallback: if Resend not configured, just log to console
  if (!resend) {
    console.log(`\n📧 [EMAIL FALLBACK] OTP for ${toEmail}: ${otp}\n   (Configure RESEND_API_KEY in .env to send real emails)\n`);
    return;
  }

  const { error } = await resend.emails.send({
    from: 'SecureChat <onboarding@resend.dev>',
    to: [toEmail],
    subject: 'Your SecureChat Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background-color:#0d1418;font-family:Inter,Arial,sans-serif;">
        <div style="max-width:480px;margin:40px auto;background:#17212b;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.05);">
          <!-- Header -->
          <div style="background:linear-gradient(135deg,#15803d,#16a34a);padding:32px;text-align:center;">
            <div style="width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:14px;margin:0 auto 16px;display:inline-flex;align-items:center;justify-content:center;">
              <span style="font-size:28px;">💬</span>
            </div>
            <h1 style="color:#fff;margin:8px 0 0;font-size:24px;font-weight:700;">SecureChat</h1>
            <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">End-to-end encrypted messaging</p>
          </div>
          
          <!-- Body -->
          <div style="padding:32px;">
            <p style="color:#e2e8f0;font-size:16px;margin:0 0 8px;">Hi <strong>${username}</strong>,</p>
            <p style="color:#94a3b8;font-size:14px;margin:0 0 28px;line-height:1.6;">
              Your verification code for SecureChat is:
            </p>
            
            <!-- OTP Box -->
            <div style="background:#0d1418;border:2px solid #16a34a;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
              <div style="letter-spacing:12px;font-size:36px;font-weight:800;color:#22c55e;font-family:monospace;">
                ${otp}
              </div>
            </div>
            
            <p style="color:#94a3b8;font-size:13px;margin:0 0 8px;">⏱️ This code expires in <strong style="color:#e2e8f0;">5 minutes</strong>.</p>
            <p style="color:#94a3b8;font-size:13px;margin:0;">🔒 If you didn't request this, please ignore this email.</p>
          </div>
          
          <!-- Footer -->
          <div style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
            <p style="color:#475569;font-size:12px;margin:0;">SecureChat · End-to-end encrypted</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  console.log(`📧 OTP email sent to ${toEmail}`);
};

module.exports = { sendOtpEmail };
