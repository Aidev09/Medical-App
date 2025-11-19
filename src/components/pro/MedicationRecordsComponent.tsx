import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Download, Plus, Calendar, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  notes: string;
  status: 'active' | 'completed' | 'discontinued';
  adherence: number;
  sideEffects: string[];
}

const MedicationRecordsComponent: React.FC = () => {
  const [isAddingMedication, setIsAddingMedication] = useState(false);
  const [medications] = useState<Medication[]>([
    {
      id: '1',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      startDate: new Date('2024-01-01'),
      notes: 'Take with meals',
      status: 'active',
      adherence: 95,
      sideEffects: ['Mild nausea']
    },
    {
      id: '2',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      startDate: new Date('2024-01-15'),
      notes: 'Take in the morning',
      status: 'active',
      adherence: 88,
      sideEffects: []
    },
    {
      id: '3',
      name: 'Amoxicillin',
      dosage: '500mg',
      frequency: 'Three times daily',
      startDate: new Date('2023-12-01'),
      endDate: new Date('2023-12-10'),
      notes: 'Course completed',
      status: 'completed',
      adherence: 100,
      sideEffects: ['Mild stomach discomfort']
    }
  ]);

  const [newMedication, setNewMedication] = useState<Partial<Medication>>({
    status: 'active',
    adherence: 100,
    sideEffects: []
  });

  const handleDownloadReport = () => {
    // In a real app, this would generate and download a PDF report
    toast.success('Downloading medication report...');
  };

  const addMedication = () => {
    if (!newMedication.name || !newMedication.dosage || !newMedication.frequency) {
      toast.error('Please fill in all required fields');
      return;
    }

    // In a real app, this would add the medication to the database
    toast.success('Medication added successfully');
    setIsAddingMedication(false);
    setNewMedication({
      status: 'active',
      adherence: 100,
      sideEffects: []
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'discontinued': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getAdherenceColor = (adherence: number) => {
    if (adherence >= 90) return 'text-green-500';
    if (adherence >= 75) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getAdherenceIcon = (adherence: number) => {
    if (adherence >= 90) return CheckCircle;
    if (adherence >= 75) return AlertCircle;
    return XCircle;
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header Card */}
      <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-green-500" />
              Medication Records
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadReport}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button
                size="sm"
                onClick={() => setIsAddingMedication(true)}
                className="bg-green-500 hover:bg-green-600"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Medications List */}
      <div className="space-y-4">
        {medications.map((medication) => (
          <motion.div
            key={medication.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{medication.name}</h3>
                      <Badge className={getStatusColor(medication.status)}>
                        {medication.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {medication.dosage} - {medication.frequency}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {React.createElement(getAdherenceIcon(medication.adherence), {
                        className: `h-4 w-4 ${getAdherenceColor(medication.adherence)}`
                      })}
                      <span className={`text-sm font-medium ${getAdherenceColor(medication.adherence)}`}>
                        {medication.adherence}% Adherence
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Start Date:</span>
                    </div>
                    <p>{medication.startDate.toLocaleDateString()}</p>
                  </div>
                  {medication.endDate && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>End Date:</span>
                      </div>
                      <p>{medication.endDate.toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                {(medication.notes || medication.sideEffects.length > 0) && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    {medication.notes && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {medication.notes}
                      </p>
                    )}
                    {medication.sideEffects.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {medication.sideEffects.map((effect, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-yellow-600 border-yellow-200 bg-yellow-50"
                          >
                            {effect}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add Medication Dialog */}
      <Dialog open={isAddingMedication} onOpenChange={setIsAddingMedication}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Medication</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Medication Name</Label>
              <Input
                value={newMedication.name || ''}
                onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                placeholder="Enter medication name"
              />
            </div>
            <div>
              <Label>Dosage</Label>
              <Input
                value={newMedication.dosage || ''}
                onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                placeholder="e.g., 500mg"
              />
            </div>
            <div>
              <Label>Frequency</Label>
              <Select
                value={newMedication.frequency}
                onValueChange={(value) => setNewMedication({ ...newMedication, frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Once daily">Once daily</SelectItem>
                  <SelectItem value="Twice daily">Twice daily</SelectItem>
                  <SelectItem value="Three times daily">Three times daily</SelectItem>
                  <SelectItem value="As needed">As needed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={newMedication.notes || ''}
                onChange={(e) => setNewMedication({ ...newMedication, notes: e.target.value })}
                placeholder="Add any special instructions or notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddingMedication(false)}>
              Cancel
            </Button>
            <Button onClick={addMedication} className="bg-green-500 hover:bg-green-600">
              Add Medication
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MedicationRecordsComponent; 