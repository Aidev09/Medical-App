import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, PlusCircle, X, Trash2, Calendar, Clock, Edit2, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface MedicalRecord {
  id: string;
  date: Date;
  type: 'condition' | 'procedure' | 'vaccination' | 'allergy' | 'medication' | 'test';
  title: string;
  description: string;
  provider?: string;
}

const RECORD_TYPES = [
  { value: 'condition', label: 'Medical Condition' },
  { value: 'procedure', label: 'Medical Procedure' },
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'allergy', label: 'Allergy' },
  { value: 'medication', label: 'Medication History' },
  { value: 'test', label: 'Medical Test' }
];

const MedicalHistorySection: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [newRecord, setNewRecord] = useState<Omit<MedicalRecord, 'id' | 'date'>>({
    type: 'condition',
    title: '',
    description: '',
    provider: ''
  });

  useEffect(() => {
    // Load medical records from localStorage
    const savedRecords = localStorage.getItem('medicalRecords');
    if (savedRecords) {
      try {
        const parsedRecords = JSON.parse(savedRecords);
        // Sort records by date (newest first)
        const sortedRecords = parsedRecords.sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setRecords(sortedRecords);
      } catch (error) {
        console.error("Error parsing medical records:", error);
        setRecords([]);
      }
    }
  }, []);

  const handleNewRecordChange = (field: keyof typeof newRecord, value: string) => {
    setNewRecord(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addRecord = () => {
    if (!newRecord.title.trim() || !newRecord.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const record: MedicalRecord = {
      id: Date.now().toString(),
      date: new Date(),
      ...newRecord
    };

    const updatedRecords = [record, ...records];
    setRecords(updatedRecords);
    localStorage.setItem('medicalRecords', JSON.stringify(updatedRecords));

    // Reset form
    setNewRecord({
      type: 'condition',
      title: '',
      description: '',
      provider: ''
    });
    setShowAddForm(false);

    toast.success('Medical record added successfully');
  };

  const openEditDialog = (record: MedicalRecord) => {
    setEditingRecord(record);
    setIsEditDialogOpen(true);
  };

  const handleEditRecordChange = (field: keyof MedicalRecord, value: string) => {
    if (!editingRecord) return;
    setEditingRecord({
      ...editingRecord,
      [field]: value
    });
  };

  const saveEditedRecord = () => {
    if (!editingRecord) return;
    if (!editingRecord.title.trim() || !editingRecord.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedRecords = records.map(record => 
      record.id === editingRecord.id ? editingRecord : record
    );
    setRecords(updatedRecords);
    localStorage.setItem('medicalRecords', JSON.stringify(updatedRecords));

    setIsEditDialogOpen(false);
    setEditingRecord(null);
    toast.success('Medical record updated successfully');
  };

  const openDeleteConfirmation = (id: string) => {
    setRecordToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!recordToDelete) return;
    const updatedRecords = records.filter(record => record.id !== recordToDelete);
    setRecords(updatedRecords);
    localStorage.setItem('medicalRecords', JSON.stringify(updatedRecords));

    setIsDeleteDialogOpen(false);
    setRecordToDelete(null);
    toast.success('Medical record deleted successfully');
  };

  const getBadgeColor = (type: string): string => {
    switch (type) {
      case 'condition':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30';
      case 'procedure':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30';
      case 'vaccination':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30';
      case 'allergy':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30';
      case 'medication':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30';
      default:
        return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800/30';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm h-full border dark:border-gray-800 overflow-hidden">
      <div className="p-4 border-b dark:border-gray-800 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/80">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-lg flex items-center">
            <ClipboardList className="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-500" />
            <span className="bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
              Medical History Records
            </span>
          </h3>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => setShowAddForm(!showAddForm)}
              variant={showAddForm ? "secondary" : "default"}
              className="gap-1 shadow-sm"
              data-add-history
            >
              {showAddForm ? (
                <><X className="h-4 w-4" /> Cancel</>
              ) : (
                <><PlusCircle className="h-4 w-4" /> Add Record</>
              )}
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Keep track of your medical conditions, procedures, and health history
        </p>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50/70 dark:bg-gray-900/50 p-4 border-b dark:border-gray-800"
          >
            <div className="grid gap-3">
              <div>
                <Label htmlFor="record-type">Record Type</Label>
                <Select
                  value={newRecord.type}
                  onValueChange={value => handleNewRecordChange('type', value)}
                >
                  <SelectTrigger className="w-full mt-1 bg-white dark:bg-gray-950/50">
                    <SelectValue placeholder="Select record type" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECORD_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="record-title">Title</Label>
                <Input
                  id="record-title"
                  value={newRecord.title}
                  onChange={e => handleNewRecordChange('title', e.target.value)}
                  placeholder="Enter title"
                  className="mt-1 bg-white dark:bg-gray-950/50"
                />
              </div>
              <div>
                <Label htmlFor="record-description">Description</Label>
                <Textarea
                  id="record-description"
                  value={newRecord.description}
                  onChange={e => handleNewRecordChange('description', e.target.value)}
                  placeholder="Enter description"
                  className="mt-1 bg-white dark:bg-gray-950/50"
                />
              </div>
              <div>
                <Label htmlFor="record-provider">Healthcare Provider (optional)</Label>
                <Input
                  id="record-provider"
                  value={newRecord.provider || ''}
                  onChange={e => handleNewRecordChange('provider', e.target.value)}
                  placeholder="Enter healthcare provider"
                  className="mt-1 bg-white dark:bg-gray-950/50"
                />
              </div>
              <Button onClick={addRecord} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white">
                <PlusCircle className="h-4 w-4 mr-1.5" /> Save Record
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="p-4 overflow-auto space-y-4"
        style={{ maxHeight: showAddForm ? "calc(100% - 250px)" : "calc(100% - 80px)" }}
      >
        {records.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No medical history records</p>
            <p className="text-sm mt-2">Add your first medical record to start tracking your health history.</p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
            >
              <PlusCircle className="h-4 w-4 mr-1.5" /> Add First Record
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {records.map((record) => (
          <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <Badge className="mb-2" variant="outline">
                        {RECORD_TYPES.find(t => t.value === record.type)?.label}
                      </Badge>
                    <h3 className="text-lg font-medium">{record.title}</h3>
                    <p className="text-sm text-muted-foreground">{record.description}</p>
                      </div>
                  <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(record)}
                      className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteConfirmation(record.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {record.provider && (
                    <div className="flex items-center gap-1.5">
                      <User className="h-4 w-4" />
                      {record.provider}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {new Date(record.date).toLocaleDateString()}
                  </div>
                </div>
          </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Record Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Medical Record</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="edit-record-type">Record Type</Label>
              <Select
                value={editingRecord?.type || 'condition'}
                onValueChange={value => handleEditRecordChange('type', value)}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select record type" />
                </SelectTrigger>
                <SelectContent>
                  {RECORD_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-record-title">Title</Label>
              <Input
                id="edit-record-title"
                value={editingRecord?.title || ''}
                onChange={e => handleEditRecordChange('title', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-record-description">Description</Label>
              <Textarea
                id="edit-record-description"
                value={editingRecord?.description || ''}
                onChange={e => handleEditRecordChange('description', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-record-provider">Healthcare Provider (optional)</Label>
              <Input
                id="edit-record-provider"
                value={editingRecord?.provider || ''}
                onChange={e => handleEditRecordChange('provider', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveEditedRecord}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Medical Record</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this medical record? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MedicalHistorySection;