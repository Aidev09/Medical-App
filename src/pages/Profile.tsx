
import React, { useState } from 'react';
import PageTransition from '@/components/ui/PageTransition';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { User, BarChart3, Heart, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import DietPlanSection from '@/components/health/DietPlanSection';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileHealthInfo from '@/components/profile/ProfileHealthInfo';
import ProfileQuickActions from '@/components/profile/ProfileQuickActions';
import ProfileActivity from '@/components/profile/ProfileActivity';
import ProfileSettings from '@/components/profile/ProfileSettings';
import ProfileDialogs from '@/components/profile/ProfileDialogs';
import { useProfileData } from '@/hooks/useProfileData';

const personalInfoSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(6, { message: "Please enter a valid phone number." }),
  age: z.string().optional() // Added
});

const healthInfoSchema = z.object({
  bloodType: z.string().min(1, { message: "Please select a blood type." }),
  allergies: z.string().optional(),
  emergencyContact: z.string().min(6, { message: "Please provide an emergency contact." }),
  patientDisease: z.string().optional() // Added
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
  newPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters." })
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Profile = () => {
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const { toast } = useToast();
  
  const {
    username,
    profileImage,
    userData,
    setUserData,
    updateProfileImage,
    updateUsername
  } = useProfileData();

  const handleSavePersonalInfo = (data: z.infer<typeof personalInfoSchema>) => {
    const newUserData = {
      ...userData,
      name: data.name,
      email: data.email,
      phone: data.phone,
      age: typeof data.age === 'number' ? data.age : Number(data.age) || 0 // Always a number
    };
    
    setUserData(newUserData);
    
    if (data.name !== username) {
      updateUsername(data.name);
    }
    
    setOpenDialog(null);
    
    toast({
      title: "Profile updated",
      description: "Your personal information has been saved successfully",
    });
  };

  const handleSaveHealthInfo = (data: z.infer<typeof healthInfoSchema>) => {
    setUserData({
      ...userData,
      healthInfo: {
        bloodType: data.bloodType,
        allergies: data.allergies || "None",
        emergencyContact: data.emergencyContact,
        patientDisease: data.patientDisease // Added
      }
    });
    
    setOpenDialog(null);
    
    toast({
      title: "Health information updated",
      description: "Your health details have been saved successfully",
    });
  };

  const handleChangePassword = (data: z.infer<typeof passwordSchema>) => {
    console.log("Password change requested:", data);
    
    setOpenDialog(null);
    
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully"
    });
  };

  const closeDialog = () => setOpenDialog(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } }
  };

  return (
    <PageTransition className="app-container pb-28">
      <TooltipProvider delayDuration={300}>
        <div className="mb-4 relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-4"
          >
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Your Profile</h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage your account and health information</p>
          </motion.div>

          <motion.div
            className="absolute top-0 right-0 opacity-20 dark:opacity-10"
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 0.95, 1]
            }}
            transition={{ 
              duration: 15, 
              ease: "easeInOut", 
              repeat: Infinity
            }}
          >
            <User className="h-20 w-20 text-primary" />
          </motion.div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg py-1.5">
            <TabsList className="w-full grid grid-cols-4 bg-background/90 border shadow-sm rounded-xl h-10">
              <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs">
                <User className="h-3.5 w-3.5 mr-1.5" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="activity" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs">
                <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="diet" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs">
                <Heart className="h-3.5 w-3.5 mr-1.5" />
                Diet Plans
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs">
                <Settings className="h-3.5 w-3.5 mr-1.5" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="profile" className="space-y-4 mt-4">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Card className="overflow-hidden border shadow-lg bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20 backdrop-blur-sm">
                <CardContent className="p-4 relative">
                  <ProfileHeader
                    userData={userData}
                    profileImage={profileImage}
                    onProfileImageUpdate={updateProfileImage}
                    onEditProfile={() => setOpenDialog('personal')}
                  />

                  <ProfileStats userData={userData} />

                  <ProfileHealthInfo userData={userData} />
                </CardContent>
              </Card>
              
              <ProfileQuickActions onSettingsClick={() => setOpenDialog('settings')} />
            </motion.div>
          </TabsContent>
          
          <TabsContent value="activity">
            <ProfileActivity />
          </TabsContent>
          
          <TabsContent value="diet">
            <motion.div 
              variants={fadeVariants} 
              initial="hidden" 
              animate="visible"
              className="mt-4"
            >
              <DietPlanSection />
            </motion.div>
          </TabsContent>
          
          <TabsContent value="settings">
            <ProfileSettings onMenuItemClick={setOpenDialog} />
          </TabsContent>
        </Tabs>

        <ProfileDialogs
          openDialog={openDialog}
          userData={userData}
          onCloseDialog={closeDialog}
          onSavePersonalInfo={handleSavePersonalInfo}
          onSaveHealthInfo={handleSaveHealthInfo}
          onChangePassword={handleChangePassword}
        />
      </TooltipProvider>
    </PageTransition>
  );
};

export default Profile;
