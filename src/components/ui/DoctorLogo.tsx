
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface DoctorLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  animate?: boolean;
  className?: string;
}

const DoctorLogo: React.FC<DoctorLogoProps> = ({ 
  size = 'md', 
  showText = true, 
  animate = true,
  className = '' 
}) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  useEffect(() => {
    if (animate && !hasAnimated) {
      setTimeout(() => setHasAnimated(true), 100);
    }
  }, [animate, hasAnimated]);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2, 
        delayChildren: 0.3,
      }
    },
  };
  
  const doctorVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1]
      }
    },
    hover: {
      y: -5,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };
  
  const bubbleVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: 0.6
      }
    },
    hover: {
      scale: 1.1,
      rotate: [0, -5, 5, 0],
      transition: { 
        duration: 0.5,
        ease: "easeInOut",
        times: [0, 0.3, 0.6, 1]
      }
    }
  };
  
  const crossVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: 0.8
      }
    },
    pulse: {
      scale: [1, 1.15, 1],
      opacity: [1, 0.9, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse" as "reverse"
      }
    }
  };
  
  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5, 
        delay: 1,
        ease: "easeOut"
      }
    }
  };

  const sizeClasses = {
    sm: 'h-16',
    md: 'h-24',
    lg: 'h-32'
  };
  
  return (
    <div 
      className={`flex flex-col items-center ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <motion.div 
        className="relative flex flex-col items-center"
        variants={containerVariants}
        initial="hidden"
        animate={hasAnimated ? "visible" : "hidden"}
      >
        {/* Doctor figure */}
        <motion.div
          className={`relative ${sizeClasses[size]}`}
          variants={doctorVariants}
          animate={isHovering ? "hover" : "visible"}
        >
          <svg 
            viewBox="0 0 180 220" 
            xmlns="http://www.w3.org/2000/svg"
            className={`${sizeClasses[size]} w-auto`}
          >
            {/* Doctor Body */}
            <g fill="#102a76" stroke="#102a76" strokeWidth="1">
              {/* Head */}
              <motion.path 
                d="M90,40 C110,40 125,60 125,80 C125,100 110,120 90,120 C70,120 55,100 55,80 C55,60 70,40 90,40"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
              
              {/* Face */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                {/* Eyes */}
                <circle cx="75" cy="75" r="5" fill="#102a76" />
                <circle cx="105" cy="75" r="5" fill="#102a76" />
                
                {/* Smile */}
                <path 
                  d="M75,90 Q90,105 105,90" 
                  fill="none" 
                  stroke="#102a76" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                />
              </motion.g>
              
              {/* Lab Coat */}
              <motion.path 
                d="M60,120 L60,180 L120,180 L120,120"
                fill="#ffffff"
                stroke="#102a76"
                strokeWidth="3"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              />
              
              {/* Coat Details - Pockets */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
              >
                <rect x="70" y="140" width="15" height="20" fill="#102a76" fillOpacity="0.2" stroke="#102a76" strokeWidth="1" />
                <rect x="95" y="140" width="15" height="20" fill="#102a76" fillOpacity="0.2" stroke="#102a76" strokeWidth="1" />
              </motion.g>
              
              {/* Stethoscope */}
              <motion.path
                d="M80,130 C75,135 75,145 80,150 C85,155 95,155 100,150"
                fill="none"
                stroke="#102a76"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 1.2 }}
              />
              
              {/* Pants */}
              <motion.g
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <rect x="60" y="180" width="25" height="40" fill="#102a76" />
                <rect x="95" y="180" width="25" height="40" fill="#102a76" />
              </motion.g>
            </g>
          </svg>

          {/* Speech bubble with plus */}
          <motion.div
            className="absolute top-5 right-0 transform translate-x-1/2"
            variants={bubbleVariants}
            animate={isHovering ? "hover" : "visible"}
          >
            <div className="relative">
              <svg width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="#102a76" />
                <motion.g
                  variants={crossVariants}
                  animate={hasAnimated ? "pulse" : "visible"}
                >
                  <rect x="12" y="18" width="16" height="4" fill="white" />
                  <rect x="18" y="12" width="4" height="16" fill="white" />
                </motion.g>
              </svg>
              {/* Speech bubble tail */}
              <svg className="absolute -bottom-2 -left-2" width="10" height="10" viewBox="0 0 10 10">
                <path d="M0,0 L10,8 L8,0 Z" fill="#102a76" />
              </svg>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Text: "MEDICO" */}
        {showText && (
          <motion.div 
            className="mt-4 text-2xl font-bold tracking-wider text-primary"
            variants={textVariants}
          >
            MEDICO<span className="text-primary-foreground">+</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default DoctorLogo;
