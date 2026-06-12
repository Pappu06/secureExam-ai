const nodemailer = require("nodemailer");


// ── Nodemailer Transporter (Gmail App Password) ──────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// Verify transporter connection on startup
transporter.verify()
  .then(() => console.log("Email service ready"))
  .catch((err) => console.error("Email service error:", err.message));


/**
 * Send OTP email with a premium HTML template.
 * @param {string} to — recipient email address
 * @param {string} otp — plaintext 6-digit OTP
 */
const sendOtpEmail = async (to, otp) => {

  const mailOptions = {
    from: `"SecureExam AI" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your SecureExam AI Verification Code",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" style="max-width: 480px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; border: 1px solid #334155; overflow: hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 32px 32px 0; text-align: center;">
                    <div style="display: inline-block; padding: 10px 20px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 12px; margin-bottom: 24px;">
                      <span style="color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: 1px;">SecureExam AI</span>
                    </div>
                  </td>
                </tr>

                <!-- Title -->
                <tr>
                  <td style="padding: 8px 32px 0; text-align: center;">
                    <h1 style="color: #f1f5f9; font-size: 22px; font-weight: 600; margin: 0;">Verification Code</h1>
                    <p style="color: #94a3b8; font-size: 14px; margin: 8px 0 0; line-height: 1.5;">
                      Enter the following code to verify your identity
                    </p>
                  </td>
                </tr>

                <!-- OTP Code -->
                <tr>
                  <td style="padding: 28px 32px; text-align: center;">
                    <div style="background-color: #1e293b; border: 2px dashed #6366f1; border-radius: 12px; padding: 20px; display: inline-block;">
                      <span style="font-size: 36px; font-weight: 700; letter-spacing: 10px; color: #818cf8; font-family: 'Courier New', monospace;">
                        ${otp}
                      </span>
                    </div>
                  </td>
                </tr>

                <!-- Warning -->
                <tr>
                  <td style="padding: 0 32px 24px; text-align: center;">
                    <p style="color: #f59e0b; font-size: 12px; margin: 0; font-weight: 500;">
                      This code expires in 5 minutes. Do not share it with anyone.
                    </p>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding: 0 32px;">
                    <hr style="border: none; border-top: 1px solid #334155; margin: 0;" />
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 32px 28px; text-align: center;">
                    <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 1.6;">
                      If you did not request this code, please ignore this email.
                      <br />
                      SecureExam AI - Secure Online Examination Platform
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};


module.exports = { sendOtpEmail };
