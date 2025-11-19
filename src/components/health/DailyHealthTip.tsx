
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Coffee, Apple, Moon, Brain, Heart, Droplets } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const healthTips = [
  {
    tip: "Drink at least 8 glasses of water daily to stay hydrated and improve body functions",
    icon: Droplets,
    color: "text-blue-500"
  },
  {
    tip: "Aim for 7-9 hours of quality sleep to support mental health and physical recovery",
    icon: Moon,
    color: "text-indigo-500"
  },
  {
    tip: "Include at least 5 servings of fruits and vegetables in your daily diet",
    icon: Apple,
    color: "text-green-500"
  },
  {
    tip: "Take short breaks between work to reduce eye strain and mental fatigue",
    icon: Coffee,
    color: "text-amber-500"
  },
  {
    tip: "Practice 10 minutes of mindfulness or meditation to reduce stress levels",
    icon: Brain,
    color: "text-purple-500"
  },
  {
    tip: "Walking 10,000 steps daily improves cardiovascular health and metabolism",
    icon: Heart,
    color: "text-red-500"
  },
  {
    tip: "Reduce screen time before bed to improve sleep quality and duration",
    icon: Moon,
    color: "text-blue-600"
  },
  {
    tip: "Try to incorporate strength training at least twice a week to maintain muscle mass",
    icon: Heart,
    color: "text-primary"
  },
];

interface DailyHealthTipProps {
  autoRotate?: boolean;
  rotationInterval?: number;
  enhanced?: boolean;
  compact?: boolean;
}

const DailyHealthTip: React.FC<DailyHealthTipProps> = ({ 
  autoRotate = false, 
  rotationInterval = 10000, 
  enhanced = false,
  compact = false
}) => {
  const [tipIndex, setTipIndex] = useState(() => {
    // Get the current date to generate a consistent tip for the day
    const today = new Date().toDateString();
    
    // Get stored tip date
    const storedTipDate = localStorage.getItem('tipDate');
    
    // If we have a stored tip and it's from today, use the stored index
    if (storedTipDate === today && localStorage.getItem('tipIndex')) {
      return Number(localStorage.getItem('tipIndex'));
    }
    
    // Otherwise generate a new tip for today
    const newTipIndex = Math.floor(Math.random() * healthTips.length);
    localStorage.setItem('tipDate', today);
    localStorage.setItem('tipIndex', newTipIndex.toString());
    return newTipIndex;
  });
  
  const [tip, setTip] = useState(healthTips[tipIndex]);

  // Auto-rotate tips if enabled
  useEffect(() => {
    if (!autoRotate) return;
    
    const rotationTimer = setInterval(() => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * healthTips.length);
      } while (newIndex === tipIndex);
      
      setTipIndex(newIndex);
      setTip(healthTips[newIndex]);
    }, rotationInterval);
    
    return () => clearInterval(rotationTimer);
  }, [autoRotate, rotationInterval, tipIndex]);

  const getNewTip = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * healthTips.length);
    } while (newIndex === tipIndex);
    
    setTipIndex(newIndex);
    setTip(healthTips[newIndex]);
  };

  // Basic version
  if (!enhanced) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden border border-primary/20 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${tip.color} bg-opacity-10 flex items-center justify-center`}>
                <Lightbulb className={`h-5 w-5 ${tip.color}`} />
              </div>
              <div>
                <h3 className="font-medium text-sm mb-1">Daily Health Tip</h3>
                <p className="text-muted-foreground text-sm">{tip.tip}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 px-4 py-2 flex justify-end">
            <Button variant="ghost" size="sm" onClick={getNewTip}>
              New Tip
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  // Compact enhanced version
  if (compact) {
    return (
      <motion.div
        key={tipIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-start gap-3">
          <motion.div 
            className={`p-2 rounded-full bg-${tip.color}/10 flex-shrink-0`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <tip.icon className={`h-4 w-4 ${tip.color}`} />
          </motion.div>
          <div>
            <p className="text-sm font-medium text-foreground line-clamp-2">{tip.tip}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Enhanced, more attractive version
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tipIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-r from-secondary/50 to-background">
          <CardContent className="p-5">
            <motion.div 
              className="flex items-start gap-4"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <motion.div 
                className={`p-3 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-inner`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{ 
                  rotate: [0, -5, 5, -5, 0],
                  scale: [1, 1.05, 1, 1.05, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  repeatDelay: 5
                }}
              >
                <tip.icon className={`h-7 w-7 ${tip.color}`} />
              </motion.div>
              <div>
                <motion.h3 
                  className="font-semibold text-lg mb-2 text-primary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  Today's Health Insight
                </motion.h3>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <p className="text-foreground font-medium">{tip.tip}</p>
                  <p className="text-xs text-muted-foreground mt-2">Tap for a new tip</p>
                </motion.div>
              </div>
            </motion.div>
          </CardContent>
          <CardFooter className="bg-gradient-to-r from-primary/5 to-transparent px-5 py-3 flex justify-between items-center">
            <span className="text-xs text-primary/70">
              Swipe for better health
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={getNewTip}
              className="text-primary hover:text-primary/80 hover:bg-primary/10"
            >
              Next Tip
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default DailyHealthTip;
