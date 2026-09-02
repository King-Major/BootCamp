// services/emailService.js

const { Resend } = require('resend');

const resendApiKey = process.env.RESEND_API_KEY;
const senderEmail = process.env.EMAIL_FROM;

// Initialize Resend with API key
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// The function now accepts a buffer (qrCodeBuffer) and sends via Resend
const sendConfirmationEmail = async (email, name, qrCodeBuffer) => {
  try {
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is missing. Add the key to the backend environment before sending emails.');
    }

    if (!senderEmail) {
      throw new Error('EMAIL_FROM is missing. Set it to a verified Resend sender domain like noreply@yourdomain.com.');
    }

    if (senderEmail.includes('@gmail.com') || senderEmail.includes('@yahoo.com') || senderEmail.includes('@hotmail.com')) {
      throw new Error('EMAIL_FROM must use a verified Resend domain, not a personal Gmail/Outlook/Yahoo address.');
    }

    const qrCodeBase64 = qrCodeBuffer.toString('base64');

    const response = await resend.emails.send({
      from: senderEmail,
      to: email,
      subject: 'Your Bootcamp Seat Is Confirmed',
      html: `
        <div style="margin:0;padding:0;background:#060512;font-family:Arial,Helvetica,sans-serif;color:#f5ecff;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#060512; margin:0; padding:0;">
            <tr>
              <td align="center" style="padding:32px 16px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:640px;background:linear-gradient(180deg,#110d22 0%,#090612 100%);border:1px solid rgba(192,138,69,0.5);border-radius:18px;overflow:hidden;box-shadow:0 18px 60px rgba(139,92,246,0.16);">
                  <tr>
                    <td style="padding:22px 28px 16px; background:linear-gradient(90deg, rgba(139,92,246,0.16), rgba(192,138,69,0.08)); border-bottom:1px solid rgba(255,255,255,0.08);">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td align="left" valign="middle">
                            <div style="display:inline-block; padding:10px 12px; border-radius:10px; background:rgba(139,92,246,0.18); border:1px solid rgba(192,138,69,0.35); color:#f4d7a1; font-size:11px; letter-spacing:2px; font-weight:bold; text-transform:uppercase;">
                              King's Code Academy
                            </div>
                          </td>
                          <td align="right" valign="middle" style="font-size:12px; color:#bca9d7; letter-spacing:1.2px; text-transform:uppercase;">
                            Registration Confirmed
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:30px 28px 18px;">
                      <div style="font-size:11px; color:#c08a45; letter-spacing:3px; text-transform:uppercase; font-weight:bold; margin-bottom:14px;">
                        Waypoint 06 • Reserve a seat
                      </div>

                      <div style="font-family:Georgia,serif; font-size:38px; line-height:1.1; color:#f1e7ff; font-weight:700; margin:0 0 18px; letter-spacing:-1px;">
                        Welcome aboard, ${name}.
                      </div>

                      <p style="margin:0 0 20px; font-size:15px; line-height:1.7; color:#d7cee9;">
                        Your seat has been secured for the bootcamp and your payment has been verified.
                        Please keep this email handy for check-in on the day of the program.
                      </p>

                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 22px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:12px;">
                        <tr>
                          <td style="padding:16px 18px; border-bottom:1px solid rgba(255,255,255,0.08);">
                            <div style="font-size:10px; color:#7a6c9c; letter-spacing:2px; text-transform:uppercase; margin-bottom:6px;">Student</div>
                            <div style="font-size:22px; color:#f5ecff; font-weight:600;">${name}</div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:16px 18px; border-bottom:1px solid rgba(255,255,255,0.08);">
                            <div style="font-size:10px; color:#7a6c9c; letter-spacing:2px; text-transform:uppercase; margin-bottom:6px;">Route</div>
                            <div style="font-size:18px; color:#f5ecff; font-weight:600;">${email}</div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:16px 18px;">
                            <div style="font-size:10px; color:#7a6c9c; letter-spacing:2px; text-transform:uppercase; margin-bottom:6px;">Session Details</div>
                            <div style="font-size:17px; color:#f5ecff; font-weight:600; line-height:1.7;">
                              <span style="color:#c08a45;">Time:</span> 3:00 PM on Friday, 4th September<br>
                              <span style="color:#c08a45;">Venue:</span> ICT Department, Faculty of Engineering
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 28px 28px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td valign="top" align="center" style="padding:18px 0 10px;">
                            <div style="display:inline-block; padding:18px 18px 12px; background:#0c0d17; border:1px solid rgba(139,92,246,0.35); border-radius:18px; box-shadow:0 0 28px rgba(139,92,246,0.12);">
                              <div style="font-size:10px; color:#9f8bbd; letter-spacing:2px; text-transform:uppercase; text-align:center; margin-bottom:10px;">Check-in QR</div>
                              <img src="data:image/png;base64,${qrCodeBase64}" alt="Your QR Code" style="display:block; width:180px; height:180px; border-radius:12px; background:#ffffff;" />
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-top:12px;">
                            <div style="font-size:12px; color:#b6a8cf; line-height:1.7;">
                              Please save this QR code. You will need it at check-in.
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 28px 30px;">
                      <div style="border-top:1px solid rgba(255,255,255,0.08); padding-top:18px; text-align:center; color:#b7a9cf; font-size:13px; line-height:1.7;">
                        Best regards,<br>
                        <strong style="color:#f3dcac;">King's Code Academy Team</strong>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      `,
    });

    if (response?.error) {
      throw new Error(`Resend error: ${response.error.message}. Ensure EMAIL_FROM is verified in your Resend dashboard.`);
    }

    return response;
  } catch (error) {
    console.error('Error sending email via Resend:', error.message || error);
    throw error;
  }
};

module.exports = { sendConfirmationEmail };