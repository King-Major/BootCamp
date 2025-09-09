import React from 'react';
import { motion } from 'framer-motion';

const SkillsShowcase = () => {
  const skills = [
    {
      title: "App Development with Glide",
      subtitle: "No-Code Platform",
      description: "Build mobile and web applications by connecting to spreadsheet data (Google Sheets or Airtable). Import data, tweak UI, set workflows, publish—all in minutes.",
      icon: "📱",
      category: "DEVELOPMENT"
    },
    {
      title: "HTML & CSS",
      subtitle: "Web Basics",
      description: "The foundation of web development. Once you know them, you can build and style simple websites quickly.",
      icon: "🌐",
      category: "CODING"
    },
    {
      title: "Cryptocurrency",
      subtitle: "Digital Currency",
      description: "Digital currencies secured by cryptography, often built on blockchain technology. Buy, sell, and hold them in wallets.",
      icon: "₿",
      category: "FINANCE"
    },
    {
      title: "Content Creation",
      subtitle: "Digital Content",
      description: "Creating engaging digital content—blog posts, videos, images, social media—to inform, inspire, or promote. High-quality content drives engagement.",
      icon: "✨",
      category: "CREATIVE"
    },
    {
      title: "Mobile Photography",
      subtitle: "Smartphone Photography",
      description: "Capturing high-quality photos using your smartphone—accessible but filled with creative potential.",
      icon: "📸",
      category: "CREATIVE"
    },
    {
      title: "Virtual Assistance",
      subtitle: "Remote Professional Services",
      description: "Self-employed assistants handling admin, technical, or creative tasks remotely—scheduling, email, research, social media, presentations, bookkeeping.",
      icon: "💼",
      category: "BUSINESS"
    }
  ];

  return (
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl font-light text-white mb-4 tracking-wider">
            SKILLS & SERVICES
          </h1>
          <div className="w-24 h-0.5 bg-purple-500 mx-auto mb-6"></div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light">
            Master these high-demand skills to unlock new opportunities and accelerate your digital career
          </p>
        </motion.div>

        {/* Skills Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {skills.map((skill, index) => (
            <motion.div
              key={index}
              className="group relative bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6 hover:border-purple-500/40 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              {/* Category Badge */}
              <div className="absolute -top-3 left-6">
                <span className="bg-purple-600 text-white text-xs font-light px-3 py-1 rounded-full tracking-wider">
                  {skill.category}
                </span>
              </div>

              {/* Icon */}
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {skill.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-light text-white mb-2 tracking-wide group-hover:text-purple-300 transition-colors">
                {skill.title}
              </h3>

              {/* Subtitle */}
              <div className="text-purple-400 text-sm font-light mb-4 tracking-wider">
                {skill.subtitle}
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm leading-relaxed font-light">
                {skill.description}
              </p>

              {/* Hover Effect Line */}
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-500"></div>
            </motion.div>
          ))}
        </motion.div>
        {/* Minimal ambient elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-px h-px bg-purple-400/20 rounded-full"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
              animate={{
                opacity: [0.2, 0.6, 0.2],
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

export default SkillsShowcase;