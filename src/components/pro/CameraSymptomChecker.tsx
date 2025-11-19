import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, Brain, Eye, Activity, Scan } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface AnalysisResult {
  condition: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  recommendations: string[];
  needsAttention: boolean;
}

const CameraSymptomChecker: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisType, setAnalysisType] = useState<'rash' | 'eye' | 'general'>('rash');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const analysisTypes = [
    { id: 'rash', label: 'Skin', icon: Activity, color: 'text-red-500' },
    { id: 'eye', label: 'Eye', icon: Eye, color: 'text-blue-500' },
    { id: 'general', label: 'General', icon: Scan, color: 'text-green-500' }
  ];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOpen(true);
      }
    } catch (error) {
      toast.error('Camera access denied. Please enable camera permissions in settings.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setIsCameraOpen(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageDataUrl);
      stopCamera();
      analyzeImage(imageDataUrl);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        setCapturedImage(imageDataUrl);
        analyzeImage(imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockResults: AnalysisResult = {
        condition: analysisType === 'rash' ? 'Possible Contact Dermatitis' : 
                  analysisType === 'eye' ? 'Normal Eye Appearance' : 'Healthy Skin',
        confidence: Math.floor(Math.random() * 30) + 70,
        severity: Math.random() > 0.7 ? 'medium' : 'low',
        recommendations: [
          'Monitor the area for changes',
          'Keep the area clean and dry',
          'Consider consulting a specialist if symptoms persist',
          'Avoid known irritants'
        ],
        needsAttention: Math.random() > 0.8
      };
      
      setAnalysisResult(mockResults);
      setIsAnalyzing(false);
      
      if (mockResults.needsAttention) {
        toast.warning('Medical attention may be needed', {
          description: 'Our analysis suggests you should consult a healthcare professional',
        });
      } else {
        toast.success('Analysis completed', {
          description: 'Check the results below',
        });
      }
    }, 3000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      {/* Analysis Type Selection */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {analysisTypes.map((type) => (
          <Button
            key={type.id}
            variant={analysisType === type.id ? "default" : "outline"}
            onClick={() => setAnalysisType(type.id as any)}
            className="flex flex-col items-center p-2 h-auto min-h-[80px]"
          >
            <type.icon className={`h-5 w-5 mb-1 ${type.color}`} />
            <span className="text-xs font-medium">{type.label}</span>
          </Button>
        ))}
      </div>

      {/* Camera Controls */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Camera className="h-5 w-5" />
            Image Capture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={isCameraOpen ? captureImage : startCamera}
              className="flex-1"
              disabled={isAnalyzing}
              size="sm"
            >
              <Camera className="h-4 w-4 mr-2" />
              {isCameraOpen ? 'Capture' : 'Camera'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Camera Preview */}
          <AnimatePresence>
            {isCameraOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative rounded-lg overflow-hidden bg-black"
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                />
                <Button
                  onClick={stopCamera}
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 rounded-full w-8 h-8 p-0"
                >
                  ×
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Captured Image */}
          {capturedImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-lg overflow-hidden border"
            >
              <img
                src={capturedImage}
                alt="Captured for analysis"
                className="w-full h-64 object-contain bg-gray-100 dark:bg-gray-800"
              />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-white text-center p-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="mx-auto mb-3"
                    >
                      <Brain className="h-8 w-8" />
                    </motion.div>
                    <p className="font-medium">Analyzing image...</p>
                    <p className="text-sm text-white/80 mt-1">This may take a few seconds</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-lg">
                    <Brain className="h-5 w-5 text-blue-500" />
                    Results
                  </span>
                  <Badge className={`${getSeverityColor(analysisResult.severity)} text-xs`}>
                    {analysisResult.severity.toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-base">{analysisResult.condition}</h3>
                  <p className="text-sm text-muted-foreground">
                    Confidence: {analysisResult.confidence}%
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2 text-sm">Recommendations:</h4>
                  <ul className="space-y-2">
                    {analysisResult.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                        <span className="flex-1">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {analysisResult.needsAttention && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
                      <span className="text-yellow-500">⚠️</span>
                      <span>Our analysis suggests you may want to consult with a healthcare professional about this.</span>
                    </p>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-xs text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <strong>Note:</strong> This AI analysis is for informational purposes only and not a substitute for professional medical advice.
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraSymptomChecker;