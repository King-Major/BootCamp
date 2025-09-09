const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide a first name.'],
    trim: true,
  },
  middleName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Please provide a last name.'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address',
    ],
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Please provide date of birth.'],
  },
  course: {
    type: String,
    required: [true, 'Please select a course.'],
    enum: ['Web Development Basics', 
      'BlockChain And Crypto Basics', 
      'Mobile App Development Basics With Glide',
      'Mobile PhotoGraphy Basics',
      'Virtual Assistance Basics',
      'Content Creation Basics'],
  },
  hasLaptop: {
    type: Boolean,
    required: [true, 'Please specify if you have a laptop.'],
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked-in'],
    default: 'confirmed',
  },
  qrCode: {
    type: String, // Will store the QR code data URL
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Registration', registrationSchema);