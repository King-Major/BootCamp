const express = require('express');
const crypto = require('crypto');
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
  'Cyber Security Basics',
  'Mobile App Development',
  'Mobile Photography Basics',
  'Virtual Assistance Basics',
  'Content Creation Basics',
];

const parseBoolean = (value) => {
  return value === true || value === 'true' || value === '1' || value === 1;
};

const validateRegistrationPayload = ({ firstName, lastName, email, dateOfBirth, course, hasLaptop }) => {
  const errors = [];

  if (!firstName || typeof firstName !== 'string') errors.push('firstName is required');
  if (!lastName || typeof lastName !== 'string') errors.push('lastName is required');
  if (!email || typeof email !== 'string') errors.push('email is required');
  if (!dateOfBirth || typeof dateOfBirth !== 'string') errors.push('dateOfBirth is required');
  if (!course || typeof course !== 'string' || !AVAILABLE_COURSES.includes(course)) {
    errors.push('course is required and must be a valid option');
  }
  if (hasLaptop === undefined || hasLaptop === null) errors.push('hasLaptop is required');

  return errors;
};

const getFullName = ({ firstName, middleName, lastName }) => {
  return [firstName, middleName, lastName].filter(Boolean).join(' ').trim();
};

const createRegistrationFromTransaction = async (transaction, reference) => {
  const metadata = transaction.metadata || {};
  const email = metadata.email;
  const existingRegistration = await Registration.findOne({
    $or: [{ email }, { paymentReference: reference }],
  });

  if (existingRegistration) {
    return { registration: existingRegistration, emailSent: false, alreadyExists: true };
  }

  const dateValue = metadata.dateOfBirth;
  const parsedDateOfBirth = new Date(dateValue.includes('T') ? dateValue : `${dateValue}T00:00:00Z`);
  if (isNaN(parsedDateOfBirth.getTime())) {
    throw new Error('Invalid date of birth format. Please use YYYY-MM-DD format.');
  }

  const paidAtDate = transaction.paid_at ? new Date(transaction.paid_at * 1000) : new Date();
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
    paidAt: isNaN(paidAtDate.getTime()) ? new Date() : paidAtDate,
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

  let emailSent = false;
  try {
    await sendConfirmationEmail(savedRegistration.email, fullName, qrCodeBuffer);
    emailSent = true;
  } catch (emailError) {
    console.error('Confirmation email error:', emailError);
  }

  return { registration: savedRegistration, emailSent, alreadyExists: false };
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

    const result = await createRegistrationFromTransaction(transaction, reference);
    const savedRegistration = result.registration;
    return res.status(result.alreadyExists ? 200 : 201).json({
      success: true,
      verified: true,
      registrationId: savedRegistration._id,
      email: savedRegistration.email,
      course: savedRegistration.course,
      emailSent: result.emailSent,
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

router.post('/webhook', async (req, res) => {
  const signature = req.headers['x-paystack-signature'];
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body || {}));
  const expectedSignature = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(rawBody).digest('hex');

  const signatureBuffer = signature ? Buffer.from(signature) : null;
  const expectedSignatureBuffer = Buffer.from(expectedSignature);
  if (!signatureBuffer || signatureBuffer.length !== expectedSignatureBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)) {
    return res.status(401).json({ success: false, message: 'Invalid webhook signature.' });
  }

  try {
    const event = JSON.parse(rawBody.toString('utf8'));
    if (event.event !== 'charge.success' || event.data?.status !== 'success') {
      return res.status(200).json({ success: true, ignored: true });
    }

    const reference = event.data.reference;
    const transactionResponse = await paystackFetch(`/transaction/verify/${encodeURIComponent(reference)}`);
    const transaction = transactionResponse.data;
    if (transaction.status !== 'success' || transaction.amount !== PAYSTACK_AMOUNT_KOBO) {
      return res.status(400).json({ success: false, message: 'Webhook payment could not be verified.' });
    }

    const metadataErrors = validateRegistrationPayload(transaction.metadata || {});
    if (metadataErrors.length) {
      return res.status(400).json({ success: false, message: 'Webhook metadata is incomplete.', errors: metadataErrors });
    }

    const result = await createRegistrationFromTransaction(transaction, reference);
    return res.status(200).json({ success: true, registrationId: result.registration._id, emailSent: result.emailSent });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    return res.status(500).json({ success: false, message: 'Webhook processing failed.' });
  }
});

module.exports = router;
