
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Calendar, Trash2, PlusCircle, Clock, X, Edit2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { generateMedicationsPdf } from '@/utils/pdfUtils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface HealthRecord {
  id: string;
  date: Date;
  medicationName: string;
  notes: string;
}

const HealthRecords: React.FC = () => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedication, setNewMedication] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  useEffect(() => {
    // Load health records from localStorage
    const savedRecords = localStorage.getItem('healthRecords');
    if (savedRecords) {
      try {
        const parsedRecords = JSON.parse(savedRecords);
        // Sort records by date (newest first)
        const sortedRecords = parsedRecords.sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setRecords(sortedRecords);
      } catch (error) {
        console.error("Error parsing health records:", error);
        setRecords([]);
      }
    }
  }, []);

  const addRecord = () => {
    if (!newMedication.trim()) {
      toast.error('Please enter a medication name');
      return;
    }
    
    const newRecord: HealthRecord = {
      id: Date.now().toString(),
      date: new Date(),
      medicationName: newMedication,
      notes: newNotes,
    };
    
    const updatedRecords = [newRecord, ...records];
    setRecords(updatedRecords);
    localStorage.setItem('healthRecords', JSON.stringify(updatedRecords));
    
    // Reset form
    setNewMedication('');
    setNewNotes('');
    setShowAddForm(false);
    
    toast.success(`Added ${newMedication} to your health records`);
  };

  const openEditDialog = (record: HealthRecord) => {
    setEditingRecord(record);
    setIsEditDialogOpen(true);
  };

  const saveEditedRecord = () => {
    if (!editingRecord) return;
    
    if (!editingRecord.medicationName.trim()) {
      toast.error('Please enter a medication name');
      return;
    }

    const updatedRecords = records.map(record => 
      record.id === editingRecord.id ? editingRecord : record
    );
    
    setRecords(updatedRecords);
    localStorage.setItem('healthRecords', JSON.stringify(updatedRecords));
    setIsEditDialogOpen(false);
    setEditingRecord(null);
    
    toast.success(`Updated ${editingRecord.medicationName} in your health records`);
  };

  const openDeleteConfirmation = (id: string) => {
    setRecordToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!recordToDelete) return;
    
    const recordToBeDeleted = records.find(r => r.id === recordToDelete);
    const updatedRecords = records.filter(record => record.id !== recordToDelete);
    setRecords(updatedRecords);
    localStorage.setItem('healthRecords', JSON.stringify(updatedRecords));
    setIsDeleteDialogOpen(false);
    setRecordToDelete(null);
    
    if (recordToBeDeleted) {
      toast.success(`Removed ${recordToBeDeleted.medicationName} from your health records`);
    }
  };
  
  const downloadMedicationsPdf = () => {
    generateMedicationsPdf(records);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm h-full border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-lg flex items-center">
            <Pill className="h-5 w-5 mr-2 text-medicine-blue" />
            Your Health Records
          </h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={downloadMedicationsPdf}
              className="h-8 border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700"
            >
              <FileText className="h-4 w-4 mr-1" /> Export PDF
            </Button>
            <Button 
              size="sm" 
              onClick={() => setShowAddForm(!showAddForm)}
              variant={showAddForm ? "secondary" : "default"}
              className="gap-1 h-8"
            >
              {showAddForm ? (
                <>
                  <X className="h-4 w-4" /> Cancel
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" /> Add Record
                </>
              )}
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
      
      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-secondary/50 p-4 border-b"
          >
            <div className="grid gap-3">
              <div>
                <Label htmlFor="medication-name">Medication Name</Label>
                <Input 
                  id="medication-name"
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  placeholder="Enter medication name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="medication-notes">Notes (optional)</Label>
                <Input 
                  id="medication-notes"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Add any notes about this medication"
                  className="mt-1"
                />
              </div>
              <Button onClick={addRecord}>Save Record</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="p-4 overflow-auto" style={{ maxHeight: showAddForm ? "calc(100% - 180px)" : "calc(100% - 80px)" }}>
        {records.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
            <Pill className="h-12 w-12 text-gray-300 mb-3" />
            <p>No health records yet.</p>
            <p className="text-sm mt-2">
              Your medication history will appear here automatically when mentioned in chat.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => setShowAddForm(true)}
            >
              <PlusCircle className="h-4 w-4 mr-1" /> Add your first record
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medication</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Badge variant="outline" className="bg-teal-50 text-teal-700 mr-2 h-6 w-1 p-0" />
                      {record.medicationName}
                    </div>
                    {record.notes && (
                      <p className="text-xs text-muted-foreground mt-1 truncate max-w-[150px]" title={record.notes}>
                        {record.notes}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    <div className="flex flex-col">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(record.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openEditDialog(record)}
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openDeleteConfirmation(record.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Edit Record Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Health Record</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="edit-medication-name">Medication Name</Label>
              <Input
                id="edit-medication-name"
                value={editingRecord?.medicationName || ''}
                onChange={(e) => setEditingRecord(prev => prev ? {...prev, medicationName: e.target.value} : prev)}
                placeholder="Enter medication name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-medication-notes">Notes (optional)</Label>
              <Input
                id="edit-medication-notes"
                value={editingRecord?.notes || ''}
                onChange={(e) => setEditingRecord(prev => prev ? {...prev, notes: e.target.value} : prev)}
                placeholder="Add any notes about this medication"
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
            <DialogTitle>Delete Health Record</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this health record? This action cannot be undone.</p>
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

export default HealthRecords;
