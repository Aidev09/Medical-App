
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DailyHealthTip from './DailyHealthTip';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, RefreshCcw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface CompactHealthTipProps {
  className?: string;
}

const CompactHealthTip: React.FC<CompactHealthTipProps> = ({ className }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const handleRefresh = () => {
    setLoading(true);
    setRefreshKey(prev => prev + 1);
    // Simulate loading state
    setTimeout(() => setLoading(false), 600);
  };

  return (
    <div className={`${className} overflow-hidden`}>
      <motion.div
        className="bg-white dark:bg-gray-900 rounded-xl border border-primary/15 shadow-sm hover:shadow-md transition-shadow duration-300"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        whileHover={{ y: -2 }}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b border-primary/10">
          <div className="flex items-center gap-2">
            <motion.div 
              className="p-1.5 rounded-full bg-gradient-to-br from-primary/20 to-primary/10"
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                repeatDelay: 3,
              }}
            >
              <Sparkles className="h-3 w-3 text-primary" />
            </motion.div>
            <h4 className="text-xs font-medium text-primary">Daily Wellness Insight</h4>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="hidden sm:flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span>Updated daily</span>
            </div>
            <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefresh}
                className="h-6 w-6 p-0 rounded-full hover:bg-primary/10"
                aria-label="Refresh health tip"
                disabled={loading}
              >
                <motion.div
                  animate={loading ? { rotate: 360 } : {}}
                  transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
                >
                  <RefreshCcw className="h-3 w-3 text-primary/80" />
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </div>
        
        <div className="p-3 bg-gradient-to-b from-transparent to-primary/5 dark:from-transparent dark:to-primary/10">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-3 w-3/4 mt-2 rounded-sm" />
              </motion.div>
            ) : (
              <motion.div
                key={`tip-${refreshKey}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <DailyHealthTip 
                  key={refreshKey} 
                  enhanced={true} 
                  autoRotate={true} 
                  rotationInterval={15000}
                  compact={true}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="px-4 py-1.5 flex justify-between items-center border-t border-primary/10 bg-gradient-to-r from-primary/5 to-transparent dark:from-primary/10 dark:to-transparent">
          <Badge variant="outline" className="text-xs font-normal bg-white/80 dark:bg-gray-800/80 text-primary/80 border-primary/15">
            Evidence-based
          </Badge>
          <motion.div whileHover={{ x: 3 }} whileTap={{ x: -1 }}>
            <Button 
              variant="link" 
              size="sm" 
              className="text-xs text-primary p-0 h-auto flex items-center gap-1 hover:no-underline"
              onClick={handleRefresh}
            >
              New tip <ArrowRight className="h-3 w-3" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default CompactHealthTip;
