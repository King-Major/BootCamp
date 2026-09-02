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
      subject: 'Bootcamp Registration Confirmation',
      html: `
        <h2>Registration Confirmed!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering for our bootcamp. Your registration has been confirmed.</p>
        <p><strong>Time:</strong> 3 PM on Friday, 4th September<br>
        <strong>Venue:</strong> ICT Department, Faculty of Engineering.</p>
        <p>Please save the QR code below - you'll need it for check-in:</p>
        <img src="data:image/png;base64,${qrCodeBase64}" alt="Your QR Code" style="max-width: 300px;" />
        <p>Best regards,<br>King's Code Academy Team</p>
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