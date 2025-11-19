
import React from 'react';
import { Clock, Trash2, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface MedicationCardProps {
  id: string;
  name: string;
  dosage: string;
  time: string;
  color: 'blue' | 'green' | 'peach' | 'purple' | 'teal' | 'indigo' | 'amber' | 'rose' | 'cyan' | 'lime';
  taken?: boolean;
  className?: string;
  onClick?: () => void;
  onDelete?: (id: string) => void;
}

const MedicationCard: React.FC<MedicationCardProps> = ({
  id,
  name,
  dosage,
  time,
  color = 'blue',
  taken = false,
  className,
  onClick,
  onDelete,
}) => {
  const colorClasses = {
    blue: 'bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:border-teal-900/50',
    green: 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900/50',
    peach: 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-900/50',
    purple: 'bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-900/50',
    teal: 'bg-sky-50 border-sky-200 dark:bg-sky-950/30 dark:border-sky-900/50',
    indigo: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-900/50',
    amber: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50',
    rose: 'bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/50',
    cyan: 'bg-cyan-50 border-cyan-200 dark:bg-cyan-950/30 dark:border-cyan-900/50',
    lime: 'bg-lime-50 border-lime-200 dark:bg-lime-950/30 dark:border-lime-900/50',
  };
  
  const dotColors = {
    blue: 'bg-teal-600 dark:bg-teal-400',
    green: 'bg-green-600 dark:bg-green-400',
    peach: 'bg-orange-600 dark:bg-orange-400',
    purple: 'bg-purple-600 dark:bg-purple-400',
    teal: 'bg-sky-600 dark:bg-sky-400',
    indigo: 'bg-indigo-600 dark:bg-indigo-400',
    amber: 'bg-amber-600 dark:bg-amber-400',
    rose: 'bg-rose-600 dark:bg-rose-400',
    cyan: 'bg-cyan-600 dark:bg-cyan-400',
    lime: 'bg-lime-600 dark:bg-lime-400',
  };

  const gradientColors = {
    blue: 'from-teal-500/10 to-teal-600/5',
    green: 'from-green-500/10 to-green-600/5',
    peach: 'from-orange-500/10 to-orange-600/5',
    purple: 'from-purple-500/10 to-purple-600/5',
    teal: 'from-sky-500/10 to-sky-600/5',
    indigo: 'from-indigo-500/10 to-indigo-600/5',
    amber: 'from-amber-500/10 to-amber-600/5',
    rose: 'from-rose-500/10 to-rose-600/5',
    cyan: 'from-cyan-500/10 to-cyan-600/5',
    lime: 'from-lime-500/10 to-lime-600/5',
  };

  const textColors = {
    blue: 'text-teal-700 dark:text-teal-300',
    green: 'text-green-700 dark:text-green-300',
    peach: 'text-orange-700 dark:text-orange-300',
    purple: 'text-purple-700 dark:text-purple-300',
    teal: 'text-sky-700 dark:text-sky-300',
    indigo: 'text-indigo-700 dark:text-indigo-300',
    amber: 'text-amber-700 dark:text-amber-300',
    rose: 'text-rose-700 dark:text-rose-300',
    cyan: 'text-cyan-700 dark:text-cyan-300',
    lime: 'text-lime-700 dark:text-lime-300',
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -3, boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)' }}
      whileTap={{ y: 0, boxShadow: 'none' }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={cn(
        'p-4 rounded-2xl border transition-all health-card bg-gradient-to-br shadow-sm',
        colorClasses[color],
        gradientColors[color],
        taken ? 'opacity-60' : '',
        className
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div className={cn('w-3 h-3 rounded-full mr-2', dotColors[color])}></div>
          <h3 className={cn('font-medium text-lg', textColors[color])}>{name}</h3>
        </div>
        <div className="flex gap-1.5">
          {onDelete && (
            <motion.button 
              whileTap={{ scale: 0.92 }}
              className="text-rose-500 hover:text-rose-600 p-1.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              onClick={handleDelete}
              aria-label="Delete medication"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          )}
          <motion.button 
            whileTap={{ scale: 0.92 }}
            className={cn('p-1.5 rounded-full transition-colors hover:bg-white/50 dark:hover:bg-white/10', textColors[color])}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
      
      <div className="mb-3">
        <p className="text-sm text-muted-foreground">{dosage}</p>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="w-4 h-4 mr-1" />
          <span>{time}</span>
        </div>
        
        {taken ? (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-900/50 flex items-center gap-1 px-2.5 py-0.5">
            <Check className="w-3 h-3" />
            <span className="text-xs">Taken</span>
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-teal-100 text-teal-800 hover:bg-teal-100 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-900/50 px-2.5 py-0.5">
            <span className="text-xs">Due</span>
          </Badge>
        )}
      </div>
    </motion.div>
  );
};

export default MedicationCard;
