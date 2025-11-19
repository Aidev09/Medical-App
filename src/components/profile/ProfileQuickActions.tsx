import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, Settings, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProfileQuickActionsProps {
  onSettingsClick: () => void;
}

const ProfileQuickActions: React.FC<ProfileQuickActionsProps> = ({ onSettingsClick }) => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.9 },
    visible: { 
      y: 0, 
      opacity: 1,
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 25,
        duration: 0.4
      }
    }
  };

  const actions = [
    {
      icon: Clock,
      label: 'Reminders',
      path: '/reminders',
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-100/50',
      darkBgGradient: 'dark:from-emerald-950/40 dark:to-teal-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800/50',
      description: 'Manage reminders'
    },
    {
      icon: Crown,
      label: 'Pro Features',
      path: '/pro-features',
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-100/50',
      darkBgGradient: 'dark:from-purple-950/40 dark:to-pink-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800/50',
      description: 'Unlock Premium',
      isPro: true
    },
    {
      icon: Settings,
      label: 'Settings',
      action: onSettingsClick,
      gradient: 'from-gray-500 to-slate-600',
      bgGradient: 'from-gray-50 to-slate-100/50',
      darkBgGradient: 'dark:from-gray-950/40 dark:to-slate-900/20',
      borderColor: 'border-gray-200 dark:border-gray-800/50',
      description: 'App settings'
    }
  ];

  return (
    <motion.div 
      className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {actions.map((action, index) => (
        <motion.div 
          key={action.label}
          variants={itemVariants}
          whileHover={{ 
            scale: 1.03, 
            y: -3,
            transition: { type: "spring", stiffness: 400, damping: 25 }
          }}
          whileTap={{ 
            scale: 0.97,
            transition: { duration: 0.1 }
          }}
        >
          <Button 
            variant="outline" 
            className={`relative flex flex-col items-center justify-center h-24 w-full space-y-2 overflow-hidden group transition-all duration-300 ${action.bgGradient} ${action.darkBgGradient} ${action.borderColor} hover:shadow-xl hover:shadow-black/10 active:shadow-lg backdrop-blur-sm p-4 border-2`}
            onClick={action.path ? () => navigate(action.path) : action.action}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-15 transition-opacity duration-300`} />
            
            {action.isPro && (
              <>
                <motion.div
                  className="absolute top-2 right-2"
                  animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="h-3 w-3 text-purple-500" />
                </motion.div>
                
                <motion.div 
                  className="absolute top-1 right-1 w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                <Badge 
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-[9px] px-2 py-0.5 shadow-md"
                >
                  PRO
                </Badge>
              </>
            )}
            
            <motion.div
              className={`p-2 rounded-xl bg-gradient-to-br ${action.gradient} shadow-lg group-hover:shadow-xl transition-shadow duration-300 relative z-10`}
              whileHover={{ 
                rotate: action.isPro ? [0, -10, 10, 0] : [0, -5, 5, 0],
                scale: 1.1,
                transition: { duration: 0.3 }
              }}
            >
              <action.icon className="h-5 w-5 text-white" />
            </motion.div>
            
            <div className="text-center space-y-1 relative z-10">
              <span className={`text-sm font-semibold ${action.isPro ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-700 dark:from-purple-400 dark:to-pink-400' : 'text-foreground'} group-hover:font-bold transition-all duration-200`}>
                {action.label}
              </span>
              <p className="text-[11px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 leading-tight font-medium">
                {action.description}
              </p>
            </div>
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProfileQuickActions;
