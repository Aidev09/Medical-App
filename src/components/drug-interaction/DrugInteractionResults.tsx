
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Shield, ExternalLink, Download } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Interaction {
  severity: 'mild' | 'moderate' | 'severe';
  drugs: string[];
  description: string;
  recommendation: string;
}

interface InteractionResults {
  hasInteractions: boolean;
  interactions: Interaction[];
  safetyScore: number;
}

interface DrugInteractionResultsProps {
  results: InteractionResults;
}

const DrugInteractionResults: React.FC<DrugInteractionResultsProps> = ({ results }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'moderate': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'severe': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'mild': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'moderate': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'severe': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Interaction Analysis Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Safety Score */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">Overall Safety Score</span>
            <span className={`text-2xl font-bold ${getScoreColor(results.safetyScore)}`}>
              {results.safetyScore}/100
            </span>
          </div>
          <Progress value={results.safetyScore} className="h-3" />
          <p className="text-sm text-muted-foreground">
            {results.safetyScore >= 80 
              ? 'Low risk - Generally safe combination'
              : results.safetyScore >= 60 
              ? 'Moderate risk - Monitor for side effects'
              : 'High risk - Consult healthcare provider'
            }
          </p>
        </div>

        {/* Interactions */}
        {results.hasInteractions ? (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Potential Interactions Found ({results.interactions.length})
            </h3>
            
            {results.interactions.map((interaction, index) => (
              <Card key={index} className="border-l-4 border-l-orange-400">
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(interaction.severity)}
                      <Badge className={getSeverityColor(interaction.severity)}>
                        {interaction.severity.toUpperCase()}
                      </Badge>
                      <span className="font-medium">
                        {interaction.drugs.join(' + ')}
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Interaction:</strong> {interaction.description}
                      </p>
                      <p className="text-sm">
                        <strong>Recommendation:</strong> {interaction.recommendation}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-lg text-green-700">No Major Interactions Detected</h3>
            <p className="text-muted-foreground">
              The selected medications appear to be safe to take together based on current data.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Save Report
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Learn More
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg text-xs text-blue-700 dark:text-blue-300">
          <strong>Medical Disclaimer:</strong> This tool provides general information only and should not replace professional medical advice. Always consult your healthcare provider before making changes to your medications.
        </div>
      </CardContent>
    </Card>
  );
};

export default DrugInteractionResults;
