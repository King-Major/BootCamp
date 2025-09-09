// routes/registration.js

const express = require('express');
const QRCode = require('qrcode');
const Registration = require('../models/Registration');
const { sendConfirmationEmail } = require('../services/emailService');

const router = express.Router();

router.post('/', async (req, res) => {
  const { firstName, middleName, lastName, email, dateOfBirth, course, hasLaptop } = req.body;

  // Validation
  if (!firstName || !lastName || !email || !dateOfBirth || !course || hasLaptop === null) {
    return res.status(400).json({ 
      success: false, 
      message: 'All required fields must be provided.' 
    });
  }

  try {
    // Check if email already exists
    let existingRegistration = await Registration.findOne({ email });
    if (existingRegistration) {
      return res.status(400).json({ 
        success: false, 
        message: 'This email is already registered.' 
      });
    }

    // Create new registration
    const newRegistration = new Registration({
      firstName,
      middleName,
      lastName,
      email,
      dateOfBirth,
      course,
      hasLaptop,
    });

    // Save to database first to get the _id
    const savedRegistration = await newRegistration.save();

    // --- START OF CHANGES ---

    // 1. Construct full name
    const fullName = `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim();

    // 2. Generate QR code data string with ID, name, and course
    const qrData = `Registration ID: ${savedRegistration._id}\nName: ${fullName}\nCourse: ${savedRegistration.course}`;

    // 3. Generate the QR code as a Buffer
    const qrCodeBuffer = await QRCode.toBuffer(qrData);

    // 4. Convert buffer to Data URL (optional for storage)
    const qrCodeDataURL = `data:image/png;base64,${qrCodeBuffer.toString('base64')}`;

    // 5. Save QR code image to DB
    savedRegistration.qrCode = qrCodeDataURL;
    await savedRegistration.save();

    // 6. Send confirmation email with QR code
    await sendConfirmationEmail(email, fullName, qrCodeBuffer);

    // --- END OF CHANGES ---

    res.status(201).json({
      success: true,
      message: 'Registration successful! Confirmation email sent.',
      data: {
        id: savedRegistration._id,
        name: fullName,
        email: savedRegistration.email,
        course: savedRegistration.course,
      },
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again later.' 
    });
  }
});

module.exports = router;
