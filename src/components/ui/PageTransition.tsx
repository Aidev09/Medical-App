
import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ 
        duration: 0.5, 
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.12
      }}
      className={`${className} relative z-10`}
    >
      {/* Animated medical cross pattern (subtle background element) */}
      <motion.div 
        className="absolute top-0 right-0 w-32 h-32 -z-10 opacity-10"
        animate={{ 
          rotate: [0, 10, 0, -10, 0],
          scale: [1, 1.05, 1, 0.95, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M40,0 V40 H0 V60 H40 V100 H60 V60 H100 V40 H60 V0 Z" 
            fill="currentColor" 
            className="text-primary"
          />
        </svg>
      </motion.div>

      {/* Animated healthcare-related decorative elements */}
      <motion.div 
        className="absolute bottom-10 left-0 w-24 h-24 -z-10 opacity-5"
        animate={{ 
          rotate: [0, 15, 0, -15, 0],
          y: [0, 10, 0, -10, 0]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2.5
        }}
      >
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M50,0 C22.4,0 0,22.4 0,50 C0,77.6 22.4,100 50,100 C77.6,100 100,77.6 100,50 C100,22.4 77.6,0 50,0 Z M80,55 L55,55 L55,80 L45,80 L45,55 L20,55 L20,45 L45,45 L45,20 L55,20 L55,45 L80,45 L80,55 Z" 
            fill="currentColor" 
            className="text-medicine-purple"
          />
        </svg>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.6,
          delay: 0.15,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default PageTransition;
