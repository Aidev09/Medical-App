import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import MedicoLogo from '@/components/ui/MedicoLogo';

const Index = () => {
  const navigate = useNavigate();

  // Auto-redirect to auth page after a few seconds in production
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/auth');
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* <div className="absolute inset-0 bg-gradient-radial from-primary/10 to-transparent" /> */}
      
      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center px-6 z-10"
      >
        <motion.div className="mb-8 flex justify-center">
          <MedicoLogo size="lg" animate={true} noBg={true} />
        </motion.div>

        <motion.h1 
          className="text-3xl font-bold mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.5 }}
        >
          Remindly Health
        </motion.h1>
        
        <motion.p 
          className="text-muted-foreground mb-8 max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
        >
          Your personal AI-powered medicine reminder and health assistant
        </motion.p>
        
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.5 }}
          onClick={() => navigate('/auth')}
          className="bg-primary text-white px-6 py-3 rounded-full inline-flex items-center font-medium hover:bg-primary/90 transition-colors"
        >
          Get Started
          <ArrowRight className="ml-2 w-4 h-4" />
        </motion.button>
      </motion.div>
      
      {/* Floating pills animation (purely decorative) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: window.innerHeight + 100,
              rotate: Math.random() * 180,
              opacity: 0.7
            }}
            animate={{ 
              y: -100,
              x: Math.random() * window.innerWidth,
              rotate: Math.random() * 360,
              opacity: 0
            }}
            transition={{ 
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              delay: i * 2,
              ease: "linear"
            }}
          >
            <div className={`w-16 h-8 rounded-full ${
              ['bg-medicine-blue', 'bg-medicine-green', 'bg-medicine-peach', 'bg-medicine-purple', 'bg-medicine-teal'][i % 5]
            }`} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Index;
