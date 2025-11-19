
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Brain, Search, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface SymptomAnalysis {
  possibleConditions: Array<{
    name: string;
    probability: number;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  recommendations: string[];
  urgency: 'low' | 'medium' | 'high' | 'emergency';
}

const SymptomChecker: React.FC = () => {
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      toast.error('Please describe your symptoms');
      return;
    }

    setIsAnalyzing(true);

    // Simulate AI analysis - in real app, this would call medical AI API
    setTimeout(() => {
      const mockAnalysis: SymptomAnalysis = {
        possibleConditions: [
          {
            name: 'Common Cold',
            probability: 75,
            severity: 'low',
            description: 'Viral upper respiratory infection with typical symptoms'
          },
          {
            name: 'Seasonal Allergies',
            probability: 45,
            severity: 'low',
            description: 'Allergic reaction to environmental triggers'
          },
          {
            name: 'Viral Flu',
            probability: 30,
            severity: 'medium',
            description: 'Influenza virus infection requiring monitoring'
          }
        ],
        recommendations: [
          'Rest and stay hydrated',
          'Monitor temperature regularly',
          'Consider over-the-counter symptom relief',
          'Seek medical attention if symptoms worsen'
        ],
        urgency: Math.random() > 0.8 ? 'high' : 'low'
      };

      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);

      if (mockAnalysis.urgency === 'high' || mockAnalysis.urgency === 'emergency') {
        toast.warning('High urgency symptoms detected. Consider seeking medical attention.');
      } else {
        toast.success('Symptom analysis completed. Review the recommendations below.');
      }
    }, 3000);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-500 text-white';
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            AI-Powered Symptom Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="symptoms">Describe Your Symptoms</Label>
            <Textarea
              id="symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Please describe your symptoms in detail. For example: 'I have a headache, runny nose, and feel tired. Started 2 days ago.'"
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="duration">How long have you had these symptoms?</Label>
            <Textarea
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., Started yesterday morning, been ongoing for 3 days, etc."
              className="min-h-[60px]"
            />
          </div>

          <Button 
            onClick={analyzeSymptoms} 
            disabled={!symptoms.trim() || isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-pulse" />
                Analyzing Symptoms...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Analyze Symptoms
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Symptom Analysis Results</span>
              <Badge className={getUrgencyColor(analysis.urgency)}>
                {analysis.urgency.toUpperCase()} PRIORITY
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Possible Conditions */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Possible Conditions
              </h3>
              <div className="space-y-3">
                {analysis.possibleConditions.map((condition, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{condition.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getSeverityColor(condition.severity)}>
                          {condition.severity}
                        </Badge>
                        <span className="text-sm font-medium">
                          {condition.probability}% match
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {condition.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Recommendations
              </h3>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Urgency Warning */}
            {(analysis.urgency === 'high' || analysis.urgency === 'emergency') && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-semibold">
                    {analysis.urgency === 'emergency' ? 'Seek Emergency Care' : 'High Priority'}
                  </span>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {analysis.urgency === 'emergency' 
                    ? 'Your symptoms may require immediate medical attention. Consider calling emergency services or visiting an emergency room.'
                    : 'Your symptoms warrant prompt medical evaluation. Contact your healthcare provider soon.'
                  }
                </p>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg text-xs text-blue-700 dark:text-blue-300">
              <strong>Medical Disclaimer:</strong> This AI analysis is for informational purposes only and does not constitute medical advice. Always consult with qualified healthcare professionals for proper diagnosis and treatment.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SymptomChecker;
