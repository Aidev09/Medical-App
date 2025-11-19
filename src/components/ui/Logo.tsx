
import React, { useEffect, useState } from 'react';
import { Pill, Heart, Activity, Droplets, Shield, Thermometer } from 'lucide-react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  animate?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '', animate = false }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10'
  };

  useEffect(() => {
    if (animate && !hasAnimated) {
      setTimeout(() => setHasAnimated(true), 100);
    }
  }, [animate, hasAnimated]);

  const iconVariants = {
    initial: {
      scale: 0.8,
      opacity: 0.6,
      rotate: 0
    },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    hover: {
      scale: 1.1,
      y: -2,
      opacity: 1,
      transition: { duration: 0.3 }
    },
    startAnimation: {
      scale: [0.8, 1.2, 1],
      opacity: [0, 1, 1],
      rotate: [0, 10, 0],
      transition: { 
        duration: 1.5,
        times: [0, 0.6, 1],
        ease: "easeInOut"
      }
    },
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.9, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse" as "reverse"
      }
    }
  };
  
  const textVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { delay: 0.5, duration: 0.5 }
    },
    pulse: {
      opacity: [1, 0.8, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse" as "reverse"
      }
    }
  };

  const orbVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: { 
      opacity: [0, 0.7, 0.4], 
      scale: [0, 1.2, 1],
      transition: { 
        delay: 0.5, 
        duration: 1.2,
        times: [0, 0.6, 1],
      }
    }
  };

  const orbitVariants = {
    initial: { rotate: 0 },
    animate: { 
      rotate: 360,
      transition: { 
        duration: 15, 
        repeat: Infinity, 
        ease: "linear" 
      }
    }
  };

  return (
    <div 
      className={`flex items-center gap-2 ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <motion.div 
        className="relative"
        initial="initial"
        animate={hasAnimated ? (isHovering ? "hover" : "pulse") : (animate ? "startAnimation" : "animate")}
        variants={iconVariants}
      >
        {/* Background glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-green-400/20 blur-md"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: [0, 0.6, 0.3], 
            scale: [0.5, 1.3, 1.1],
            transition: { 
              duration: 2, 
              repeat: Infinity, 
              repeatType: "reverse" as "reverse"
            }
          }}
        />
        
        {/* Orbiting elements */}
        <motion.div
          className="absolute inset-0"
          variants={orbitVariants}
          initial="initial"
          animate="animate"
        >
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <motion.div
              key={i}
              className={`absolute ${i % 2 === 0 ? 'text-teal-500/70' : 'text-green-500/70'}`}
              initial={{ opacity: 0, scale: 0, rotate: 0 }}
              animate={{ 
                opacity: 0.7, 
                scale: 1,
                rotate: angle,
                transition: { 
                  delay: 0.8 + i * 0.1, 
                  duration: 0.8, 
                  ease: "easeOut"
                }
              }}
              style={{
                transformOrigin: "center center",
                left: "50%",
                top: "50%",
                transform: `rotate(${angle}deg) translateX(16px) translateY(-50%)`
              }}
            >
              <motion.div 
                animate={{ rotate: -angle }}
                transition={{ duration: 0 }}
              >
                {i % 6 === 0 && <Droplets size={6} />}
                {i % 6 === 1 && <Shield size={6} />}
                {i % 6 === 2 && <Thermometer size={6} />}
                {i % 6 === 3 && <Droplets size={6} />}
                {i % 6 === 4 && <Shield size={6} />}
                {i % 6 === 5 && <Thermometer size={6} />}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Main icon layers */}
        <motion.div
          className="absolute"
          variants={iconVariants}
        >
          <Heart className={`${sizeClasses[size]} text-primary fill-primary/30 opacity-70`} />
        </motion.div>
        
        <motion.div
          variants={iconVariants}
          className="relative z-10"
        >
          <Pill className={`${sizeClasses[size]} text-primary rotate-45`} />
        </motion.div>
        
        <motion.div
          className="absolute top-0 left-0 z-20"
          variants={iconVariants}
        >
          <Activity className={`${sizeClasses[size]} text-primary-foreground stroke-primary opacity-80 scale-75`} />
        </motion.div>
      </motion.div>
      
      {showText && (
        <motion.div 
          className="font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-600 dark:from-green-400 dark:to-teal-500"
          variants={textVariants}
          initial="initial"
          animate={hasAnimated ? "pulse" : (animate ? "animate" : "animate")}
        >
          <span className={`${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl'}`}>
            Medico<span className="text-muted-foreground">+</span>
          </span>
        </motion.div>
      )}
    </div>
  );
};

export default Logo;
