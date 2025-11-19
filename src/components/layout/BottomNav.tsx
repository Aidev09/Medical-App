import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, Bell, MessageSquare, User, Crown, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const BottomNav: React.FC = () => {
  const location = useLocation();
  
  const navItems = [{
    path: '/dashboard',
    icon: Home,
    label: 'Home',
    color: 'text-blue-500'
  }, {
    path: '/add-medication',
    icon: PlusCircle,
    label: 'Add',
    color: 'text-emerald-500'
  }, {
    path: '/reminders',
    icon: Bell,
    label: 'Reminders',
    color: 'text-orange-500'
  }, {
    path: '/chatbot',
    icon: MessageSquare,
    label: 'Chat',
    color: 'text-teal-500'
  }, {
    path: '/pro-features',
    icon: Crown,
    label: 'Pro',
    color: 'text-purple-500',
    isPro: true
  }, {
    path: '/profile',
    icon: User,
    label: 'Profile',
    color: 'text-indigo-500'
  }];

  if (location.pathname === '/' || location.pathname === '/auth') {
    return null;
  }

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30
      }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border-t border-gray-200/70 dark:border-gray-800/70 py-2 px-2 sm:px-4 shadow-2xl shadow-black/10 dark:shadow-black/30 safe-area-bottom"
    >
      {/* Professional gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-purple-500/3 to-pink-500/3 pointer-events-none" />
      
      <nav className="max-w-xl mx-auto relative">
        <ul className="flex justify-between items-center">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const isPro = item.isPro;
            
            return (
              <li key={item.path} className="relative">
                <Link 
                  to={item.path} 
                  className="flex flex-col items-center p-1.5 sm:p-2.5 transition-all duration-300 group relative"
                >
                  <AnimatePresence>
                    {isActive && (
                      <motion.div 
                        layoutId="navActiveBackground" 
                        className={cn(
                          "absolute inset-0 rounded-2xl shadow-lg",
                          isPro 
                            ? "bg-gradient-to-br from-purple-500/25 to-pink-500/25 dark:from-purple-400/35 dark:to-pink-400/35 border border-purple-300/50 dark:border-purple-600/50" 
                            : "bg-gradient-to-br from-primary/25 to-blue-500/25 dark:from-primary/35 dark:to-blue-500/35 border border-primary/30 dark:border-primary/50"
                        )}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 30
                        }}
                      />
                    )}
                  </AnimatePresence>
                  
                  <motion.div 
                    className="relative z-10"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 25
                    }}
                  >
                    <div className="relative">
                      <motion.div 
                        className={cn(
                          "w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center mb-1 transition-all duration-300",
                          isActive 
                            ? isPro 
                              ? "bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg" 
                              : "bg-gradient-to-br from-primary to-blue-500 shadow-lg"
                            : "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                        )}
                        whileHover={{
                          rotate: isPro ? [0, -10, 10, 0] : [0, -5, 5, 0],
                          transition: { duration: 0.4 }
                        }}
                      >
                        <item.icon className={cn(
                          "w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300",
                          isActive 
                            ? "text-white" 
                            : "text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300"
                        )} />
                      </motion.div>
                      
                      {isPro && (
                        <>
                          <motion.div 
                            className="absolute -top-1 -right-1"
                            animate={{
                              scale: [1, 1.4, 1],
                              rotate: [0, 180, 360]
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-purple-500" />
                          </motion.div>
                          
                          <motion.div 
                            className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"
                            animate={{
                              scale: [1, 1.3, 1]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        </>
                      )}
                    </div>
                  </motion.div>
                  
                  <motion.span 
                    className={cn(
                      "text-[10px] sm:text-[11px] transition-all duration-300 relative z-10 leading-tight font-medium",
                      isActive 
                        ? isPro 
                          ? "font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400" 
                          : "font-bold text-primary"
                        : "text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300"
                    )}
                    animate={{
                      y: isActive ? -1 : 0,
                      scale: isActive ? 1.05 : 1
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 30
                    }}
                  >
                    {item.label}
                    {isPro && (
                      <motion.span 
                        className="ml-0.5 hidden sm:inline-block"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      >
                        ✨
                      </motion.span>
                    )}
                  </motion.span>
                  
                  <AnimatePresence>
                    {isActive && (
                      <motion.div 
                        layoutId="bottomNavIndicator" 
                        className={cn(
                          "absolute -bottom-1 h-0.5 w-8 sm:w-10 rounded-t-full shadow-sm",
                          isPro 
                            ? "bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" 
                            : "bg-gradient-to-r from-primary via-blue-500 to-primary"
                        )}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 30
                        }}
                      />
                    )}
                  </AnimatePresence>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </motion.div>
  );
};

export default BottomNav;