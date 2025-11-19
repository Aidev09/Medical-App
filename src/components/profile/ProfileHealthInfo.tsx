
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge as BadgeComponent } from '@/components/ui/badge';
import { UserData } from '@/types/profile';

interface ProfileHealthInfoProps {
  userData: UserData;
}

const ProfileHealthInfo: React.FC<ProfileHealthInfoProps> = ({ userData }) => {
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
      className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5"
      variants={itemVariants}
    >
      <motion.div whileHover={{ y: -2, transition: { duration: 0.3 } }}>
        <Card className="border border-border/50 bg-gradient-to-br from-rose-50/50 to-transparent dark:from-rose-950/30 dark:to-transparent shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="p-2.5 pb-1">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-rose-500" />
              Blood Type
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2.5 pt-0">
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold">{userData.healthInfo.bloodType}</p>
              <BadgeComponent className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50 dark:border-rose-800/50 text-[10px] px-1.5 py-0.5 h-4">
                Universal Donor
              </BadgeComponent>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div whileHover={{ y: -2, transition: { duration: 0.3 } }}>
        <Card className="border border-border/50 bg-gradient-to-br from-sky-50/50 to-transparent dark:from-sky-950/30 dark:to-transparent shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="p-2.5 pb-1">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-sky-500" />
              Allergies
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2.5 pt-0">
            <p className="text-base font-semibold">{userData.healthInfo.allergies}</p>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div whileHover={{ y: -2, transition: { duration: 0.3 } }}>
        <Card className="border border-border/50 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/30 dark:to-transparent shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="p-2.5 pb-1">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-purple-500" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2.5 pt-0">
            <p className="text-sm font-medium">{userData.healthInfo.emergencyContact}</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div whileHover={{ y: -2, transition: { duration: 0.3 } }}>
        <Card className="border border-border/50 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/30 dark:to-transparent shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="p-2.5 pb-1">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-green-500" />
              Patient Disease
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2.5 pt-0">
            <p className="text-base font-semibold">{userData.healthInfo.patientDisease}</p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ProfileHealthInfo;
