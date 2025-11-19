import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, Phone, MapPin, FileText, Bell, AlertTriangle, 
  Heart, Activity, User, Clock, Calendar, ChevronRight,
  Siren, Pill, Hospital, UserCircle2, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const EmergencyPreparedness: React.FC = () => {
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (isEmergencyMode && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (countdown === 0) {
      setIsEmergencyMode(false);
      setCountdown(5);
      toast.success('Emergency services notified');
    }
  }, [isEmergencyMode, countdown]);

  useEffect(() => {
    if (isEmergencyMode) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Could not get your location');
        }
      );
    }
  }, [isEmergencyMode]);

  const handleEmergencyButton = () => {
    setIsEmergencyMode(true);
    toast.warning('Emergency mode activated - Contacting emergency services');
  };

  const emergencyContacts = [
    { name: 'Emergency Services', number: '911', type: 'emergency', icon: Siren },
    { name: 'Primary Doctor', number: '(555) 123-4567', type: 'medical', icon: Hospital },
    { name: 'Emergency Contact', number: '(555) 987-6543', type: 'personal', icon: UserCircle2 }
  ];

  const medicalInfo = [
    { label: 'Blood Type', value: 'A+', icon: Heart },
    { label: 'Allergies', value: 'Penicillin', icon: AlertTriangle },
    { label: 'Conditions', value: 'Asthma', icon: Activity },
    { label: 'Medications', value: 'Albuterol', icon: Pill }
  ];

  return (
    <div className="space-y-6 p-4">
      {/* Emergency Button Section */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30">
          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
              {isEmergencyMode ? (
                <motion.div 
                  key="emergency-active"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4"
                    >
                      <Siren className="h-10 w-10 text-red-600 dark:text-red-400" />
                    </motion.div>
                    <h2 className="text-xl font-semibold text-red-700 dark:text-red-300">
                      Emergency Mode Active
                    </h2>
                    <p className="text-red-600 dark:text-red-400 mt-2">
                      Contacting emergency services in {countdown} seconds...
                    </p>
                  </div>
                  {location && (
                    <div className="bg-white/50 dark:bg-white/5 rounded-lg p-3 flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-red-500" />
                      <div className="text-sm">
                        <p className="font-medium text-red-700 dark:text-red-300">Location Ready</p>
                        <p className="text-red-600/80 dark:text-red-400/80">
                          Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/50"
                    onClick={() => {
                      setIsEmergencyMode(false);
                      setCountdown(5);
                    }}
                  >
                    Cancel Emergency
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="emergency-button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Button
                    size="lg"
                    className="w-full bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white h-16 text-lg font-semibold"
                    onClick={handleEmergencyButton}
                  >
                    <Shield className="h-6 w-6 mr-2" />
                    Emergency SOS
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        {[
          { icon: Phone, label: 'Call Contact', action: () => toast.info('Calling contact...') },
          { icon: MapPin, label: 'Share Location', action: () => toast.info('Sharing location...') },
          { icon: FileText, label: 'Medical ID', action: () => toast.info('Opening Medical ID...') },
          { icon: Bell, label: 'Alert Family', action: () => toast.info('Alerting family...') }
        ].map((action, index) => (
          <TooltipProvider key={action.label}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="h-auto py-6 flex flex-col items-center gap-3 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200"
                  onClick={action.action}
                >
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <action.icon className="h-5 w-5 text-red-500" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Click to {action.label.toLowerCase()}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </motion.div>

      {/* Emergency Contacts */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {emergencyContacts.map((contact, index) => (
              <motion.div
                key={contact.name}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    contact.type === 'emergency' ? 'bg-red-100 dark:bg-red-900/30' :
                    contact.type === 'medical' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    'bg-green-100 dark:bg-green-900/30'
                  }`}>
                    <contact.icon className={`h-4 w-4 ${
                      contact.type === 'emergency' ? 'text-red-500' :
                      contact.type === 'medical' ? 'text-blue-500' :
                      'text-green-500'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{contact.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{contact.number}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Phone className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Medical Info Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              Medical Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {medicalInfo.map((info, index) => (
                <motion.div
                  key={info.label}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <info.icon className="h-4 w-4 text-blue-500" />
                    </div>
                    <span className="text-sm">{info.label}</span>
                  </div>
                  <Badge variant="outline" className="font-medium">
                    {info.value}
                  </Badge>
                </motion.div>
              ))}
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full mt-4 bg-white dark:bg-gray-950"
              >
                <FileText className="h-4 w-4 mr-2" />
                View Full Medical ID
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Emergency Instructions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex-shrink-0">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  In Case of Emergency
                </p>
                <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-3 w-3" />
                    Press the Emergency SOS button for immediate assistance
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-3 w-3" />
                    Stay calm and find a safe location if possible
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-3 w-3" />
                    Emergency services will be contacted automatically
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-3 w-3" />
                    Your location and medical info will be shared
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default EmergencyPreparedness;
