import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Trash2, PlusCircle, Clock, Calendar, FileText, Shield, X, Plus, LayoutList, Activity, Stethoscope, Bell, MessageSquare, User, Crown, Share2, Download, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generateMedicationsPdf } from '@/utils/pdfUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAppSelector } from '@/store/hooks';
import { HealthRecord } from '@/store/slices/healthSlice';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HealthRecordsComponentProps {
  onAddRecord: (record: {
    medicationName: string;
    notes: string;
    dosage?: string;
    time?: string;
  }) => void;
  onUpdateRecord: (record: HealthRecord) => void;
  onDeleteRecord: (id: string, name: string) => void;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  notes?: string;
  startDate: string;
}

interface MedicationRecord {
  name: string;
  dosage: string;
  schedule: string;
  doctor: string;
  date: string;
  status: string;
  refills: number;
}

const HealthRecordsComponent: React.FC<HealthRecordsComponentProps> = ({
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord
}) => {
  const records = useAppSelector(state => state.health.records);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    notes: '',
    startDate: new Date().toISOString().split('T')[0]
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [recordNameToDelete, setRecordNameToDelete] = useState<string>('');
  const [activeTab, setActiveTab] = useState('medications');
  const [activeNav, setActiveNav] = useState('add');
  const [medications, setMedications] = useState<Medication[]>([]);

  // Example medication record
  const medicationRecord: MedicationRecord = {
    name: "Lisinopril 10mg",
    dosage: "10mg",
    schedule: "Once daily in morning",
    doctor: "Dr. Michael Chen",
    date: "08/01/2024",
    status: "active",
    refills: 3
  };

  const handleAddMedication = () => {
    if (!newMedication.name) {
      toast.error('Please enter a medication name');
      return;
    }

    const medication: Medication = {
      id: Date.now().toString(),
      ...newMedication
    };

    setMedications([...medications, medication]);
    setNewMedication({
      name: '',
      dosage: '',
      frequency: '',
      notes: '',
      startDate: new Date().toISOString().split('T')[0]
    });
    setShowAddForm(false);
    toast.success('Medication added successfully');
  };

  const openDeleteConfirmation = (id: string) => {
    const record = records.find(r => r.id === id);
    if (record) {
      setRecordNameToDelete(record.medicationName);
      setRecordToDelete(id);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (!recordToDelete) return;
    onDeleteRecord(recordToDelete, recordNameToDelete);
    setIsDeleteDialogOpen(false);
    setRecordToDelete(null);
  };

  const bottomNavItems = [
    { id: 'add', icon: Plus, label: 'Add', color: 'text-emerald-400' },
    { id: 'reminders', icon: Bell, label: 'Reminders' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'pro', icon: Crown, label: 'Pro', hasIndicator: true },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="relative flex flex-col h-[calc(100vh-2rem)] max-h-[800px] w-full bg-[#0F172A] text-white rounded-[20px] shadow-xl">
      {/* Top Navigation */}
      <nav className="flex border-b border-gray-800 w-full sticky top-0 z-10 bg-[#0F172A]">
        <div className="flex w-full px-6 gap-2">
          <button 
            onClick={() => setActiveTab('medications')}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all duration-200 ${
              activeTab === 'medications' 
                ? 'border-emerald-400 text-white' 
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <Pill className="h-5 w-5" />
            <span className="text-xl font-medium">Medications</span>
          </button>
          <button 
            onClick={() => setActiveTab('health-stats')}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all duration-200 ${
              activeTab === 'health-stats'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <Activity className="h-5 w-5" />
            <span className="text-xl font-medium">Health Stats</span>
          </button>
          <button 
            onClick={() => setActiveTab('medical-history')}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all duration-200 ${
              activeTab === 'medical-history'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <Stethoscope className="h-5 w-5" />
            <span className="text-xl font-medium">Medical History</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto w-full">
        <div className="p-6 space-y-6 w-full max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-400/10 rounded-xl">
                <Pill className="h-8 w-8 text-emerald-400" />
              </div>
              <h1 className="text-[32px] font-bold tracking-tight">Your Medication History</h1>
            </div>
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 bg-[#1E293B] text-white border-gray-700 hover:bg-[#2D3B4F] hover:border-gray-600 rounded-full h-10 px-6 transition-all duration-200"
                    >
                      <LayoutList className="h-5 w-5" />
                      <span className="hidden sm:inline">List View</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Switch to list view</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="flex items-center gap-2 bg-emerald-400 hover:bg-emerald-500 text-white rounded-full h-10 px-6 transition-all duration-200"
                    >
                      <Plus className="h-5 w-5" />
                      <span className="hidden sm:inline">Add Medication</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add new medication</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Description */}
          <p className="text-lg text-gray-400 max-w-3xl">
            Your medication history is automatically tracked when mentioned in chat. All records are encrypted and HIPAA compliant.
          </p>

          {/* Medication Record Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-[#1E293B] border-gray-700/50 rounded-xl w-full overflow-hidden hover:border-gray-600 transition-colors duration-200">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                  <div className="flex-1 min-w-0 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-400/10 rounded-lg">
                        <Pill className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                      </div>
                      <h3 className="text-xl font-semibold text-white truncate">{medicationRecord.name}</h3>
                    </div>
                    <p className="text-gray-400 line-clamp-2 leading-relaxed">{medicationRecord.schedule}</p>
                    <div className="flex items-center gap-3 text-gray-400 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{medicationRecord.doctor}</span>
                      </div>
                      <span className="h-1 w-1 rounded-full bg-gray-600 flex-shrink-0" />
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{medicationRecord.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-1.5 text-sm font-medium">
                      {medicationRecord.status}
                    </Badge>
                    <div className="flex items-center gap-2 text-blue-400">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">{medicationRecord.refills} refills left</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 sm:flex-none min-w-[140px] bg-[#0F172A] hover:bg-[#1E293B] border-gray-700 text-white transition-all duration-200"
                  >
                    <Share2 className="h-4 w-4 mr-2 flex-shrink-0" />
                    Share Records
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 sm:flex-none min-w-[140px] bg-[#0F172A] hover:bg-[#1E293B] border-gray-700 text-white transition-all duration-200"
                  >
                    <Download className="h-4 w-4 mr-2 flex-shrink-0" />
                    Download
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 sm:flex-none min-w-[140px] bg-[#0F172A] hover:bg-[#1E293B] border-gray-700 text-white transition-all duration-200"
                  >
                    <Edit className="h-4 w-4 mr-2 flex-shrink-0" />
                    Edit Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* HIPAA Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-[#2D1B69] border-purple-500/20 rounded-xl overflow-hidden hover:border-purple-500/30 transition-colors duration-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-400/10 rounded-lg flex-shrink-0">
                    <Shield className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="min-w-0 space-y-2">
                    <h3 className="text-lg font-semibold text-purple-300">HIPAA Compliant Security</h3>
                    <p className="text-purple-200/70 leading-relaxed">
                      Your medical records are protected by industry-leading encryption and security measures, 
                      ensuring full compliance with HIPAA regulations and protecting your privacy at all times.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HealthRecordsComponent;