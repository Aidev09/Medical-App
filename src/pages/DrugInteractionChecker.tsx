
import React, { useState } from 'react';
import PageTransition from '@/components/ui/PageTransition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Search, Plus, X, Shield, Brain, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useAppSelector } from '@/store/hooks';
import DrugInteractionResults from '@/components/drug-interaction/DrugInteractionResults';
import SymptomChecker from '@/components/drug-interaction/SymptomChecker';

const DrugInteractionChecker: React.FC = () => {
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);
  const [newMedication, setNewMedication] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [interactionResults, setInteractionResults] = useState<any>(null);
  
  // Get user's current medications from Redux store
  const healthRecords = useAppSelector(state => state.health.records);
  const currentMedications = healthRecords.map(record => record.medicationName);

  const addMedication = () => {
    if (!newMedication.trim()) {
      toast.error('Please enter a medication name');
      return;
    }
    
    if (selectedMedications.includes(newMedication)) {
      toast.error('Medication already added');
      return;
    }
    
    setSelectedMedications([...selectedMedications, newMedication]);
    setNewMedication('');
  };

  const removeMedication = (medication: string) => {
    setSelectedMedications(selectedMedications.filter(med => med !== medication));
  };

  const addCurrentMedication = (medication: string) => {
    if (!selectedMedications.includes(medication)) {
      setSelectedMedications([...selectedMedications, medication]);
    }
  };

  const checkInteractions = async () => {
    if (selectedMedications.length < 2) {
      toast.error('Please add at least 2 medications to check for interactions');
      return;
    }

    setIsChecking(true);
    
    // Simulate API call - in real app, this would call FDA API or similar
    setTimeout(() => {
      const mockResults = {
        hasInteractions: Math.random() > 0.5,
        interactions: [
          {
            severity: 'moderate',
            drugs: [selectedMedications[0], selectedMedications[1]],
            description: 'May increase risk of bleeding when taken together',
            recommendation: 'Monitor for signs of bleeding. Consult your doctor.',
          }
        ],
        safetyScore: Math.floor(Math.random() * 40) + 60, // 60-100
      };
      
      setInteractionResults(mockResults);
      setIsChecking(false);
      
      if (mockResults.hasInteractions) {
        toast.warning('Potential drug interactions found. Please review carefully.');
      } else {
        toast.success('No major interactions detected between selected medications.');
      }
    }, 2000);
  };

  return (
    <PageTransition className="app-container pb-32">
      <div className="mb-8">
        <h1 className="page-title text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500 mb-2">
          Drug Interaction & Symptom Checker
        </h1>
        <p className="text-muted-foreground text-lg">
          Check for potential drug interactions and get AI-powered symptom analysis
        </p>
      </div>

      <Tabs defaultValue="interactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="interactions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Drug Interactions
          </TabsTrigger>
          <TabsTrigger value="symptoms" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Symptom Checker
          </TabsTrigger>
        </TabsList>

        <TabsContent value="interactions" className="space-y-6">
          {/* Current Medications Quick Add */}
          {currentMedications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-green-500" />
                  Your Current Medications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {currentMedications.map(med => (
                    <Button
                      key={med}
                      variant="outline"
                      size="sm"
                      onClick={() => addCurrentMedication(med)}
                      disabled={selectedMedications.includes(med)}
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {med}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Medications */}
          <Card>
            <CardHeader>
              <CardTitle>Select Medications to Check</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="medication">Add Medication</Label>
                  <Input
                    id="medication"
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    placeholder="Enter medication name (e.g., Aspirin, Ibuprofen)"
                    onKeyPress={(e) => e.key === 'Enter' && addMedication()}
                  />
                </div>
                <Button onClick={addMedication} className="mt-6">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Selected Medications */}
              {selectedMedications.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Medications ({selectedMedications.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedMedications.map(med => (
                      <Badge key={med} variant="secondary" className="flex items-center gap-1">
                        {med}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-red-500" 
                          onClick={() => removeMedication(med)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                onClick={checkInteractions} 
                disabled={selectedMedications.length < 2 || isChecking}
                className="w-full"
              >
                {isChecking ? (
                  <>Checking Interactions...</>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Check Drug Interactions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {interactionResults && (
            <DrugInteractionResults results={interactionResults} />
          )}
        </TabsContent>

        <TabsContent value="symptoms">
          <SymptomChecker />
        </TabsContent>
      </Tabs>
    </PageTransition>
  );
};

export default DrugInteractionChecker;
