// services/emailService.js

const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- START OF CHANGES ---

// The function now accepts a buffer (qrCodeBuffer) instead of a string
const sendConfirmationEmail = async (email, name, qrCodeBuffer) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Bootcamp Registration Confirmation',
    // 1. Update the image source to use a Content-ID (cid)
    html: `
      <h2>Registration Confirmed!</h2>
      <p>Hi ${name},</p>
      <p>Thank you for registering for our bootcamp. Your registration has been confirmed.</p>
      <p>Please save the QR code below - you'll need it for check-in:</p>
      <img src="cid:qrcode" alt="Your QR Code" />
      <p>Best regards,<br>Bootcamp Team</p>
    `,
    // 2. Add an attachments array with the QR code buffer
    attachments: [
      {
        filename: 'qrcode.png',
        content: qrCodeBuffer,
        cid: 'qrcode' // This CID must match the one in the img src
      }
    ]
  };
  // --- END OF CHANGES ---

  return await transporter.sendMail(mailOptions);
};

module.exports = { sendConfirmationEmail };