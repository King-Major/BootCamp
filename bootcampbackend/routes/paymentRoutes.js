const express = require('express');
const QRCode = require('qrcode');
const Registration = require('../models/Registration');
const { sendConfirmationEmail } = require('../services/emailService');

const router = express.Router();

const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const PAYSTACK_AMOUNT_KOBO = Number(process.env.PAYSTACK_AMOUNT_KOBO) || 100000; // ₦1,000
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_CALLBACK_URL = process.env.PAYSTACK_CALLBACK_URL;

const AVAILABLE_COURSES = [
  'Web Development Basics',
  'Blockchain & Crypto Basics',
  'Mobile App Development',
  'Mobile Photography Basics',
  'Virtual Assistance Basics',
  'Content Creation Basics',
];

const parseBoolean = (value) => {
  return value === true || value === 'true' || value === '1' || value === 1;
};

const getFullName = ({ firstName, middleName, lastName }) => {
  return [firstName, middleName, lastName].filter(Boolean).join(' ').trim();
};

const paystackFetch = async (path, options = {}) => {
  if (!PAYSTACK_SECRET_KEY) {
    const err = new Error('Paystack secret key is not configured.');
    err.status = 500;
    throw err;
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const body = await response.json();
  if (!response.ok || body.status === false) {
    const err = new Error(body.message || `Paystack request failed with status ${response.status}`);
    err.details = body;
    err.status = response.status;
    throw err;
  }

  return body;
};

const validateRegistrationPayload = ({ firstName, lastName, email, dateOfBirth, course, hasLaptop }) => {
  const errors = [];

  if (!firstName || typeof firstName !== 'string') {
    errors.push('firstName is required');
  }

  if (!lastName || typeof lastName !== 'string') {
    errors.push('lastName is required');
  }

  if (!email || typeof email !== 'string') {
    errors.push('email is required');
  }

  if (!dateOfBirth || typeof dateOfBirth !== 'string') {
    errors.push('dateOfBirth is required');
  }

  if (!course || typeof course !== 'string' || !AVAILABLE_COURSES.includes(course)) {
    errors.push('course is required and must be a valid option');
  }

  if (hasLaptop === undefined || hasLaptop === null) {
    errors.push('hasLaptop is required');
  }

  return errors;
};

router.post('/initialize', async (req, res) => {
  const { firstName, middleName, lastName, email, dateOfBirth, course, hasLaptop } = req.body;
  const validationErrors = validateRegistrationPayload(req.body);
  if (validationErrors.length) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validationErrors,
    });
  }

  try {
    const metadata = {
      firstName,
      middleName: middleName || '',
      lastName,
      email,
      dateOfBirth,
      course,
      hasLaptop: parseBoolean(hasLaptop),
    };

    const payload = {
      email,
      amount: PAYSTACK_AMOUNT_KOBO,
      metadata,
    };

    if (PAYSTACK_CALLBACK_URL) {
      payload.callback_url = PAYSTACK_CALLBACK_URL;
    }

    const paystackResponse = await paystackFetch('/transaction/initialize', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!PAYSTACK_PUBLIC_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Paystack public key is not configured on the server.',
      });
    }

    return res.status(200).json({
      success: true,
      reference: paystackResponse.data.reference,
      publicKey: PAYSTACK_PUBLIC_KEY,
      amount: PAYSTACK_AMOUNT_KOBO,
    });
  } catch (error) {
    console.error('Paystack initialize error:', error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Unable to initialize payment',
      details: error.details || undefined,
    });
  }
});

router.post('/verify', async (req, res) => {
  const { reference } = req.body;
  if (!reference || typeof reference !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'reference is required',
    });
  }

  try {
    const paystackResponse = await paystackFetch(`/transaction/verify/${encodeURIComponent(reference)}`);
    const transaction = paystackResponse.data;

    if (transaction.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: 'Payment has not completed successfully.',
        status: transaction.status,
      });
    }

    if (transaction.amount !== PAYSTACK_AMOUNT_KOBO) {
      return res.status(400).json({
        success: false,
        message: `Payment amount mismatch. Expected ${PAYSTACK_AMOUNT_KOBO} kobo.`,
      });
    }

    const metadata = transaction.metadata || {};
    const regValidationErrors = validateRegistrationPayload(metadata);
    if (regValidationErrors.length) {
      return res.status(400).json({
        success: false,
        message: 'Paystack metadata is missing required registration information.',
        errors: regValidationErrors,
      });
    }

    const email = metadata.email;
    const existingRegistration = await Registration.findOne({
      $or: [{ email }, { paymentReference: reference }],
    });

    if (existingRegistration) {
      return res.status(200).json({
        success: true,
        verified: true,
        message: 'Registration has already been confirmed for this payment or email.',
        registrationId: existingRegistration._id,
      });
    }

    // Parse dateOfBirth safely - handle both "YYYY-MM-DD" and "YYYY-MM-DDTHH:mm:ss.sssZ" formats
    let parsedDateOfBirth;
    try {
      // If the date string includes time, use it as-is; otherwise assume UTC to avoid timezone issues
      const dateStr = metadata.dateOfBirth;
      if (dateStr.includes('T')) {
        parsedDateOfBirth = new Date(dateStr);
      } else {
        // For "YYYY-MM-DD" format, parse as UTC to avoid timezone shifts
        parsedDateOfBirth = new Date(dateStr + 'T00:00:00Z');
      }
      
      if (isNaN(parsedDateOfBirth.getTime())) {
        throw new Error('Invalid date value');
      }
    } catch (dateError) {
      console.error('Date parsing error:', metadata.dateOfBirth, dateError);
      return res.status(400).json({
        success: false,
        message: 'Invalid date of birth format. Please use YYYY-MM-DD format.',
      });
    }

    // Parse paidAt safely - handle missing or invalid timestamps from Paystack
    let paidAtDate = new Date();
    if (transaction.paid_at && typeof transaction.paid_at === 'number') {
      const paidAtFromPaystack = new Date(transaction.paid_at * 1000);
      if (!isNaN(paidAtFromPaystack.getTime())) {
        paidAtDate = paidAtFromPaystack;
      }
    }

    const registration = new Registration({
      firstName: metadata.firstName,
      middleName: metadata.middleName,
      lastName: metadata.lastName,
      email,
      dateOfBirth: parsedDateOfBirth,
      course: metadata.course,
      hasLaptop: parseBoolean(metadata.hasLaptop),
      paymentReference: reference,
      amountPaid: transaction.amount,
      paidAt: paidAtDate,
    });

    const savedRegistration = await registration.save();
    const fullName = getFullName(savedRegistration);

    const qrData = `Registration ID: ${savedRegistration._id}\nName: ${fullName}\nCourse: ${savedRegistration.course}`;
    const qrCodeBuffer = await QRCode.toBuffer(qrData, {
      errorCorrectionLevel: 'M',
      type: 'png',
      quality: 0.92,
      margin: 2,
      width: 256,
    });

    savedRegistration.qrCode = `data:image/png;base64,${qrCodeBuffer.toString('base64')}`;
    await savedRegistration.save();

    // Send email asynchronously (fire-and-forget) to avoid blocking the response
    sendConfirmationEmail(savedRegistration.email, fullName, qrCodeBuffer)
      .catch(emailError => console.error('Confirmation email error:', emailError));

    return res.status(201).json({
      success: true,
      verified: true,
      registrationId: savedRegistration._id,
      email: savedRegistration.email,
      course: savedRegistration.course,
    });
  } catch (error) {
    console.error('Paystack verify error:', error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Unable to verify payment',
      details: error.details || undefined,
    });
  }
});

module.exports = router;
