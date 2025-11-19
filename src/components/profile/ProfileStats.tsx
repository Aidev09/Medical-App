
import React from 'react';
import { motion } from 'framer-motion';
import { Pill, Calendar, BarChart3 } from 'lucide-react';
import { UserData } from '@/types/profile';

interface ProfileStatsProps {
  userData: UserData;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ userData }) => {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <motion.div 
      className="grid grid-cols-3 gap-3 mb-6"
      variants={itemVariants}
    >
      <motion.div 
        className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20 p-3 rounded-xl text-center backdrop-blur-sm border border-blue-100/50 dark:border-blue-800/30 shadow-sm"
        whileHover={{ y: -2, transition: { duration: 0.3 } }}
      >
        <div className="flex flex-col h-full justify-between space-y-1.5">
          <div className="w-8 h-8 mx-auto rounded-full bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Pill className="h-4 w-4" />
          </div>
          <p className="text-xl font-bold text-blue-700 dark:text-blue-400">{userData.stats.medicationAdherence}%</p>
          <p className="text-[10px] text-blue-600/70 dark:text-blue-500 leading-tight">Medication Adherence</p>
        </div>
      </motion.div>
      <motion.div 
        className="bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-900/30 dark:to-teal-800/20 p-3 rounded-xl text-center backdrop-blur-sm border border-teal-100/50 dark:border-teal-800/30 shadow-sm"
        whileHover={{ y: -2, transition: { duration: 0.3 } }}
      >
        <div className="flex flex-col h-full justify-between space-y-1.5">
          <div className="w-8 h-8 mx-auto rounded-full bg-teal-100 dark:bg-teal-800/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <Calendar className="h-4 w-4" />
          </div>
          <p className="text-xl font-bold text-teal-700 dark:text-teal-400">{userData.stats.completedAppointments}</p>
          <p className="text-[10px] text-teal-600/70 dark:text-teal-500 leading-tight">Appointments Completed</p>
        </div>
      </motion.div>
      <motion.div 
        className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-900/30 dark:to-indigo-800/20 p-3 rounded-xl text-center backdrop-blur-sm border border-indigo-100/50 dark:border-indigo-800/30 shadow-sm"
        whileHover={{ y: -2, transition: { duration: 0.3 } }}
      >
        <div className="flex flex-col h-full justify-between space-y-1.5">
          <div className="w-8 h-8 mx-auto rounded-full bg-indigo-100 dark:bg-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <BarChart3 className="h-4 w-4" />
          </div>
          <p className="text-xl font-bold text-indigo-700 dark:text-indigo-400">{userData.stats.healthRecords}</p>
          <p className="text-[10px] text-indigo-600/70 dark:text-indigo-500 leading-tight">Health Records</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfileStats;
