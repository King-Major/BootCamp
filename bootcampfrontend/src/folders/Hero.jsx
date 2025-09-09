import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';

const KingsCodeHero = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => setScrollPosition(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            <motion.div 
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
            </motion.div>
          </motion.div>
        </div>

        {/* Minimal scroll indicator */}
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <ChevronDown className="w-6 h-6 text-purple-500/50" />
        </motion.div>
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
    </div>
  );
};

export default KingsCodeHero;