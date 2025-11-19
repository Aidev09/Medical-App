import React, { useState } from 'react';
import PageTransition from '@/components/ui/PageTransition';
import ChatInterface from '@/components/chatbot/ChatInterface';
import { motion } from 'framer-motion';
import { Sparkles, Bot, Brain, Upload, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Chatbot = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    setIsUploading(true);

    // Simulate upload delay
    setTimeout(() => {
      const fileNames = Array.from(event.target.files || []).map(file => file.name);
      setUploadedFiles(prev => [...prev, ...fileNames]);
      setIsUploading(false);
      toast.success("Files uploaded successfully!");
    }, 1000);
  };

  return (
    <PageTransition className="min-h-[calc(100vh-4rem)] flex flex-col app-container pb-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-4 relative max-w-5xl mx-auto w-full px-4"
      >
        <h1 className="page-title text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 mb-2">
          Medico Assistant
        </h1>
        <div className="flex justify-center">
          <p className="page-subtitle text-base max-w-lg text-gray-600 dark:text-gray-300">
            Get personalized answers to your health questions and medication management assistance
          </p>
        </div>

        {/* Decorative elements */}
        <motion.div 
          className="absolute -top-10 -left-4 text-blue-300/30 dark:text-blue-700/20" 
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{
            repeat: Infinity,
            duration: 10,
            ease: "easeInOut"
          }}
        >
          <Sparkles size={40} />
        </motion.div>
        
        <motion.div 
          className="absolute top-0 right-10 text-cyan-300/30 dark:text-cyan-700/20"
          animate={{
            rotate: [0, -15, 15, 0],
            scale: [1, 0.9, 1.1, 1]
          }}
          transition={{
            repeat: Infinity,
            duration: 12,
            ease: "easeInOut",
            delay: 1
          }}
        >
          <Bot size={32} />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-0 right-0 text-teal-300/30 dark:text-teal-700/20"
          animate={{
            rotate: [0, 15, -5, 0],
            scale: [1, 1.05, 0.95, 1]
          }}
          transition={{
            repeat: Infinity,
            duration: 8,
            ease: "easeInOut",
            delay: 2
          }}
        >
          <Brain size={28} />
        </motion.div>
      </motion.div>
      
      <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-panel overflow-hidden rounded-2xl shadow-lg border border-blue-100 dark:border-blue-900/20 flex-grow bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/20 min-h-[70vh]"
        >
          <ChatInterface className="h-full flex flex-col" />
        </motion.div>
        
        {/* Enhanced Feature badges */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{
              y: -3,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
            className="bg-cyan-50 dark:bg-cyan-950/30 p-3 rounded-xl border border-cyan-100 dark:border-cyan-900/20 flex flex-col items-center text-center"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-2 shadow-inner">
              <Bot size={18} />
            </div>
            <p className="text-xs font-medium text-cyan-700 dark:text-cyan-400">AI-Powered Advice</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{
              y: -3,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
            className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-xl border border-blue-100 dark:border-blue-900/20 flex flex-col items-center text-center"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2 shadow-inner">
              <Brain size={18} />
            </div>
            <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Medication Insights</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{
              y: -3,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
            className="bg-teal-50 dark:bg-teal-950/30 p-3 rounded-xl border border-teal-100 dark:border-teal-900/20 flex flex-col items-center text-center"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/30 dark:to-teal-800/30 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-2 shadow-inner">
              <Upload size={18} />
            </div>
            <p className="text-xs font-medium text-teal-700 dark:text-teal-400">Document Analysis</p>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Chatbot;