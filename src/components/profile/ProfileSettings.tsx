
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Bell, 
  Settings, 
  HelpCircle, 
  Lock, 
  LogOut,
  ChevronRight,
  Stethoscope,
  Shield,
  Sparkles
} from 'lucide-react';
import { MenuItemProps } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';

interface ProfileSettingsProps {
  onMenuItemClick: (dialogType: string) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onMenuItemClick }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    toast({
      title: "Logged out successfully",
      description: "You have been signed out of your account"
    });
    
    localStorage.removeItem("userSession");
    
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  const menuItems: MenuItemProps[] = [
    { 
      icon: User, 
      title: 'Personal Information', 
      description: 'Update your profile details and preferences', 
      action: () => onMenuItemClick('personal'),
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200 dark:border-blue-800/50'
    },
    { 
      icon: Bell, 
      title: 'Notification Settings', 
      description: 'Manage alerts, reminders and push notifications', 
      action: () => onMenuItemClick('notifications'),
      color: 'bg-gradient-to-br from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      borderColor: 'border-amber-200 dark:border-amber-800/50'
    },
    { 
      icon: Stethoscope, 
      title: 'Health Information', 
      description: 'Update medical history and health data', 
      action: () => onMenuItemClick('health'),
      color: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      borderColor: 'border-emerald-200 dark:border-emerald-800/50'
    },
    { 
      icon: Settings, 
      title: 'App Preferences', 
      description: 'Customize theme, language and app behavior', 
      action: () => onMenuItemClick('settings'),
      color: 'bg-gradient-to-br from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      borderColor: 'border-purple-200 dark:border-purple-800/50'
    },
    { 
      icon: Shield, 
      title: 'Privacy & Security', 
      description: 'Manage data privacy and account security', 
      action: () => onMenuItemClick('privacy'),
      color: 'bg-gradient-to-br from-green-500 to-emerald-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      borderColor: 'border-green-200 dark:border-green-800/50'
    },
    { 
      icon: HelpCircle, 
      title: 'Help & Support', 
      description: 'Get help, contact support or view tutorials', 
      action: () => navigate('/support'),
      color: 'bg-gradient-to-br from-teal-500 to-cyan-600',
      bgColor: 'bg-teal-50 dark:bg-teal-950/30',
      borderColor: 'border-teal-200 dark:border-teal-800/50'
    },
    { 
      icon: LogOut, 
      title: 'Sign Out', 
      description: 'Log out of your account securely', 
      action: handleLogout,
      danger: true,
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      borderColor: 'border-red-200 dark:border-red-800/50'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    visible: { 
      y: 0, 
      opacity: 1,
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
        duration: 0.4
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible"
      className="space-y-4 mt-6"
    >
      {menuItems.map((item, index) => (
        <motion.button
          key={index}
          variants={itemVariants}
          whileHover={{
            scale: 1.02,
            y: -2,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.98 }}
          onClick={item.action}
          className={`w-full p-5 rounded-2xl flex items-center justify-between transition-all duration-300 overflow-hidden relative group backdrop-blur-sm border shadow-sm hover:shadow-lg active:shadow-md ${item.bgColor} ${item.borderColor}`}
        >
          {/* Animated background overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%]" />
          
          <div className="flex items-center relative z-10">
            <motion.div 
              className={`w-14 h-14 rounded-xl flex items-center justify-center mr-4 shadow-lg ${item.color}`}
              whileHover={{ 
                rotate: [0, -5, 5, 0],
                transition: { duration: 0.3 }
              }}
            >
              <item.icon className="w-6 h-6 text-white" />
              
              {/* Sparkle for special items */}
              {(item.title === 'Privacy & Security' || item.title === 'App Preferences') && (
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="h-3 w-3 text-white" />
                </motion.div>
              )}
            </motion.div>
            
            <div className="text-left">
              <h3 className={`font-semibold text-lg ${item.danger ? 'text-red-700 dark:text-red-400' : 'text-foreground'}`}>
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
          
          {!item.danger && (
            <motion.div
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
            </motion.div>
          )}
          
          {item.danger && (
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <LogOut className="w-6 h-6 text-red-500" />
            </motion.div>
          )}
        </motion.button>
      ))}
    </motion.div>
  );
};

export default ProfileSettings;
