
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Edit3, BadgeCheck, Mail, Phone, Calendar, CheckCircle2, Copy, User as UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge as BadgeComponent } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from '@/hooks/use-toast';
import { UserData } from '@/types/profile';

interface ProfileHeaderProps {
  userData: UserData;
  profileImage: string | null;
  onProfileImageUpdate: (imageDataUrl: string) => void;
  onEditProfile: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userData,
  profileImage,
  onProfileImageUpdate,
  onEditProfile
}) => {
  console.log('ProfileHeader userData:', userData);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string;
      onProfileImageUpdate(imageDataUrl);
      toast({
        title: "Profile image updated",
        description: "Your profile picture has been changed successfully"
      });
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: `${label} has been copied to your clipboard.`,
      });
    });
  };

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
      className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6"
      variants={itemVariants}
    >
      <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-end">
        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div className="relative">
              <Avatar className="w-24 h-24 border-3 border-background shadow-xl cursor-pointer hover:border-primary/20 transition-all duration-300" onClick={handleProfileImageClick}>
                {profileImage ? (
                  <AvatarImage src={profileImage} alt={userData.name} />
                ) : (
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    {userData.name.split(' ').map(name => name[0]).join('')}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-white dark:border-gray-900"></div>
            </div>
          </motion.div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md"
                onClick={handleProfileImageClick}
              >
                <Camera className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Update profile picture</p>
            </TooltipContent>
          </Tooltip>
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
        
        <div className="text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-xl font-bold">{userData.name}</h2>
            {typeof userData.age === 'number' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800/50">
                <UserIcon className="h-3 w-3 mr-1 text-blue-400" />
                Age: {userData.age}
              </span>
            )}
            <BadgeComponent variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50 font-normal text-xs px-2 py-0.5 h-5">
              <BadgeCheck className="h-3 w-3 mr-1" />
              Premium
            </BadgeComponent>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-muted-foreground">
            <div className="flex items-center group">
              <p className="text-xs flex items-center">
                <Mail className="h-3 w-3 mr-1 inline" />
                {userData.email}
              </p>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => copyToClipboard(userData.email, 'Email')}
              >
                <Copy className="h-2.5 w-2.5" />
              </Button>
            </div>
            <div className="hidden sm:block h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-700"></div>
            <div className="flex items-center group">
              <p className="text-xs flex items-center">
                <Phone className="h-3 w-3 mr-1 inline" />
                {userData.phone}
              </p>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => copyToClipboard(userData.phone, 'Phone number')}
              >
                <Copy className="h-2.5 w-2.5" />
              </Button>
            </div>
          </div>
          <div className="flex items-center text-[10px] text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            <span className="mr-2">Member since {userData.joinDate}</span>
            <span className="flex items-center text-green-600 dark:text-green-500">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Verified Account
            </span>
          </div>
        </div>
      </div>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            onClick={onEditProfile}
            variant="outline"
            size="sm"
            className="flex gap-2 hover:bg-primary/5 transition-colors shadow-sm border-primary/20"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit Profile
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Edit your personal information</p>
        </TooltipContent>
      </Tooltip>
    </motion.div>
  );
};

export default ProfileHeader;
