import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Activity, Volume2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const VoiceControlPanel: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [commandStatus, setCommandStatus] = useState<'success' | 'error' | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.toLowerCase();
        setTranscript(command);
        setConfidence(event.results[last][0].confidence * 100);
        processCommand(command);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Voice recognition error. Please try again.');
      };

      return () => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      };
    } else {
      toast.error('Speech recognition is not supported in your browser.');
    }
  }, []);

  const processCommand = (command: string) => {
    setLastCommand(command);
    
    // Example command processing
    if (command.includes('add medication') || command.includes('take medication')) {
      setCommandStatus('success');
      toast.success('Adding medication...');
    } else if (command.includes('set reminder') || command.includes('remind me')) {
      setCommandStatus('success');
      toast.success('Setting reminder...');
    } else if (command.includes('check schedule') || command.includes('show schedule')) {
      setCommandStatus('success');
      toast.success('Checking schedule...');
    } else {
      setCommandStatus('error');
      toast.error('Command not recognized. Please try again.');
    }
  };

  const toggleListening = () => {
    if (!isListening) {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        toast.success('Voice control activated');
      } catch (error) {
        console.error('Error starting recognition:', error);
        toast.error('Failed to start voice recognition');
      }
    } else {
      recognitionRef.current?.stop();
      setIsListening(false);
      toast.success('Voice control deactivated');
    }
  };

  return (
    <div className="p-4">
      <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mic className="h-5 w-5 text-blue-500" />
            Voice Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Voice Control Button */}
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleListening}
                className={`relative p-8 rounded-full ${
                  isListening 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}
              >
                {isListening ? (
                  <Mic className="h-8 w-8" />
                ) : (
                  <MicOff className="h-8 w-8" />
                )}
                
                {/* Ripple Effect when listening */}
                <AnimatePresence>
                  {isListening && (
                    <motion.div
                      initial={{ scale: 1, opacity: 1 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      exit={{ scale: 1, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute inset-0 rounded-full border-2 border-blue-500"
                    />
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Voice Feedback */}
            <div className="space-y-3">
              {isListening && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-2"
                >
                  <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    Listening...
                  </span>
                  <Volume2 className="h-4 w-4 text-blue-500" />
                </motion.div>
              )}

              {/* Transcript Display */}
              {transcript && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                    {transcript}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      Confidence: {confidence.toFixed(1)}%
                    </Badge>
                    {commandStatus && (
                      <span>
                        {commandStatus === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Command Examples */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Example Commands
              </h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  "Add medication [name] at [time]"
                </div>
                <div className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  "Set reminder for [medication] tomorrow"
                </div>
                <div className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  "Check my medication schedule"
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceControlPanel;
