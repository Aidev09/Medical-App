import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Plus, Activity, Shield } from 'lucide-react';

interface MedicoLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  animate?: boolean;
  className?: string;
  noBg?: boolean;
}

const MedicoLogo: React.FC<MedicoLogoProps> = ({ 
  size = 'md', 
  showText = true, 
  animate = false,
  className = '',
  noBg = false
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  useEffect(() => {
    if (animate && !hasAnimated) {
      setTimeout(() => setHasAnimated(true), 100);
    }
  }, [animate, hasAnimated]);
  
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  };
  
  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.3,
      }
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.3 }
    }
  };
  
  const iconVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    hover: {
      scale: 1.1,
      transition: { duration: 0.3, ease: "easeOut" }
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
        delay: 0.6
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

  const glowVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: [0, 0.6, 0.3],
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
        delay: 0.8
      }
    }
  };
  
  const orbitVariants = {
    hidden: { rotate: 0 },
    visible: { 
      rotate: 360,
      transition: { 
        duration: 20, 
        repeat: Infinity, 
        ease: "linear" 
      }
    }
  };

  return (
    <div 
      className={`flex flex-col items-center ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <motion.div 
        className="relative"
        variants={containerVariants}
        initial="hidden"
        animate={hasAnimated ? (isHovering ? "hover" : "visible") : "visible"}
      >
        {/* Background glow effect */}
        {!noBg && (
          <motion.div
            className="absolute inset-0 rounded-full bg-teal-400/20 blur-md"
            variants={glowVariants}
            initial="hidden"
            animate="visible"
          />
        )}

        {/* 3D layered effect */}
        <div className={`relative ${sizeClasses[size]}`}>
          {/* Base layer */}
          {!noBg && (
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-teal-500/90 to-blue-500/90 rounded-full shadow-lg transform -translate-z-10"
              variants={iconVariants}
              style={{ translateZ: "-10px" }}
            />
          )}

          {/* Middle layer - Heart */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            variants={iconVariants}
          >
            <Heart className="w-3/5 h-3/5 text-white fill-white opacity-70" />
          </motion.div>

          {/* Top layer - Activity line */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            variants={iconVariants}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Activity className="w-4/5 h-4/5 text-teal-100 stroke-[1.5]" />
          </motion.div>

          {/* Plus symbol */}
          <motion.div
            className="absolute -right-2 -top-2 bg-white rounded-full p-1 shadow-md"
            variants={crossVariants}
            animate={hasAnimated ? "pulse" : "visible"}
          >
            <Plus className="w-4 h-4 text-teal-500" />
          </motion.div>

          {/* Orbiting elements */}
          <motion.div
            className="absolute inset-0"
            variants={orbitVariants}
            initial="hidden"
            animate="visible"
          >
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                style={{
                  transformOrigin: "center center",
                  left: "50%",
                  top: "50%",
                  transform: `rotate(${angle}deg) translateX(${size === 'lg' ? 20 : size === 'md' ? 14 : 10}px)`
                }}
              >
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Logo Text */}
      {showText && (
        <motion.div 
          className="mt-3 font-bold tracking-wide"
          variants={textVariants}
          initial="hidden"
          animate={hasAnimated ? "visible" : "hidden"}
        >
          <span className={`${textSizeClasses[size]} bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent`}>
            Medico<span className="text-primary">+</span>
          </span>
        </motion.div>
      )}
    </div>
  );
};

export default MedicoLogo;
