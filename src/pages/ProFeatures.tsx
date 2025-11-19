import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Mic, Shield, Dna, Stethoscope, Zap, Crown, Star, CheckCircle, FileText, ArrowRight } from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import { useToast } from '@/hooks/use-toast';
import UpgradeModal from '@/components/pro/UpgradeModal';

const ProFeatures: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  useEffect(() => {
    const state = location.state as { showProFeatureToast?: boolean; feature?: string };
    if (state?.showProFeatureToast) {
      toast({
        title: "Pro Feature Required",
        description: `${state.feature} is a premium feature. Upgrade to Pro to access it.`,
        duration: 5000
      });
      // Clear the state to prevent showing the toast again on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location, toast, navigate]);

  const features = [
    {
      id: 'ai-assistant',
      title: 'AI Assistant',
      icon: Brain,
      gradient: 'from-purple-500 to-pink-500',
      description: 'Smart health analysis and personalized recommendations',
      benefits: ['24/7 Monitoring', 'Predictive Insights', 'Personalized Tips']
    },
    {
      id: 'voice-control',
      title: 'Voice Control',
      icon: Mic,
      gradient: 'from-blue-500 to-cyan-500',
      description: 'Hands-free logging with natural language processing',
      benefits: ['Voice Commands', 'Smart Reminders', 'Quick Logging']
    },
    {
      id: 'emergency',
      title: 'Emergency',
      icon: Shield,
      gradient: 'from-red-500 to-orange-500',
      description: 'Immediate safety systems for critical situations',
      benefits: ['Instant Alerts', 'Medical ID', 'Location Sharing']
    },
    {
      id: 'wellness',
      title: 'Wellness',
      icon: Dna,
      gradient: 'from-indigo-500 to-purple-500',
      description: 'Personalized health insights based on your DNA',
      benefits: ['Genetic Analysis', 'Nutrition Plans', 'Fitness Recommendations']
    },
    {
      id: 'telehealth',
      title: 'Telehealth',
      icon: Stethoscope,
      gradient: 'from-teal-500 to-blue-500',
      description: 'Connect with healthcare professionals remotely',
      benefits: ['Video Consults', 'Records Sync', 'Prescription Renewals']
    },
    {
      id: 'medication-records',
      title: 'Medication Records',
      icon: FileText,
      gradient: 'from-green-500 to-teal-500',
      description: 'Comprehensive medication tracking and history with downloadable reports',
      benefits: ['Medicine tracking', 'Time & dosage logs', 'Downloadable reports', 'Usage history']
    },
    {
      id: 'health-records',
      title: 'Health Records',
      icon: FileText,
      gradient: 'from-emerald-500 to-teal-600',
      description: 'Complete medical history in one secure place',
      benefits: ['Medical History', 'Health Stats', 'Medication Tracking', 'Secure Storage']
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 }
  };

  const handleUpgrade = () => {
    setIsUpgradeModalOpen(true);
  };

  const handleSelectPlan = (plan: 'monthly' | 'biannual' | 'yearly') => {
    // Here you would integrate with your payment provider (e.g., Stripe)
    const prices = {
      monthly: '$9.99/month',
      biannual: '$49.99 for 6 months',
      yearly: '$89.99/year'
    };
    
    toast({
      title: "Coming Soon",
      description: `Payment integration for ${prices[plan]} will be available soon!`,
      duration: 3000
    });
    setIsUpgradeModalOpen(false);
  };

  return (
    <PageTransition className="min-h-screen">
      <div className="max-w-md mx-auto px-4 py-4">
        {/* Mobile-optimized Header */}
        <motion.div 
          className="text-center mb-6 mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex items-center justify-center mb-2">
            <motion.div
              className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 shadow-md"
              animate={{
                rotate: [0, -3, 3, 0],
              }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 4
              }}
            >
              <Crown className="h-5 w-5 text-white" />
            </motion.div>
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mb-1">
            Premium Features
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
            Advanced tools for your health management
          </p>
        </motion.div>

        {/* Mobile Feature Grid - 2 columns */}
        <motion.div
          className="grid grid-cols-2 gap-2 mb-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {features.map((feature) => (
            <motion.div 
              key={feature.id}
              variants={item}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/feature/${feature.id}`)}
              className="cursor-pointer"
            >
              <Card 
                className={cn(
                  "h-full cursor-pointer border border-gray-200 dark:border-gray-800",
                  "bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm",
                  "transition-all duration-200 hover:shadow-sm",
                  "hover:border-purple-300/30"
                )}
              >
                <CardHeader className="pb-1 px-2 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className={`p-1 rounded-md bg-gradient-to-br ${feature.gradient}`}>
                        <feature.icon className="h-3.5 w-3.5 text-white" />
                      </div>
                      <CardTitle className="text-xs font-medium leading-none">
                        {feature.title}
                      </CardTitle>
                    </div>
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-[0.6rem] px-1 py-0 text-white">
                      PRO
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-2 pb-2 pt-0">
                  <p className="text-[0.65rem] text-gray-500 dark:text-gray-400 mb-1 line-clamp-1">
                    {feature.description}
                  </p>
                  <div className="space-y-0.5">
                    {feature.benefits.slice(0, 2).map((benefit, i) => (
                      <div key={i} className="flex items-start gap-1">
                        <CheckCircle className="h-2.5 w-2.5 mt-0.5 flex-shrink-0 text-green-500" />
                        <span className="text-[0.65rem] text-gray-600 dark:text-gray-300 leading-tight line-clamp-1">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-2">
                    <ArrowRight className="h-3.5 w-3.5 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Modify the Upgrade CTA button to use handleUpgrade */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 p-4 rounded-lg border border-purple-100 dark:border-purple-900/50"
        >
          <div className="flex items-start gap-2">
            <Star className="h-4 w-4 text-purple-500 dark:text-purple-300 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-purple-800 dark:text-purple-100 mb-1">
                Unlock All Premium Features
              </h3>
              <p className="text-xs text-purple-600 dark:text-purple-300 mb-2">
                Get full access to all health tools for just $9.99/month
              </p>
              <Button 
                size="sm" 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-xs"
                onClick={handleUpgrade}
              >
                Upgrade Now
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Add the UpgradeModal */}
        <UpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          onSelectPlan={handleSelectPlan}
        />
      </div>
    </PageTransition>
  );
};

export default ProFeatures;