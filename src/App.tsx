import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { AnimatePresence } from 'framer-motion';
import { MedicationProvider } from './MedicationContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Import pages
import Index from './pages/Index';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import AddMedication from './pages/AddMedication';
import MedicineSearch from './pages/MedicineSearch';
import Reminders from './pages/Reminders';
import Profile from './pages/Profile';
import Chatbot from './pages/Chatbot';
import DrugInteractionChecker from './pages/DrugInteractionChecker';
import ProFeatures from './pages/ProFeatures';
import FeatureDetail from './pages/FeatureDetail';
import AppFeatures from './pages/AppFeatures';
import Documentation from './pages/Documentation';
import NotFound from './pages/NotFound';

// Import components
import AuthGuard from './components/auth/AuthGuard';
import BottomNav from './components/layout/BottomNav';
import Navbar from './components/layout/Navbar';

const queryClient = new QueryClient();

function App() {
  return (
    <GoogleOAuthProvider clientId="127657962044-pcelhg51fu4ehrn17377e143nhk3qqh5.apps.googleusercontent.com">
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
            <TooltipProvider>
              <MedicationProvider>
                <Router>
                  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                    <Navbar themeToggle={null} />
                    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-4 pb-24 sm:pb-20">
                      <div className="w-full max-w-3xl mx-auto">
                        <AnimatePresence mode="wait">
                          <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/auth" element={<Auth />} />
                            <Route path="/features" element={<AppFeatures />} />
                            <Route path="/documentation" element={<Documentation />} />
                            <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
                            <Route path="/add-medication" element={<AuthGuard><AddMedication /></AuthGuard>} />
                            <Route path="/medicine-search" element={<AuthGuard><MedicineSearch /></AuthGuard>} />
                            <Route path="/reminders" element={<AuthGuard><Reminders /></AuthGuard>} />
                            <Route path="/health-records" element={<AuthGuard><Navigate to="/pro-features" replace state={{ showProFeatureToast: true, feature: 'Health Records' }} /></AuthGuard>} />
                            <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
                            <Route path="/chatbot" element={<AuthGuard><Chatbot /></AuthGuard>} />
                            <Route path="/drug-interaction" element={<AuthGuard><DrugInteractionChecker /></AuthGuard>} />
                            <Route path="/pro-features" element={<AuthGuard><ProFeatures /></AuthGuard>} />
                            <Route path="/feature/:featureId" element={<AuthGuard><FeatureDetail /></AuthGuard>} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </AnimatePresence>
                      </div>
                    </div>
                    <BottomNav />
                    <Toaster position="top-center" />
                  </div>
                </Router>
              </MedicationProvider>
            </TooltipProvider>
          </NextThemesProvider>
        </QueryClientProvider>
      </Provider>
    </GoogleOAuthProvider>
  );
}

export default App;
