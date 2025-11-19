import React, { useState, useEffect } from 'react';
import PageTransition from '@/components/ui/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, MessageSquare, PhoneCall, Check, Clock, Calendar,
  Shield, ArrowRight, AlertCircle, Smartphone, Wifi,
  Sun, Moon, Sunset, Sunrise, PlayCircle, Settings,
  ChevronRight, ChevronDown, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateReminderSettings } from '@/store/slices/settingsSlice';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const Reminders = () => {
  const dispatch = useAppDispatch();
  const { reminderSettings } = useAppSelector((state) => state.settings);
  const [activeTab, setActiveTab] = useState('methods');
  const [showConnectionGuide, setShowConnectionGuide] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState(reminderSettings.phoneNumber || '');
  const [phoneInput, setPhoneInput] = useState(reminderSettings.phoneNumber || '');
  const [isValid, setIsValid] = useState(false);
  const [touched, setTouched] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Basic phone validation: must be 10-15 digits, can start with +
    setIsValid(/^\+?\d{10,15}$/.test(phoneInput));
    setSaved(phoneInput === phoneNumber && !!phoneNumber);
  }, [phoneInput, phoneNumber]);
  
  // Enhanced reminder methods with connection status and setup steps
  const reminderMethods = [
    {
      id: 'push',
      icon: Bell,
      title: 'Push Notification',
      description: 'Get reminders on your phone or tablet',
      isConnected: true,
      setupSteps: [
        'Enable notifications in your browser',
        'Allow notifications on your device',
        'Keep the app running in background'
      ],
      deviceIcon: Smartphone,
      benefits: ['Instant delivery', 'Works offline', 'Interactive actions']
    },
    {
      id: 'sms',
      icon: MessageSquare,
      title: 'SMS',
      description: 'Receive text message reminders',
      isConnected: false,
      setupSteps: [
        'Verify your phone number',
        'Choose message format',
        'Set delivery preferences'
      ],
      deviceIcon: PhoneCall,
      benefits: ['No internet needed', 'Works on any phone', 'Quick response']
    },
    {
      id: 'whatsapp',
      icon: PhoneCall,
      title: 'WhatsApp',
      description: 'Get reminders via WhatsApp messenger',
      isConnected: false,
      setupSteps: [
        'Connect WhatsApp account',
        'Allow messages from app',
        'Choose notification style'
      ],
      deviceIcon: Wifi,
      benefits: ['Rich media support', 'Group notifications', 'End-to-end encrypted']
    }
  ];

  // Time periods for reminder grouping
  const timePeriods = [
    { id: 'morning', icon: Sunrise, label: 'Morning', time: '6:00 AM - 11:59 AM' },
    { id: 'afternoon', icon: Sun, label: 'Afternoon', time: '12:00 PM - 4:59 PM' },
    { id: 'evening', icon: Sunset, label: 'Evening', time: '5:00 PM - 8:59 PM' },
    { id: 'night', icon: Moon, label: 'Night', time: '9:00 PM - 5:59 AM' }
  ];

  const toggleMethod = (id: string) => {
    const enabledMethods = reminderSettings.enabledMethods.includes(id)
      ? reminderSettings.enabledMethods.filter(m => m !== id)
      : [...reminderSettings.enabledMethods, id];
    
    dispatch(updateReminderSettings({ enabledMethods }));
  };

  const handleSave = () => {
    toast.success("Reminder settings saved successfully", {
      description: "Your preferences have been updated",
      icon: <Check className="h-5 w-5 text-green-500" />
    });
  };

  const handleBeforeTimeChange = (value: string) => {
    dispatch(updateReminderSettings({ beforeTime: value }));
  };

  const handleQuietHoursStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateReminderSettings({ quietHoursStart: e.target.value }));
  };

  const handleQuietHoursEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateReminderSettings({ quietHoursEnd: e.target.value }));
  };

  const handleSavePhoneNumber = () => {
    if (!isValid) {
      toast.error('Please enter a valid phone number.');
      return;
    }
    dispatch(updateReminderSettings({ phoneNumber: phoneInput }));
    setPhoneNumber(phoneInput);
    setSaved(true);
    toast.success('Phone number saved!');
  };

  const sendTestNotification = (methodId: string) => {
    const method = reminderMethods.find(m => m.id === methodId);
    toast.success(`Test notification sent via ${method?.title}`, {
      description: "Check your device to confirm delivery",
      icon: <Check className="h-5 w-5 text-green-500" />
    });
  };

  return (
    <PageTransition className="app-container pb-20">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-full bg-primary/10">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
            Reminder Settings
          </h1>
        </div>
        <p className="text-muted-foreground text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Customize how and when you receive medication reminders
        </p>
      </div>

      {/* Phone Number Section */}
      <Card className="mb-6 border-primary/30 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <PhoneCall className="h-5 w-5 text-primary" />
            Phone Number for SMS/WhatsApp
          </h3>
          <label htmlFor="reminder-phone" className="block text-sm font-medium text-muted-foreground mb-1">
            Enter your phone number
          </label>
          <div className="flex flex-col items-center gap-3 w-full">
            <input
              id="reminder-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              pattern="^\\+?\\d{10,15}$"
              value={phoneInput}
              onChange={e => { setPhoneInput(e.target.value); setTouched(true); setSaved(false); }}
              placeholder="e.g. +12345678901"
              className={`w-full sm:w-64 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${isValid || !touched ? 'border-border focus:ring-primary/20' : 'border-red-400 focus:ring-red-200'}`}
              aria-invalid={!isValid && touched}
              aria-describedby="reminder-phone-helper"
            />
            <Button
              variant="outline"
              onClick={handleSavePhoneNumber}
              className="w-full sm:w-64"
              disabled={!isValid || saved || phoneInput === phoneNumber}
            >
              {saved ? 'Saved' : 'Save Number'}
            </Button>
            {isValid && saved && (
              <span className="flex items-center gap-1 text-green-600 text-xs font-medium mt-1">
                <Check className="h-4 w-4" /> Verified
              </span>
            )}
          </div>
          <div id="reminder-phone-helper" className="mt-1 text-xs text-muted-foreground text-center">
            We'll use this number to send you SMS or WhatsApp reminders. Format: +CountryCodeNumber (e.g. +12345678901)
          </div>
          {!isValid && touched && (
            <div className="mt-1 text-xs text-red-500 text-center">Please enter a valid phone number (10-15 digits, numbers only, may start with +).</div>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="methods" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notification Methods
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule & Timing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="methods" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                {reminderMethods.map((method) => (
                  <div key={method.id} className="space-y-4">
                    <motion.div
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleMethod(method.id)}
                      className={`p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between w-full cursor-pointer border transition-all ${
                        reminderSettings.enabledMethods.includes(method.id)
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:bg-secondary/30'
                      }`}
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          reminderSettings.enabledMethods.includes(method.id)
                            ? 'bg-primary/10 text-primary'
                            : 'bg-secondary text-muted-foreground'
                        }`}>
                          <method.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{method.title}</h3>
                            {method.isConnected && (
                              <Badge variant="secondary" className="text-xs">
                                Connected
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-2 sm:mt-0 w-full sm:w-auto justify-end">
                        {reminderSettings.enabledMethods.includes(method.id) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              sendTestNotification(method.id);
                            }}
                          >
                            <PlayCircle className="h-4 w-4 mr-1" />
                            Test
                          </Button>
                        )}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          reminderSettings.enabledMethods.includes(method.id) ? 'bg-primary' : 'bg-secondary'
                        }`}>
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </motion.div>

                    {reminderSettings.enabledMethods.includes(method.id) && !method.isConnected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 py-3 rounded-lg bg-secondary/30 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Settings className="h-4 w-4" />
                            Setup Required
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowConnectionGuide(showConnectionGuide === method.id ? null : method.id)}
                            className="text-xs"
                          >
                            View Steps
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    <AnimatePresence>
                      {showConnectionGuide === method.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 px-4 py-3 rounded-lg bg-secondary/30"
                        >
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Setup Steps:</h4>
                            {method.setupSteps.map((step, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs">
                                  {index + 1}
                                </div>
                                {step}
                              </div>
                            ))}
                          </div>
                          <div>
                            <h4 className="font-medium text-sm mb-2">Benefits:</h4>
                            <div className="grid grid-cols-3 gap-2">
                              {method.benefits.map((benefit, index) => (
                                <div
                                  key={index}
                                  className="text-xs text-muted-foreground bg-background p-2 rounded flex items-center gap-1"
                                >
                                  <Zap className="h-3 w-3 text-primary" />
                                  {benefit}
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-primary" />
                    Reminder Timing
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        When should we remind you?
                      </label>
                      <Select
                        value={reminderSettings.beforeTime}
                        onValueChange={handleBeforeTimeChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timing" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">At the scheduled time</SelectItem>
                          <SelectItem value="5">5 minutes before</SelectItem>
                          <SelectItem value="10">10 minutes before</SelectItem>
                          <SelectItem value="15">15 minutes before</SelectItem>
                          <SelectItem value="30">30 minutes before</SelectItem>
                          <SelectItem value="60">1 hour before</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {timePeriods.map((period) => (
                        <div
                          key={period.id}
                          className="p-4 rounded-xl border bg-secondary/10 space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <period.icon className="h-5 w-5 text-primary" />
                            <h4 className="font-medium">{period.label}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{period.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Quiet Hours
                  </h3>
                  
                  <p className="text-sm text-muted-foreground">
                    During these hours, you'll only receive critical reminders
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">From</label>
                      <input
                        type="time"
                        value={reminderSettings.quietHoursStart}
                        onChange={handleQuietHoursStartChange}
                        className="w-full px-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">To</label>
                      <input
                        type="time"
                        value={reminderSettings.quietHoursEnd}
                        onChange={handleQuietHoursEndChange}
                        className="w-full px-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Smart Quiet Hours
                      </h4>
                      <p className="text-sm text-blue-600/80 dark:text-blue-400/80 mt-1">
                        We'll automatically adjust quiet hours based on your sleep schedule and medication timing
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <motion.button
          whileTap={{ scale: 0.98 }}
          whileHover={{
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            y: -2
          }}
          onClick={handleSave}
          className="w-full py-4 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl font-medium transition-all shadow-md flex items-center justify-center gap-2"
        >
          <Check className="h-5 w-5" />
          Save Reminder Settings
        </motion.button>
      </div>
    </PageTransition>
  );
};

export default Reminders;
