import React, { useState, useRef, useEffect } from 'react';
import { Send, Heart, Stethoscope, Mic, MicOff, Bot, User, X, Clock, Info, Pill, File, UploadCloud, CheckCircle, MessageCircle, AlertCircle, HelpCircle, Image, Paperclip, Trash2, ChevronDown, Search, Calendar, Activity, Thermometer, Clipboard, PlusCircle, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  attachment?: string;
  attachmentType?: 'image' | 'document';
  isError?: boolean;
  category?: string;
  relatedMessages?: string[];
  reactions?: string[];
}

interface HealthRecord {
  id: string;
  date: Date;
  medicationName: string;
  notes: string;
}

interface MedicineInfo {
  name: string;
  description: string;
  symptoms: string[];
  sideEffects: string[];
  pros: string[];
  cons: string[];
}

const initialMessages: Message[] = [
  {
    id: '1',
    text: "Hello! I'm your health assistant. How can I help you today? You can ask me about health advice or any questions you have.",
    sender: 'bot',
    timestamp: new Date(),
  },
];

// Enhanced medicine database with more detailed information
const medicineDatabase: MedicineInfo[] = [
  {
    name: "Acetaminophen",
    description: "Pain reliever and fever reducer",
    symptoms: ["Fever", "Headache", "Minor pain"],
    sideEffects: ["Liver damage (with high doses)", "Nausea", "Rash"],
    pros: ["Generally safe at recommended doses", "Available over the counter", "Does not cause stomach irritation"],
    cons: ["Can cause liver damage if overused", "Not effective for inflammation", "May interact with alcohol"]
  },
  {
    name: "Ibuprofen",
    description: "Non-steroidal anti-inflammatory drug (NSAID)",
    symptoms: ["Pain", "Inflammation", "Fever"],
    sideEffects: ["Stomach upset", "Heartburn", "Dizziness"],
    pros: ["Reduces inflammation", "Effective for many types of pain", "Works quickly"],
    cons: ["Can cause stomach bleeding", "Not suitable for those with kidney issues", "May increase risk of heart attack with long-term use"]
  },
  {
    name: "Amoxicillin",
    description: "Antibiotic medication",
    symptoms: ["Bacterial infections", "Strep throat", "Ear infections"],
    sideEffects: ["Diarrhea", "Rash", "Nausea"],
    pros: ["Effective against many bacterial infections", "Less likely to cause allergic reactions than penicillin", "Can be taken with food"],
    cons: ["May cause antibiotic resistance if overused", "Not effective against viral infections", "Can disrupt gut bacteria"]
  },
  {
    name: "Loratadine",
    description: "Antihistamine for allergy symptoms",
    symptoms: ["Allergies", "Hay fever", "Hives"],
    sideEffects: ["Headache", "Dry mouth", "Fatigue"],
    pros: ["Non-drowsy", "Once-daily dosing", "Few drug interactions"],
    cons: ["May not be strong enough for severe allergies", "Can take hours to work", "Less effective for nasal congestion"]
  },
  {
    name: "Omeprazole",
    description: "Proton pump inhibitor for acid reflux and ulcers",
    symptoms: ["Heartburn", "Acid reflux", "GERD", "Stomach ulcers"],
    sideEffects: ["Headache", "Nausea", "Vitamin B12 deficiency with long-term use"],
    pros: ["Effective acid reduction", "Once-daily dosing", "Available over the counter"],
    cons: ["May increase risk of bone fractures with long-term use", "Can mask symptoms of more serious conditions", "Potential for drug interactions"]
  }
];

interface ChatInterfaceProps {
  className?: string;
}

const healthTopics = [
  "How to manage stress?",
  "Tips for better sleep",
  "What foods boost immunity?",
  "Common cold remedies"
];

