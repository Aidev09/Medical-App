import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Crown, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import TopNav from './TopNav';
import { useLocation } from 'react-router-dom';

interface NavbarProps {
  themeToggle: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ themeToggle }) => {
  const { userProfile } = useAppSelector(state => state.auth);
  const username = userProfile?.name || 'User';
  const location = useLocation();
  
  // Hide on auth, index/landing pages, and pro features page
  if (location.pathname === '/auth' || location.pathname === '/' || location.pathname === '/pro-features' || location.pathname.startsWith('/feature/')) {
    return null;
  }
  
  return (
    <>
      {/* Modern Top Navigation */}
      <TopNav />
      
      {/* Original Navbar - keeping for compatibility */}
      <motion.header 
        className="fixed top-16 left-0 right-0 z-40 bg-white/96 dark:bg-gray-900/96 backdrop-blur-2xl border-b border-gray-200/60 dark:border-gray-800/60 shadow-[0_1px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_20px_rgba(0,0,0,0.25)] hidden"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30, duration: 0.6 }}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-primary/3 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-center h-16">
            {/* Left Section - Logo & Branding */}
            <motion.div 
              className="flex items-center gap-4"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="relative">
                <motion.div
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/90 via-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25 border border-primary/20"
                  whileHover={{ 
                    scale: 1.05,
                    rotate: [0, -3, 3, 0],
                    transition: { duration: 0.4 }
                  }}
                >
                  <Crown className="h-5 w-5 text-white" />
                </motion.div>
                
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="h-3 w-3 text-primary drop-shadow-sm" />
                </motion.div>
              </div>
              
              <div className="flex flex-col gap-0.5">
                <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-primary to-primary/80 dark:from-white dark:via-primary-foreground dark:to-primary-foreground/80">
                  Medico
                </h1>
                <Badge 
                  variant="outline" 
                  className="bg-gradient-to-r from-primary/8 to-primary/12 text-primary/90 border-primary/25 dark:text-primary-foreground/90 dark:border-primary/30 text-[10px] px-2 py-0.5 h-4 w-fit font-medium tracking-wide"
                >
                  PRO VERSION
                </Badge>
              </div>
            </motion.div>
            
            {/* Right Section - User Info & Controls */}
            <motion.div 
              className="flex items-center gap-6"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {/* User Profile Section - Hidden on mobile */}
              <div className="hidden sm:flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                    Welcome back,
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    {username}
                  </p>
                </div>
                
                <motion.div
                  className="relative w-9 h-9 rounded-full bg-gradient-to-br from-primary/15 via-primary/20 to-primary/25 flex items-center justify-center border-2 border-primary/30 shadow-sm"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <span className="text-sm font-bold text-primary">
                    {username.charAt(0).toUpperCase()}
                  </span>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                </motion.div>
              </div>
              
              {/* Separator */}
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />
              
              {/* Theme Toggle */}
              <motion.div
                className="flex items-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {themeToggle}
              </motion.div>
            </motion.div>
          </div>
        </div>
        
        {/* Bottom border accent */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </motion.header>
    </>
  );
};

export default Navbar;
