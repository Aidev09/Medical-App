import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Brain, Mic, Shield, Dna, Stethoscope, FileText } from 'lucide-react';
import CameraSymptomChecker from '@/components/pro/CameraSymptomChecker';
import VoiceControlPanel from '@/components/pro/VoiceControlPanel';
import EmergencyPreparedness from '@/components/pro/EmergencyPreparedness';
import PersonalizedWellness from '@/components/pro/PersonalizedWellness';
import TelehealthEcosystem from '@/components/pro/TelehealthEcosystem';
import HealthRecordsComponent from '@/components/pro/HealthRecordsComponent';
import MedicationRecordsComponent from '@/components/pro/MedicationRecordsComponent';

const FeatureDetail: React.FC = () => {
  const { featureId } = useParams<{ featureId: string }>();

  const features = {
    'ai-assistant': {
      title: 'AI Health Assistant',
      icon: Brain,
      gradient: 'from-purple-500 to-pink-500',
      description: 'Advanced AI-powered health analysis with computer vision and machine learning',
      component: CameraSymptomChecker,
      benefits: [
        'Real-time symptom analysis through camera',
        'AI-powered health insights',
        '24/7 monitoring capabilities',
        'Predictive health analytics',
        'Personalized recommendations'
      ]
    },
    'voice-control': {
      title: 'Voice Control',
      icon: Mic,
      gradient: 'from-blue-500 to-cyan-500',
      description: 'Hands-free voice commands for easy app control',
      component: VoiceControlPanel,
      benefits: [
        'Voice command support',
        'Natural language processing',
        'Quick actions'
      ]
    },
    'emergency': {
      title: 'Emergency',
      icon: Shield,
      gradient: 'from-red-500 to-orange-500',
      description: 'Quick access to emergency features and contacts',
      component: EmergencyPreparedness,
      benefits: [
        'One-tap emergency calls',
        'Location sharing',
        'Medical info access'
      ]
    },
    'wellness': {
      title: 'Wellness',
      icon: Dna,
      gradient: 'from-indigo-500 to-purple-500',
      description: 'Personalized wellness optimization',
      component: PersonalizedWellness,
      benefits: [
        'Custom health plans',
        'Progress tracking',
        'Wellness insights'
      ]
    },
    'telehealth': {
      title: 'Telehealth',
      icon: Stethoscope,
      gradient: 'from-teal-500 to-blue-500',
      description: 'Connect with healthcare professionals remotely',
      component: TelehealthEcosystem,
      benefits: [
        'Video consultations',
        'Secure messaging',
        'Digital prescriptions'
      ]
    },
    'medication-records': {
      title: 'Medication Records',
      icon: FileText,
      gradient: 'from-green-500 to-teal-500',
      description: 'Track and manage your medication history with detailed records',
      component: MedicationRecordsComponent,
      benefits: [
        'Detailed medication tracking',
        'Time and dosage logging',
        'Downloadable reports',
        'Usage history and analytics',
        'Medication reminders'
      ]
    },
    'health-records': {
      title: 'Health Records',
      icon: FileText,
      gradient: 'from-emerald-500 to-teal-600',
      description: 'Secure health records management',
      component: HealthRecordsComponent,
      benefits: [
        'Digital records',
        'Easy sharing',
        'Data security'
      ]
    }
  };

  const feature = features[featureId as keyof typeof features];
  const FeatureComponent = feature?.component;

  if (!feature || !FeatureComponent) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
          <div className="w-full max-w-[320px] text-center space-y-3 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
            <h2 className="text-base font-semibold">Feature Not Found</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This feature isn't available
            </p>
            <Button asChild size="sm" className="w-full">
              <Link to="/pro-features">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-[420px] mx-auto px-4">
          {/* Header with adjusted spacing */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 pt-4"
          >
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-gray-600 dark:text-gray-400 hover:bg-transparent"
              >
                <Link to="/pro-features">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Link>
              </Button>
              <Badge className={`bg-gradient-to-r ${feature.gradient} text-white text-xs px-2 py-0.5`}>
                Pro Feature
              </Badge>
            </div>

            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${feature.gradient}`}>
                <feature.icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {feature.title}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {feature.benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
                >
                  <div className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${feature.gradient}`} />
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {benefit}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Feature Content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <FeatureComponent />
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default FeatureDetail;