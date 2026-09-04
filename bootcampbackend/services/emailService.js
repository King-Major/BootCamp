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

    const qrCodeAttachment = {
      filename: 'checkin-qr.png',
      content: qrCodeBuffer.toString('base64'),
      contentType: 'image/png',
    };

    const response = await resend.emails.send({
      from: senderEmail,
      to: email,
      subject: 'Your Bootcamp Seat Is Confirmed',
      html: `
        <div style="margin:0;padding:0;background:#060512;font-family:Arial,Helvetica,sans-serif;color:#f5ecff;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#060512; margin:0; padding:0;">
            <tr>
              <td align="center" style="padding:32px 16px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;background:linear-gradient(180deg,#110d22 0%,#090612 100%);border:1px solid #8B5CF6;border-radius:18px;overflow:hidden;">
                  <tr>
                    <td style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.08);background:rgba(139,92,246,0.12);">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="left" style="font-size:12px;letter-spacing:2px;color:#F4D7A1;text-transform:uppercase;font-weight:bold;">King's Code Academy</td>
                          <td align="right" style="font-size:10px;letter-spacing:2px;color:#BCA9D7;text-transform:uppercase;">Confirmed</td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:28px 24px 8px;">
                      <div style="font-size:11px;color:#C08A45;letter-spacing:2px;text-transform:uppercase;font-weight:bold;">Waypoint 06 • Reserve a seat</div>
                      <div style="font-size:34px;line-height:1.15;color:#F5ECFF;font-weight:bold;margin-top:12px;">Welcome aboard, ${name}</div>
                      <p style="margin:18px 0 0;font-size:15px;line-height:1.7;color:#D7CEE9;">Your payment has been verified and your seat is secured for the bootcamp. Please keep this email and your QR code for check-in.</p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:18px 24px 0;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);border-radius:12px;">
                        <tr>
                          <td style="padding:16px 18px;border-bottom:1px solid rgba(255,255,255,0.08);">
                            <div style="font-size:10px;color:#7A6C9C;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">Student</div>
                            <div style="font-size:20px;color:#F5ECFF;font-weight:bold;">${name}</div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:16px 18px;border-bottom:1px solid rgba(255,255,255,0.08);">
                            <div style="font-size:10px;color:#7A6C9C;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">Email</div>
                            <div style="font-size:16px;color:#F5ECFF;">${email}</div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:16px 18px;">
                            <div style="font-size:10px;color:#7A6C9C;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">Session Details</div>
                            <div style="font-size:16px;color:#F5ECFF;line-height:1.7;">
                              <span style="color:#C08A45;">Time:</span> 3:00 PM on Friday, 11th September<br>
                              <span style="color:#C08A45;">Venue:</span> ICT Department, Faculty of Engineering
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style="padding:28px 24px 12px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background:#0D0B1B;border:1px solid #8B5CF6;border-radius:16px;">
                        <tr>
                          <td style="padding:18px 18px 12px;text-align:center;">
                            <div style="font-size:10px;color:#B6A8CF;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">Check-in QR</div>
                            <img src="cid:checkin-qr" alt="Your QR Code" width="180" height="180" style="display:block;border-radius:12px;background:#ffffff;" />
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style="padding:0 24px 24px; font-size:12px; line-height:1.7; color:#B6A8CF;">
                      Please save this QR code. You will need it at check-in.
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:0 24px 28px;text-align:center;color:#B7A9CF;font-size:13px;line-height:1.7;">
                      Best regards,<br>
                      <strong style="color:#F3DCAC;">King's Code Academy Team</strong>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      `,
      attachments: [qrCodeAttachment],
      headers: {
        'X-Entity-Ref-ID': `bootcamp-${Date.now()}`,
      },
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