const quickSymptoms = [
  { icon: Thermometer, label: 'Fever', color: 'text-red-500' },
  { icon: Activity, label: 'Headache', color: 'text-purple-500' },
  { icon: Stethoscope, label: 'Cough', color: 'text-blue-500' },
  { icon: Clipboard, label: 'Nausea', color: 'text-green-500' },
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({ className }) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [messageCategories, setMessageCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSymptomPicker, setShowSymptomPicker] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showVitals, setShowVitals] = useState(false);

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = format(message.timestamp, 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  // Generate smart suggestions based on context
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'bot') {
        // Example logic for generating contextual suggestions
        const newSuggestions = [
          "Tell me more about side effects",
          "What's the recommended dosage?",
          "Are there any alternatives?",
          "Schedule a reminder"
        ];
        setSmartSuggestions(newSuggestions);
      }
    }
  }, [messages]);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Hide welcome message after 5 seconds
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleSend = async () => {
    if (!input.trim() && !uploadedFile) return;
    
    let messageText = input.trim();
    let attachment;
    
    if (uploadedFile) {
      attachment = uploadedFile.name;
      messageText = messageText || `Analyzing document: ${uploadedFile.name}`;
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
      attachment: attachment,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setUploadedFile(null);
    setIsTyping(true);
    
    try {
      const response = await getMedicineInfo(input, uploadedFile);
      
      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: response,
          sender: 'bot',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
      }, 1500);
    } catch (error) {
      console.error("Error getting response:", error);
      
      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm sorry, I couldn't process your request at this time. Please try again later.",
          sender: 'bot',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const getMedicineInfo = async (query: string, file: File | null): Promise<string> => {
    try {
      if (file) {
        // Mock file analysis response
        await new Promise(resolve => setTimeout(resolve, 800));
        return "I've analyzed your document. Based on the information provided, I'd recommend discussing these symptoms with your healthcare provider. Remember that this is not a substitute for professional medical advice.";
      }
      
      // Check if the query matches any medicine in our database
      const lowercaseQuery = query.toLowerCase();
      const medicine = medicineDatabase.find(med => 
        med.name.toLowerCase().includes(lowercaseQuery) || 
        med.symptoms.some(symptom => lowercaseQuery.includes(symptom.toLowerCase()))
      );
      
      if (medicine) {
        return `
**${medicine.name}**: ${medicine.description}

**Used for:** ${medicine.symptoms.join(', ')}

**Potential side effects:** ${medicine.sideEffects.join(', ')}

**Pros:**
${medicine.pros.map(pro => `- ${pro}`).join('\n')}

**Cons:**
${medicine.cons.map(con => `- ${con}`).join('\n')}

Remember to consult with a healthcare professional before starting any medication.`;
      }
      
      // If no matching medicine, provide a general response
      const responses = [
        "Based on health guidelines, it's recommended to maintain a balanced diet and regular exercise for this condition.",
        "Many healthcare professionals suggest that adequate hydration and rest can help with these symptoms.",
        "According to medical research, there are several approaches to managing this. First, maintain a healthy lifestyle with regular exercise and a balanced diet. Second, ensure you're getting enough sleep.",
        "I'd recommend consulting with your doctor, but generally this kind of health concern can be addressed with lifestyle changes.",
        "From a healthcare perspective, it's important to note that these symptoms should be monitored closely."
      ];
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return a random response
      return responses[Math.floor(Math.random() * responses.length)] + 
             " Remember to consult with a healthcare professional for personalized medical advice.";
    } catch (error) {
      console.error("Error getting medicine information:", error);
      return "I couldn't find specific information about that. Please consult with a healthcare professional for accurate advice.";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startListening = () => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      toast.error('Speech recognition is not supported in your browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    
    recognitionRef.current.onstart = () => {
      setIsListening(true);
      toast.info('Listening...', { duration: 1000 });
    };
    
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    
    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      toast.error('Error recognizing speech. Please try again.');
      setIsListening(false);
    };
    
    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
    
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSuggestionClick = (topic: string) => {
    setInput(topic);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type. Please upload an image, PDF, or Word document.');
        return;
      }
      
      if (file.size > maxSize) {
        toast.error('File too large. Maximum size is 5MB.');
        return;
      }
      
      setUploadedFile(file);
      toast.success(`File selected: ${file.name}`);
      
      // Preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          // Handle image preview
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  const handleClearFile = () => {
    setUploadedFile(null);
  };

  return (
    <div className={cn("flex flex-col h-full chat-container", className)}>
      <div className="bg-gradient-to-r from-teal-500/90 to-blue-500/90 dark:from-teal-700/80 dark:to-blue-700/80 rounded-t-xl p-4 flex flex-col gap-2 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="relative"
            >
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
              <div className="w-12 h-12 rounded-full bg-white shadow-lg p-1.5">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center relative overflow-hidden">
                  <motion.div
                    animate={{
                      y: [0, -2, 0],
                      rotate: [0, -5, 5, 0]
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="relative z-10"
                  >
                    <Stethoscope className="w-6 h-6 text-blue-500" />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-blue-100 to-transparent"
                    animate={{
                      opacity: [0.5, 0.7, 0.5]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              </div>
            </motion.div>
            <div className="ml-3">
              <h2 className="font-semibold text-white">Dr. Health AI</h2>
              <div className="flex items-center">
                <span className="relative flex h-2 w-2 mr-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                </span>
                <p className="text-xs text-teal-50">Online & Ready to Help</p>
              </div>
            </div>
          </div>
          
                      <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white font-medium flex items-center gap-2 transition-all shadow-lg"
                onClick={() => {
                  toast.success("Opening visit tracker...");
                }}
              >
                <motion.div
                  animate={{
                    rotate: [0, 360]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="relative"
                >
                  <Activity className="h-5 w-5 text-blue-200" />
                </motion.div>
                Track Visits
              </motion.button>
            </div>
        </div>
        
        

        <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {messageCategories.map((category) => (
            <Button
              key={category}
              variant="ghost"
              size="sm"
              className={cn(
                "text-xs text-white/80 hover:text-white border border-white/20 hover:bg-white/20",
                selectedCategory === category && "bg-white/20 text-white"
              )}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-white/95 to-gray-50/95 dark:from-gray-900/95 dark:to-gray-950/95">
        <AnimatePresence>
          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <motion.div
              key={date}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-center my-4">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(date), 'MMMM d, yyyy')}
                </div>
              </div>
              
              {dateMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ 
                    duration: 0.4, 
                    type: "spring", 
                    stiffness: 100,
                    damping: 15
                  }}
                  className={cn(
                    "mb-4 max-w-[85%] md:max-w-[75%]",
                    message.sender === 'user' ? "ml-auto" : "mr-auto"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {message.sender === 'bot' && (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-blue-400 dark:from-teal-600 dark:to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                    )}
                    
                    <div
                      className={cn(
                        "rounded-2xl p-4 shadow-sm group relative",
                        message.sender === 'user'
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-tr-none"
                          : "bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 rounded-tl-none"
                      )}
                    >
                      <div className="absolute -top-8 left-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg">
                        {['👍', '❤️', '🎯', '❓'].map((reaction) => (
                          <button
                            key={reaction}
                            onClick={() => toggleReaction(message.id, reaction)}
                            className="hover:scale-125 transition-transform"
                          >
                            {reaction}
                          </button>
                        ))}
                      </div>
                      
                      <p className="leading-relaxed text-sm md:text-base whitespace-pre-line">{message.text}</p>
                      
                      {message.attachment && (
                        <div className={cn(
                          "mt-2 rounded-md overflow-hidden",
                          message.attachmentType === 'image' ? 'bg-transparent' : 'bg-blue-600/20 dark:bg-blue-900/30 backdrop-blur-sm p-2'
                        )}>
                          {message.attachmentType === 'image' ? (
                            <img 
                              src={message.attachment} 
                              alt="Attached image" 
                              className="max-w-full rounded-md"
                            />
                          ) : (
                            <div className="flex items-center gap-2 text-sm">
                              <File className="h-4 w-4 text-white" />
                              <span className="text-white/90">{message.attachment}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-auto text-white/80 hover:text-white"
                              >
                                <UploadCloud className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="mt-2 flex items-center gap-2">
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/50 rounded-full px-2 py-0.5">
                            {message.reactions.map((reaction) => (
                              <span key={reaction}>{reaction}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {message.sender === 'bot' && (
                        <motion.div 
                          className="flex mt-3"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          <div className="bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded-full flex items-center">
                            <Heart className="h-3 w-3 text-teal-500 dark:text-teal-400 mr-1" />
                            <span className="text-xs text-teal-600 dark:text-teal-400">Medical tip</span>
                          </div>
                        </motion.div>
                      )}
                    </div>
                    
                    {message.sender === 'user' && (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center flex-shrink-0 shadow-md border border-blue-200 dark:border-blue-800/30">
                        <User className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className={cn(
                    "flex items-center text-xs text-muted-foreground mt-1 space-x-2",
                    message.sender === 'user' ? "justify-end mr-12" : "ml-12"
                  )}>
                    <Clock className="h-3 w-3 opacity-70" />
                    <time>
                      {format(message.timestamp, 'h:mm a')}
                    </time>
                    {message.sender === 'bot' && (
                      <CheckCircle className="h-3 w-3 text-teal-500" />
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {smartSuggestions.length > 0 && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 mb-4"
          >
            {smartSuggestions.map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                className="bg-white/50 dark:bg-gray-800/50 border-teal-100 dark:border-teal-800/30 text-xs"
                onClick={() => setInput(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </motion.div>
        )}
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 max-w-[85%] md:max-w-[75%]"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-blue-400 dark:from-teal-600 dark:to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                <Bot className="h-5 w-5 text-white animate-pulse" />
              </div>
              <div className="bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 rounded-2xl rounded-tl-none p-4 shadow-sm">
                <div className="flex space-x-2">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="w-2 h-2 bg-teal-500 dark:bg-teal-400 rounded-full"
                  />
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.2, ease: "easeInOut" }}
                    className="w-2 h-2 bg-teal-500 dark:bg-teal-400 rounded-full"
                  />
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.4, ease: "easeInOut" }}
                    className="w-2 h-2 bg-teal-500 dark:bg-teal-400 rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={endOfMessagesRef} />
      </div>
      
      <div className="border-t p-3 bg-white dark:bg-gray-900 backdrop-blur-sm rounded-b-xl">
        {uploadedFile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center gap-2"
          >
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <Paperclip className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                {uploadedFile.name}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFile}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
        
        <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden pr-1 shadow-sm border border-gray-200 dark:border-gray-700 w-full min-w-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your health concerns..."
            className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 min-w-0 w-full"
          />
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
          
          <div className="flex gap-1 px-1 flex-shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={triggerFileUpload}
                    className="p-2 rounded-full text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  >
                    <UploadCloud className="w-5 h-5" />
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Upload health documents</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={isListening ? stopListening : startListening}
                    className={cn(
                      "p-2 rounded-full",
                      isListening 
                        ? "text-red-500 bg-red-50 dark:bg-red-900/20" 
                        : "text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/30"
                    )}
                  >
                    {isListening ? 
                      <MicOff className="w-5 h-5" /> : 
                      <Mic className="w-5 h-5" />
                    }
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{isListening ? "Stop voice input" : "Start voice input"}</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSend}
                    disabled={!input.trim() && !uploadedFile}
                    className={cn(
                      "p-2.5 rounded-full",
                      (input.trim() || uploadedFile) 
                        ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-sm" 
                        : "text-gray-400 dark:text-gray-600"
                    )}
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Send message</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <div className="flex justify-center mt-2">
          <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            Not a substitute for professional medical advice
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
