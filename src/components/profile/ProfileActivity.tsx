
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Pill, Bookmark, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge as BadgeComponent } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const ProfileActivity: React.FC = () => {
  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      variants={fadeVariants} 
      initial="hidden" 
      animate="visible"
      className="mt-6"
    >
      <Card className="bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-900 dark:to-gray-950/80 backdrop-blur-sm border border-border/50 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <BadgeComponent variant="outline" className="bg-primary/5 border-primary/20">
              Last 14 days
            </BadgeComponent>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 pb-3 border-b last:border-none group relative"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm
                    ${i % 3 === 0 ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 dark:from-blue-900/70 dark:to-blue-800/50 dark:text-blue-300' : ''}
                    ${i % 3 === 1 ? 'bg-gradient-to-br from-green-100 to-green-200 text-green-700 dark:from-green-900/70 dark:to-green-800/50 dark:text-green-300' : ''}
                    ${i % 3 === 2 ? 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 dark:from-amber-900/70 dark:to-amber-800/50 dark:text-amber-300' : ''}
                  `}
                >
                  {i % 3 === 0 && <Pill className="h-5 w-5" />}
                  {i % 3 === 1 && <Calendar className="h-5 w-5" />}
                  {i % 3 === 2 && <Bookmark className="h-5 w-5" />}
                </motion.div>
                <div className="flex-1">
                  <h3 className="font-medium">
                    {i % 3 === 0 && 'Medication reminder completed'}
                    {i % 3 === 1 && 'Appointment scheduled'}
                    {i % 3 === 2 && 'Health record added'}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <Clock className="h-3 w-3" />
                    <span>{i * 2 + 1} {i === 0 ? 'hour' : 'days'} ago</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity absolute right-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProfileActivity;
