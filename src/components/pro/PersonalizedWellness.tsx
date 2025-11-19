import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dna, Utensils, Activity, Brain, Heart, Upload, ChevronRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

interface HealthInsight {
  category: string;
  score: number;
  recommendations: string[];
  icon: any;
  color: string;
}

const PersonalizedWellness: React.FC = () => {
  const [dnaFileUploaded, setDnaFileUploaded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<HealthInsight[]>([
    {
      category: 'Nutrition',
      score: 78,
      recommendations: [
        'Increase omega-3 fatty acid intake',
        'Consider vitamin D supplementation',
        'Reduce processed carbohydrates'
      ],
      icon: Utensils,
      color: 'text-green-500'
    },
    {
      category: 'Fitness',
      score: 85,
      recommendations: [
        'Focus on high-intensity interval training',
        'Include more strength training',
        'Maintain current cardio routine'
      ],
      icon: Activity,
      color: 'text-blue-500'
    },
    {
      category: 'Cognitive Health',
      score: 92,
      recommendations: [
        'Practice mindfulness meditation',
        'Engage in brain training exercises',
        'Maintain social connections'
      ],
      icon: Brain,
      color: 'text-purple-500'
    },
    {
      category: 'Heart Health',
      score: 88,
      recommendations: [
        'Maintain current exercise routine',
        'Consider adding more leafy greens',
        'Monitor blood pressure regularly'
      ],
      icon: Heart,
      color: 'text-red-500'
    }
  ]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsAnalyzing(true);
      // Simulate DNA analysis
      setTimeout(() => {
        setDnaFileUploaded(true);
        setIsAnalyzing(false);
        toast.success('DNA analysis completed successfully');
      }, 3000);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-4 space-y-6">
      {/* DNA Upload Section */}
      <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Dna className="h-5 w-5 text-purple-500" />
            DNA-Based Health Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!dnaFileUploaded ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".dna,.txt,.csv"
                  />
                  <Button
                    variant="outline"
                    className="w-40 h-40 rounded-full flex flex-col items-center justify-center gap-2 border-dashed"
                  >
                    <Upload className="h-8 w-8 text-purple-500" />
                    <span className="text-sm">Upload DNA Data</span>
                  </Button>
                </motion.div>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload your DNA data from any major testing provider
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Analysis Status</span>
                <Badge variant="success" className="bg-green-500">
                  Complete
                </Badge>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Your DNA data has been analyzed and personalized recommendations are ready.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health Insights */}
      {dnaFileUploaded && (
            <div className="space-y-4">
          {insights.map((insight, index) => (
                <motion.div
              key={insight.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <insight.icon className={`h-5 w-5 ${insight.color}`} />
                      <CardTitle className="text-base">
                        {insight.category}
                        </CardTitle>
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {insight.score}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                  <Progress value={insight.score} className={getScoreColor(insight.score)} />
                  
                  <div className="space-y-2">
                    {insight.recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-sm"
                      >
                        <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-purple-500" />
                        <span>{rec}</span>
                      </div>
                    ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardContent className="py-6">
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="h-5 w-5 text-purple-500 animate-pulse" />
              <span className="text-sm font-medium">Analyzing DNA Data...</span>
                </div>
              </CardContent>
            </Card>
      )}
    </div>
  );
};

export default PersonalizedWellness;
