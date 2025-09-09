import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown, X, User, Mail, Calendar, Laptop, BookOpen } from 'lucide-react';
import axios from 'axios'; // This is unused in the provided code, but can be added back for API calls
import SkillsShowcase from './folders/Skills';

const KingsCodeHero = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showRegistration, setShowRegistration] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', middleName: '', lastName: '', email: '', 
    dateOfBirth: '', course: '', hasLaptop: null
  });

  const [formErrors, setFormErrors] = useState({});
  
  useEffect(() => {
    const handleScroll = () => setScrollPosition(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- START: ADDED FUNCTIONS ---

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    // Clear errors for the field being edited
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Handle radio button boolean conversion
    if (name === 'hasLaptop') {
      setFormData(prev => ({
        ...prev,
        hasLaptop: value === 'true',
        course: '' // Reset course selection when laptop availability changes
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const getAvailableCourses = () => {
    const coursesWithLaptop = [
      'Web Development Basics', 
      'BlockChain And Crypto Basics', 
      'Mobile App Development Basics With Glide',
      'Mobile PhotoGraphy Basics',
      'Virtual Assistance Basics',
      'Content Creation Basics'
    ];
    const coursesWithoutLaptop = [
      'BlockChain And Crypto Basics', 
      'Mobile PhotoGraphy Basics',
      'Content Creation Basics'
    ];

    if (formData.hasLaptop === true) {
      return coursesWithLaptop;
    }
    if (formData.hasLaptop === false) {
      return coursesWithoutLaptop;
    }
    return []; // Return empty if hasLaptop is not selected
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required.';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required.';
    if (!formData.email) {
      errors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email address is invalid.';
    }
    if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required.';
    if (formData.hasLaptop === null) errors.hasLaptop = 'Please select an option.';
    if (!formData.course) errors.course = 'Please select a course.';
    
    return errors;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const errors = validateForm();
  setFormErrors(errors);

  if (Object.keys(errors).length === 0) {
    try {
      // Show loading state
      // setIsLoading(true);

      // Send data to backend
      const response = await axios.post('https://bootcamp-yq8i.onrender.com/api/register', formData);

      if (response.data.success) {
        alert('Registration successful! Check your email for confirmation.');
        console.log('Registration Response:', response.data);
        
        // Close modal and reset form
        setShowRegistration(false);
        setFormData({
          firstName: '', middleName: '', lastName: '', email: '', 
          dateOfBirth: '', course: '', hasLaptop: null
        });
      }
    } catch (error) {
      console.error('Registration Error:', error);
      
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('Registration failed. Please try again.');
      }
    } finally {
      // setIsLoading(false);
    }
  } else {
    console.log('Form has errors:', errors);
  }
};

  // --- END: ADDED FUNCTIONS ---

  // Minimal geometric pattern
  const GeometricPattern = () => (
    <div className="absolute inset-0 overflow-hidden opacity-5">
      <div className="absolute w-full h-full" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='%236b21a8' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px'
        }}
      />
    </div>
  );

  // Subtle gradient overlay
  const GradientOverlay = () => (
    <div 
      className="absolute inset-0 bg-gradient-to-b from-purple-950/30 via-black/50 to-black"
      style={{ transform: `translateY(${scrollPosition * 0.2}px)` }}
    />
  );

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Background Elements */}
      <GeometricPattern />
      <GradientOverlay />
      
      {/* Subtle accent light */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl" />
      
      {/* Main Content */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="container mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-5xl mx-auto text-center"
          >
            {/* Minimal crown indicator */}
            <motion.div
              className="mb-12 inline-block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent mb-2" />
              <div className="w-6 h-6 border border-purple-500/50 rotate-45 mx-auto" />
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent mt-2" />
            </motion.div>
            
            {/* Main Headline */}
            <motion.h1 
              className="text-5xl md:text-7xl lg:text-8xl font-light tracking-wide mb-8 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <span className="block text-white">THE KING'S</span>
              <span className="block bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent font-normal">
                CODE ACADEMY
              </span>
            </motion.h1>
            
            {/* Subtitle */}
            <motion.div 
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <p className="text-xl md:text-2xl text-gray-300 font-light max-w-4xl mx-auto leading-relaxed tracking-wide">
                This bootcamp exists to give young men a vision — to see beyond their current reality and step into a future they can build.
              </p>
            </motion.div>

            {/* CTA Button */}
            <motion.div 
              className="mb-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.button 
                whileHover={{ 
                  scale: 1.02,
                  backgroundColor: 'rgba(107, 33, 168, 0.1)',
                  borderColor: 'rgb(147, 51, 234)'
                }}
                onClick={() => setShowRegistration(true)}
                whileTap={{ scale: 0.98 }}
                className="group relative px-12 py-4 border border-purple-500/30 bg-black/50 backdrop-blur-sm rounded-none text-white font-light text-lg tracking-wider transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10"
              >
                <span className="flex items-center justify-center gap-4">
                  START YOUR JOURNEY
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </motion.button>
            </motion.div>

            {/* Stats */}
            {/* <motion.div 
              className="grid grid-cols-3 gap-12 max-w-3xl mx-auto border-t border-purple-500/20 pt-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              {[
                { value: "12", label: "WEEKS", sublabel: "INTENSIVE TRAINING" },
                { value: "95", label: "PERCENT", sublabel: "PLACEMENT RATE" },
                { value: "∞", label: "POTENTIAL", sublabel: "CAREER GROWTH" }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-light text-purple-400 mb-2 tracking-wider">
                    {item.value}
                  </div>
                  <div className="text-white text-sm font-light tracking-widest mb-1">
                    {item.label}
                  </div>
                  <div className="text-gray-500 text-xs tracking-wide">
                    {item.sublabel}
                  </div>
                </div>
              ))}
            </motion.div> */}
            <SkillsShowcase/>
          </motion.div>
        </div>

        {/* Minimal scroll indicator */}
        {/* <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <ChevronDown className="w-6 h-6 text-purple-500/50" />
        </motion.div> */}
      </section>

      {/* Minimal ambient elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-px bg-purple-400/30 rounded-full"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
      {/* Registration Modal */}
      <AnimatePresence>
        {showRegistration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setShowRegistration(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-black border border-purple-500/30 backdrop-blur-xl"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="w-full h-full" 
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='%236b21a8' stroke-width='0.5'/%3E%3C/svg%3E")`,
                    backgroundSize: '120px 120px'
                  }}
                />
              </div>

              {/* Close Button */}
             <button
                onClick={() => setShowRegistration(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white transition-colors z-20"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Modal Content */}
              <div className="relative z-10 p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent mb-4 mx-auto" />
                  <h2 className="text-3xl md:text-4xl font-light text-white mb-2 tracking-wide">
                    BEGIN YOUR <span className="text-purple-400">TRANSFORMATION</span>
                  </h2>
                  <p className="text-gray-400 font-light tracking-wide">
                    Complete your registration to secure your place
                  </p>
                  <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent mt-4 mx-auto" />
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-light text-purple-400 mb-4 tracking-wider border-b border-purple-500/20 pb-2">
                      <User className="w-5 h-5 inline mr-2" />
                      PERSONAL INFORMATION
                    </h3>
                    
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="First Name*"
                          className={`w-full p-3 bg-black/50 border ${formErrors.firstName ? 'border-red-500' : 'border-purple-500/30'} text-white placeholder-gray-500 font-light tracking-wide focus:outline-none focus:border-purple-500 transition-colors`}
                        />
                        {formErrors.firstName && (
                          <p className="text-red-400 text-sm mt-1 font-light">{formErrors.firstName}</p>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Last Name*"
                          className={`w-full p-3 bg-black/50 border ${formErrors.lastName ? 'border-red-500' : 'border-purple-500/30'} text-white placeholder-gray-500 font-light tracking-wide focus:outline-none focus:border-purple-500 transition-colors`}
                        />
                        {formErrors.lastName && (
                          <p className="text-red-400 text-sm mt-1 font-light">{formErrors.lastName}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Middle Name */}
                    <div>
                      <input
                        type="text"
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleInputChange}
                        placeholder="Middle Name (Optional)"
                        className="w-full p-3 bg-black/50 border border-purple-500/30 text-white placeholder-gray-500 font-light tracking-wide focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-light text-purple-400 mb-4 tracking-wider border-b border-purple-500/20 pb-2">
                      <Mail className="w-5 h-5 inline mr-2" />
                      CONTACT DETAILS
                    </h3>
                    
                    <div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email Address*"
                        className={`w-full p-3 bg-black/50 border ${formErrors.email ? 'border-red-500' : 'border-purple-500/30'} text-white placeholder-gray-500 font-light tracking-wide focus:outline-none focus:border-purple-500 transition-colors`}
                      />
                      {formErrors.email && (
                        <p className="text-red-400 text-sm mt-1 font-light">{formErrors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className={`w-full p-3 bg-black/50 border ${formErrors.dateOfBirth ? 'border-red-500' : 'border-purple-500/30'} text-white font-light tracking-wide focus:outline-none focus:border-purple-500 transition-colors`}
                      />
                      {formErrors.dateOfBirth && (
                        <p className="text-red-400 text-sm mt-1 font-light">{formErrors.dateOfBirth}</p>
                      )}
                    </div>
                  </div>

                  {/* Equipment */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-light text-purple-400 mb-4 tracking-wider border-b border-purple-500/20 pb-2">
                      <Laptop className="w-5 h-5 inline mr-2" />
                      EQUIPMENT
                    </h3>
                    
                    <div>
                      <p className="text-gray-300 font-light mb-3 tracking-wide">Do you have a laptop?*</p>
                      <div className="flex gap-6">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="hasLaptop"
                            value="true"
                            checked={formData.hasLaptop === true}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 border-2 rounded-full mr-3 ${formData.hasLaptop === true ? 'border-purple-500 bg-purple-500' : 'border-purple-500/50'} relative`}>
                            {formData.hasLaptop === true && (
                              <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                            )}
                          </div>
                          <span className="text-white font-light tracking-wide">Yes, I have a laptop</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="hasLaptop"
                            value="false"
                            checked={formData.hasLaptop === false}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 border-2 rounded-full mr-3 ${formData.hasLaptop === false ? 'border-purple-500 bg-purple-500' : 'border-purple-500/50'} relative`}>
                            {formData.hasLaptop === false && (
                              <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                            )}
                          </div>
                          <span className="text-white font-light tracking-wide">No, I don't have a laptop</span>
                        </label>
                      </div>
                      {formErrors.hasLaptop && (
                        <p className="text-red-400 text-sm mt-2 font-light">{formErrors.hasLaptop}</p>
                      )}
                    </div>
                  </div>

                  {/* Course Selection */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-light text-purple-400 mb-4 tracking-wider border-b border-purple-500/20 pb-2">
                      <BookOpen className="w-5 h-5 inline mr-2" />
                      COURSE SELECTION
                    </h3>
                    
                    <div>
                      <select
                        name="course"
                        value={formData.course}
                        onChange={handleInputChange}
                        disabled={formData.hasLaptop === null}
                        className={`w-full p-3 bg-black/50 border ${formErrors.course ? 'border-red-500' : 'border-purple-500/30'} text-white font-light tracking-wide focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <option value="">
                          {formData.hasLaptop === null ? 'Please select laptop availability first' : 'Select a course*'}
                        </option>
                        {getAvailableCourses().map((course, index) => (
                          <option key={index} value={course} className="bg-black">
                            {course}
                          </option>
                        ))}
                      </select>
                      {formErrors.course && (
                        <p className="text-red-400 text-sm mt-1 font-light">{formErrors.course}</p>
                      )}
                      
                      {formData.hasLaptop === false && (
                        <p className="text-purple-300 text-sm mt-2 font-light">
                          * Limited course selection available without a laptop
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-light text-lg tracking-wider border border-purple-500/50 hover:from-purple-700 hover:to-purple-600 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20"
                    >
                      SECURE YOUR PLACE
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KingsCodeHero;