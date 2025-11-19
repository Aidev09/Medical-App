
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface ScheduleSelectorProps {
  onChange?: (selectedDays: number[]) => void;
  className?: string;
}

const ScheduleSelector: React.FC<ScheduleSelectorProps> = ({ onChange, className }) => {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const toggleDay = (index: number) => {
    const newSelectedDays = selectedDays.includes(index)
      ? selectedDays.filter(day => day !== index)
      : [...selectedDays, index];
    
    setSelectedDays(newSelectedDays);
    onChange?.(newSelectedDays);
  };

  return (
    <div className={cn("flex justify-between items-center", className)}>
      {daysOfWeek.map((day, index) => (
        <motion.button
          key={index}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
            selectedDays.includes(index)
              ? "bg-primary text-white"
              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
          )}
          onClick={() => toggleDay(index)}
        >
          {day}
        </motion.button>
      ))}
    </div>
  );
};

export default ScheduleSelector;
