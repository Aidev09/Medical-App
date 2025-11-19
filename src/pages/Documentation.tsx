
import React from 'react';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Database, 
  Zap, 
  Shield, 
  Code, 
  Globe, 
  Heart, 
  Brain,
  Pill,
  Bell,
  FileText,
  User,
  MessageSquare,
  Search,
  Calendar,
  Camera,
  Mic,
  Stethoscope
} from 'lucide-react';

const Documentation: React.FC = () => {
  const apiServices = [
    {
      name: 'FDA Drug Label API',
      description: 'Official FDA database for medication information, warnings, and drug interactions',
      endpoint: 'https://api.fda.gov/drug/label.json',
      features: ['Drug search', 'Safety information', 'Dosage guidelines', 'Interaction warnings'],
      icon: Shield,
      color: 'text-red-600'
    },
    {
      name: 'RxNorm API',
      description: 'Standardized nomenclature for clinical drugs and drug delivery devices',
      endpoint: 'https://rxnav.nlm.nih.gov/REST/',
      features: ['Medication search', 'Drug classification', 'Generic/brand mapping', 'Drug concepts'],
      icon: Search,
      color: 'text-blue-600'
    },
    {
      name: 'Diet Recommendation API',
      description: 'Custom nutrition and diet planning service for health goals',
      endpoint: 'Custom API integration',
      features: ['Personalized meal plans', 'Nutrition tracking', 'Health goal alignment', 'Dietary restrictions'],
      icon: Heart,
      color: 'text-green-600'
    }
  ];

  const appFeatures = [
    {
      category: 'Core Features',
      features: [
        {
          name: 'Medication Management',
          description: 'Add, track, and manage daily medications with visual progress indicators',
          components: ['MedicationCard', 'AddMedication', 'Dashboard'],
          icon: Pill
        },
        {
          name: 'Smart Reminders',
          description: 'Intelligent scheduling system with calendar integration and push notifications',
          components: ['Reminders', 'ScheduleSelector', 'NotificationSlice'],
          icon: Bell
        },
        {
          name: 'Health Records',
          description: 'Comprehensive medical history and health metrics tracking with PDF export',
          components: ['HealthRecords', 'UserMetricsForm', 'MedicalHistorySection'],
          icon: FileText
        },
        {
          name: 'AI Health Assistant',
          description: 'Conversational AI for health questions, medication insights, and document analysis',
          components: ['ChatInterface', 'Chatbot'],
          icon: Brain
        }
      ]
    },
    {
      category: 'Pro Features',
      features: [
        {
          name: 'Camera Symptom Checker',
          description: 'AI-powered visual analysis for skin conditions and physical symptoms',
          components: ['CameraSymptomChecker'],
          icon: Camera
        },
        {
          name: 'Voice Control',
          description: 'Hands-free medication logging with natural language processing',
          components: ['VoiceControlPanel'],
          icon: Mic
        },
        {
          name: 'Emergency Preparedness',
          description: 'Automated emergency alerts and medical ID quick access',
          components: ['EmergencyPreparedness'],
          icon: Shield
        },
        {
          name: 'Telehealth Integration',
          description: 'Doctor matching and prescription management ecosystem',
          components: ['TelehealthEcosystem'],
          icon: Stethoscope
        }
      ]
    }
  ];

  const techStack = [
    { name: 'React 18', purpose: 'Frontend framework for building user interfaces' },
    { name: 'TypeScript', purpose: 'Type-safe JavaScript for better development experience' },
    { name: 'Vite', purpose: 'Fast build tool and development server' },
    { name: 'Tailwind CSS', purpose: 'Utility-first CSS framework for styling' },
    { name: 'Framer Motion', purpose: 'Animation library for smooth transitions' },
    { name: 'React Router', purpose: 'Client-side routing and navigation' },
    { name: 'Redux Toolkit', purpose: 'State management for complex application data' },
    { name: 'TanStack Query', purpose: 'Data fetching, caching, and synchronization' },
    { name: 'shadcn/ui', purpose: 'Pre-built accessible UI components' },
    { name: 'Lucide React', purpose: 'Beautiful SVG icon library' },
    { name: 'Sonner', purpose: 'Toast notifications for user feedback' }
  ];

  return (
    <PageTransition className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <motion.div
              className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg"
              whileHover={{ scale: 1.05, rotate: [0, -3, 3, 0] }}
            >
              <BookOpen className="h-8 w-8 text-white" />
            </motion.div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 mb-4">
            Medico App Documentation
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Comprehensive guide to our AI-powered medication tracking and health management platform
          </p>
        </motion.div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="apis">APIs</TabsTrigger>
            <TabsTrigger value="tech">Tech Stack</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="setup">Setup</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Application Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Medico is a comprehensive medication tracking and health management application designed to help users maintain their health routines through intelligent reminders, AI-powered insights, and seamless health record management.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Primary Goals</h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Improve medication adherence</li>
                      <li>• Provide AI health insights</li>
                      <li>• Streamline health record management</li>
                      <li>• Enable proactive health monitoring</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Key Benefits</h4>
                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <li>• Never miss a medication dose</li>
                      <li>• Get personalized health recommendations</li>
                      <li>• Track health progress over time</li>
                      <li>• Access emergency medical information</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            {appFeatures.map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.features.map((feature, idx) => (
                        <div key={idx} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3">
                            <feature.icon className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                {feature.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {feature.description}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {feature.components.map((component) => (
                                  <Badge key={component} variant="secondary" className="text-xs">
                                    {component}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* APIs Tab */}
          <TabsContent value="apis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  External API Integrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {apiServices.map((api, index) => (
                    <motion.div
                      key={api.name}
                      className="p-6 border rounded-lg hover:shadow-lg transition-all"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start gap-4">
                        <api.icon className={`h-8 w-8 ${api.color} flex-shrink-0`} />
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            {api.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-3">
                            {api.description}
                          </p>
                          <div className="mb-4">
                            <Badge variant="outline" className="text-xs font-mono">
                              {api.endpoint}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {api.features.map((feature) => (
                              <Badge key={feature} className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Implementation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h4 className="font-semibold mb-2">Error Handling & Fallbacks</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    The app implements robust error handling with multiple fallback strategies. When primary API calls fail, 
                    the system automatically tries alternative search methods and provides mock data to ensure uninterrupted user experience.
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h4 className="font-semibold mb-2">Data Caching & Performance</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    TanStack Query manages API responses with intelligent caching, reducing redundant requests and improving app performance. 
                    Search results are cached for 5 minutes, while medication details are cached for 1 hour.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tech Stack Tab */}
          <TabsContent value="tech" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-purple-500" />
                  Technology Stack
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {techStack.map((tech, index) => (
                    <motion.div
                      key={tech.name}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {tech.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {tech.purpose}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Architecture Tab */}
          <TabsContent value="architecture" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-500" />
                  Application Architecture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Frontend Layer</h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• React components</li>
                      <li>• TypeScript interfaces</li>
                      <li>• Responsive design</li>
                      <li>• Animation system</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">State Management</h4>
                    <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                      <li>• Redux Toolkit slices</li>
                      <li>• React Query cache</li>
                      <li>• Local component state</li>
                      <li>• Persistent storage</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">API Integration</h4>
                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <li>• REST API calls</li>
                      <li>• Error handling</li>
                      <li>• Data transformation</li>
                      <li>• Retry mechanisms</li>
                    </ul>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Data Flow Architecture</h4>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-auto">
{`User Interaction → Component → Redux Action → API Service → External API
                                     ↓
User Interface ← Component ← Redux Store ← Data Processing ← API Response`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Development Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h4 className="font-semibold mb-2">Prerequisites</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Node.js (v16 or higher)</li>
                    <li>• npm or yarn package manager</li>
                    <li>• Modern web browser</li>
                    <li>• Code editor (VS Code recommended)</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h4 className="font-semibold mb-2">Installation Steps</h4>
                  <pre className="text-sm bg-gray-800 text-gray-100 p-3 rounded overflow-auto">
{`# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build`}
                  </pre>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h4 className="font-semibold mb-2">Environment Configuration</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    The app currently uses public APIs and doesn't require environment variables for basic functionality.
                    For enhanced features, consider integrating with Supabase for backend services.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
};

export default Documentation;
