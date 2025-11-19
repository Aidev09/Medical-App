import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, PlusCircle, Bell, MessageSquare, User, Crown, 
  Pill, Search, Shield, Calendar, Heart, FileText,
  Camera, Mic, Zap, Dna, Stethoscope, Brain,
  ArrowRight, Sparkles, Star
} from 'lucide-react';

const AppFeatures: React.FC = () => {
  const coreFeatures = [
    {
      icon: Home,
      title: 'Smart Dashboard',
      description: 'Personalized health overview with real-time medication tracking, health metrics, and daily insights.',
      features: ['Medication overview', 'Health metrics', 'Daily tips', 'Quick actions'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: PlusCircle,
      title: 'Medication Management',
      description: 'Easy medication adding with comprehensive drug database and intelligent scheduling.',
      features: ['Drug database search', 'Smart scheduling', 'Dosage tracking', 'Pharmacy integration'],
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Bell,
      title: 'Smart Reminders',
      description: 'Intelligent reminder system that adapts to your schedule and ensures medication adherence.',
      features: ['Adaptive scheduling', 'Snooze options', 'Adherence tracking', 'Family notifications'],
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: MessageSquare,
      title: 'AI Health Assistant',
      description: 'Conversational AI that provides health guidance, medication information, and emergency support.',
      features: ['Natural conversations', 'Medication info', 'Health guidance', 'Emergency assistance'],
      color: 'from-teal-500 to-blue-500'
    },
    {
      icon: FileText,
      title: 'Health Records',
      description: 'Comprehensive health record management with secure storage and easy sharing capabilities.',
      features: ['Medical history', 'Lab results', 'Doctor notes', 'Secure sharing'],
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: User,
      title: 'Personal Profile',
      description: 'Detailed user profile with health metrics, goals, and personalized insights.',
      features: ['Health metrics', 'Personal goals', 'Progress tracking', 'Family profiles'],
      color: 'from-pink-500 to-rose-500'
    }
  ];

  const proFeatures = [
    {
      icon: Brain,
      title: 'AI Health Analysis',
      description: 'Advanced AI-powered symptom checking and health analysis using computer vision.',
      features: ['Visual symptom analysis', 'AI diagnostics', 'Predictive insights', 'Health scoring'],
      color: 'from-purple-500 to-pink-500',
      isPro: true
    },
    {
      icon: Mic,
      title: 'Voice Control',
      description: 'Hands-free medication logging and health tracking through voice commands.',
      features: ['Voice logging', 'Natural language', 'Hands-free operation', 'Smart recognition'],
      color: 'from-blue-500 to-cyan-500',
      isPro: true
    },
    {
      icon: Shield,
      title: 'Emergency System',
      description: 'Comprehensive emergency preparedness with automated alerts and emergency contacts.',
      features: ['Emergency alerts', 'Contact management', 'Medical ID', 'Location services'],
      color: 'from-red-500 to-orange-500',
      isPro: true
    },
    {
      icon: Dna,
      title: 'Personalized Wellness',
      description: 'DNA-based health insights with personalized wellness and nutrition recommendations.',
      features: ['Genetic insights', 'Custom plans', 'Nutrition guidance', 'Lifestyle tips'],
      color: 'from-indigo-500 to-purple-500',
      isPro: true
    },
    {
      icon: Stethoscope,
      title: 'Telehealth Integration',
      description: 'Seamless telehealth services with doctor matching and prescription management.',
      features: ['Doctor matching', 'Video calls', 'Prescription sync', 'Appointment booking'],
      color: 'from-teal-500 to-blue-500',
      isPro: true
    }
  ];

  const additionalFeatures = [
    {
      icon: Search,
      title: 'Drug Interaction Checker',
      description: 'Advanced drug interaction detection and safety warnings.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Intelligent medication scheduling that adapts to your lifestyle.',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: Heart,
      title: 'Health Monitoring',
      description: 'Continuous health metric tracking and trend analysis.',
      color: 'from-pink-500 to-red-500'
    },
    {
      icon: Camera,
      title: 'Pill Recognition',
      description: 'AI-powered pill identification through camera scanning.',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <PageTransition className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-teal-600 mb-4">
            Complete Health Management
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Discover how our comprehensive health management platform helps you take control of your wellness journey with cutting-edge AI technology and intuitive design.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link to="/pro-features">
              <Button size="lg" variant="outline" className="border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-950">
                <Crown className="h-4 w-4 mr-2" />
                Explore Pro Features
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Core Features */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
            Core Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {feature.features.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Pro Features */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
              Pro Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Advanced AI-powered features for professionals and power users
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="h-full bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg relative`}>
                        <feature.icon className="h-6 w-6 text-white" />
                        <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400" />
                      </div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1">
                          PRO
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {feature.features.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Crown className="h-3 w-3 text-purple-500" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Additional Features */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
            Additional Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="text-center p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 hover:shadow-lg transition-all duration-300">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="text-center mt-16 p-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-200/50 dark:border-purple-800/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Ready to Transform Your Health Management?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Join thousands of users who have already revolutionized their health journey with our comprehensive platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                Get Started Today
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link to="/pro-features">
              <Button size="lg" variant="outline">
                Explore Pro Features
                <Crown className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.section>
      </div>
    </PageTransition>
  );
};

export default AppFeatures;
