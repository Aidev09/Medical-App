import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '@/store/hooks';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';

const TopNav: React.FC = () => {
  const { userProfile } = useAppSelector(state => state.auth);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const username = userProfile?.name || 'User';
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  if (location.pathname === '/auth' || location.pathname === '/') return null;

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme || 'light');
  }, [resolvedTheme]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const getTimeBasedInfo = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { greeting: 'Good morning', color: 'text-amber-600 dark:text-amber-400' };
    if (hour < 17) return { greeting: 'Good afternoon', color: 'text-orange-600 dark:text-orange-400' };
    return { greeting: 'Good evening', color: 'text-indigo-600 dark:text-indigo-400' };
  };

  const { greeting, color } = getTimeBasedInfo();

  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    toast.success(`Switched to ${newTheme} mode`);
  };

  return (
    <>
      {/* Spacer to reserve height */}
      

      <AnimatePresence>
        {isVisible && (
          <motion.nav
            className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 pt-4 sm:pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-screen-sm mx-auto">
              <div className="flex items-center justify-between h-12 rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm px-4 sm:px-6">
                {/* Left: Beautiful Time-based Greeting */}
                <div className="flex items-center">
                  <motion.h1 
                    className={`text-base font-semibold ${color} tracking-wide`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {greeting}
                  </motion.h1>
                </div>

                {/* Right: Username + Theme Toggle */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center py-1.5 px-3 rounded-xl bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate max-w-[120px] sm:max-w-none">
                      {username}
                    </p>
                  </div>

                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-xl bg-gray-50/80 dark:bg-gray-700/80 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    {resolvedTheme === 'dark' ? (
                      <Moon className="h-4 w-4 text-indigo-400" />
                    ) : (
                      <Sun className="h-4 w-4 text-amber-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
};

export default TopNav;
