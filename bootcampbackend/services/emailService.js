// services/emailService.js

const { Resend } = require('resend');

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// The function now accepts a buffer (qrCodeBuffer) and sends via Resend
const sendConfirmationEmail = async (email, name, qrCodeBuffer) => {
  try {
    const qrCodeBase64 = qrCodeBuffer.toString('base64');
    
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
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

    if (response.error) {
      throw new Error(`Resend error: ${response.error.message}`);
    }

    return response;
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    throw error;
  }
};

module.exports = { sendConfirmationEmail };