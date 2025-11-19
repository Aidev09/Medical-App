import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Calendar, Trash2, PlusCircle, Clock, X, Edit2, Activity, Heart, Thermometer, Droplet, Moon, Scale, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateHealthReportPdf } from '@/utils/pdfUtils';

interface HealthStat {
  id: string;
  date: Date;
  type: 'blood-pressure' | 'heart-rate' | 'weight' | 'sleep' | 'temperature' | 'glucose' | 'oxygen';
  value: string;
  notes: string;
}

const STAT_TYPES = [{
  value: 'blood-pressure',
  label: 'Blood Pressure',
  unit: 'mmHg',
  icon: Activity,
  description: 'Systolic/Diastolic (e.g., 120/80)'
}, {
  value: 'heart-rate',
  label: 'Heart Rate',
  unit: 'bpm',
  icon: Heart,
  description: 'Beats per minute'
}, {
  value: 'weight',
  label: 'Weight',
  unit: 'kg',
  icon: Scale,
  description: 'Weight in kilograms'
}, {
  value: 'sleep',
  label: 'Sleep',
  unit: 'hours',
  icon: Moon,
  description: 'Hours of sleep'
}, {
  value: 'temperature',
  label: 'Temperature',
  unit: '°C',
  icon: Thermometer,
  description: 'Body temperature in Celsius'
}, {
  value: 'glucose',
  label: 'Glucose',
  unit: 'mg/dL',
  icon: Droplet,
  description: 'Blood glucose level'
}, {
  value: 'oxygen',
  label: 'Oxygen',
  unit: '%',
  icon: Activity,
  description: 'Blood oxygen saturation'
}];

const HealthStatsSection: React.FC = () => {
  const [stats, setStats] = useState<HealthStat[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStat, setEditingStat] = useState<HealthStat | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [statToDelete, setStatToDelete] = useState<string | null>(null);
  const [newStat, setNewStat] = useState<Omit<HealthStat, 'id' | 'date'>>({
    type: 'blood-pressure',
    value: '',
    notes: ''
  });

  useEffect(() => {
    // Load health stats from localStorage
    const savedStats = localStorage.getItem('healthStats');
    if (savedStats) {
      try {
        const parsedStats = JSON.parse(savedStats);
        // Sort stats by date (newest first)
        const sortedStats = parsedStats.sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setStats(sortedStats);
      } catch (error) {
        console.error("Error parsing health stats:", error);
        setStats([]);
      }
    }
  }, []);

  const handleNewStatChange = (field: keyof typeof newStat, value: string) => {
    setNewStat(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addStat = () => {
    if (!newStat.value.trim()) {
      toast.error('Please enter a value');
      return;
    }

    const stat: HealthStat = {
      id: Date.now().toString(),
      date: new Date(),
      ...newStat
    };

    const updatedStats = [stat, ...stats];
    setStats(updatedStats);
    localStorage.setItem('healthStats', JSON.stringify(updatedStats));

    // Reset form
    setNewStat({
      type: 'blood-pressure',
      value: '',
      notes: ''
    });
    setShowAddForm(false);

    toast.success('Health measurement added successfully');
  };

  const openEditDialog = (stat: HealthStat) => {
    setEditingStat(stat);
    setIsEditDialogOpen(true);
  };

  const handleEditStatChange = (field: keyof HealthStat, value: string) => {
    if (!editingStat) return;
    setEditingStat({
      ...editingStat,
      [field]: value
    });
  };

  const saveEditedStat = () => {
    if (!editingStat) return;
    if (!editingStat.value.trim()) {
      toast.error('Please enter a value');
      return;
    }

    const updatedStats = stats.map(stat => 
      stat.id === editingStat.id ? editingStat : stat
    );
    setStats(updatedStats);
    localStorage.setItem('healthStats', JSON.stringify(updatedStats));

    setIsEditDialogOpen(false);
    setEditingStat(null);
    toast.success('Health measurement updated successfully');
  };

  const openDeleteConfirmation = (id: string) => {
    setStatToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!statToDelete) return;
    const updatedStats = stats.filter(stat => stat.id !== statToDelete);
    setStats(updatedStats);
    localStorage.setItem('healthStats', JSON.stringify(updatedStats));

    setIsDeleteDialogOpen(false);
    setStatToDelete(null);
    toast.success('Health measurement deleted successfully');
  };

  const getBadgeColor = (type: string): string => {
    switch (type) {
      case 'blood-pressure':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30';
      case 'heart-rate':
        return 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800/30';
      case 'weight':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30';
      case 'sleep':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/30';
      case 'temperature':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30';
      case 'glucose':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30';
      default:
        return 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800/30';
    }
  };

  const getTypeInfo = (type: string) => {
    return STAT_TYPES.find(t => t.value === type) || {
      label: type,
      unit: '',
      icon: Activity,
      description: ''
    };
  };

  const downloadHealthReport = () => {
    generateHealthReportPdf(stats);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm h-full border dark:border-gray-800 overflow-hidden">
      <div className="p-4 border-b dark:border-gray-800 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/80">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-lg flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-500" />
            <span className="bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
              Health Statistics
            </span>
          </h3>
          <div className="flex gap-2">
            {stats.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={downloadHealthReport}
                className="gap-1 shadow-sm"
              >
                <FileText className="h-4 w-4" /> Export PDF
              </Button>
            )}
            <Button 
              size="sm" 
              onClick={() => setShowAddForm(!showAddForm)}
              variant={showAddForm ? "secondary" : "default"}
              className="gap-1 shadow-sm"
              data-add-stat
            >
              {showAddForm ? (
                <><X className="h-4 w-4" /> Cancel</>
              ) : (
                <><PlusCircle className="h-4 w-4" /> Add Data</>
              )}
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Track your vital measurements and health statistics over time
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
                <Label htmlFor="stat-type">Measurement Type</Label>
                <Select
                  value={newStat.type}
                  onValueChange={value => handleNewStatChange('type', value as any)}
                >
                  <SelectTrigger className="w-full mt-1 bg-white dark:bg-gray-950/50">
                    <SelectValue placeholder="Select measurement type" />
                  </SelectTrigger>
                  <SelectContent>
                    {STAT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center">
                          {type.icon && <type.icon className="h-4 w-4 mr-2 text-emerald-600" />}
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {getTypeInfo(newStat.type).description}
                </p>
              </div>
              <div>
                <Label htmlFor="stat-value">
                  Value ({getTypeInfo(newStat.type).unit})
                </Label>
                <Input
                  id="stat-value"
                  value={newStat.value}
                  onChange={e => handleNewStatChange('value', e.target.value)}
                  placeholder={`Enter ${getTypeInfo(newStat.type).label.toLowerCase()} value`}
                  className="mt-1 bg-white dark:bg-gray-950/50"
                />
              </div>
              <div>
                <Label htmlFor="stat-notes">Notes (optional)</Label>
                <Input
                  id="stat-notes"
                  value={newStat.notes}
                  onChange={e => handleNewStatChange('notes', e.target.value)}
                  placeholder="Add any additional notes"
                  className="mt-1 bg-white dark:bg-gray-950/50"
                />
              </div>
              <Button onClick={addStat} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white">
                <PlusCircle className="h-4 w-4 mr-1.5" /> Save Measurement
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="p-4 overflow-auto"
        style={{ maxHeight: showAddForm ? "calc(100% - 250px)" : "calc(100% - 80px)" }}
      >
        {stats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-3">
              <Activity className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
            </div>
            <p className="font-medium text-gray-700 dark:text-gray-300">No health statistics yet.</p>
            <p className="text-sm mt-2 max-w-xs">
              Track your vital measurements like blood pressure, glucose levels, weight, and more.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
              onClick={() => setShowAddForm(true)}
            >
              <PlusCircle className="h-4 w-4 mr-1" /> Add your first measurement
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Table className="border dark:border-gray-800 rounded-md overflow-hidden">
              <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <TableHead className="font-medium text-gray-700 dark:text-gray-300">Type</TableHead>
                  <TableHead className="font-medium text-gray-700 dark:text-gray-300">Value</TableHead>
                  <TableHead className="font-medium text-gray-700 dark:text-gray-300">Date & Time</TableHead>
                  <TableHead className="text-right font-medium text-gray-700 dark:text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map(stat => (
                  <TableRow key={stat.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 border-b dark:border-gray-800 last:border-0">
                    <TableCell>
                      <Badge className={`${getBadgeColor(stat.type)} font-normal border`}>
                        <div className="flex items-center">
                          {React.createElement(getTypeInfo(stat.type).icon, {
                            className: "h-3.5 w-3.5 mr-1.5"
                          })}
                          {getTypeInfo(stat.type).label}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <span className="text-gray-900 dark:text-gray-100">{stat.value}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-0.5">
                          {getTypeInfo(stat.type).unit}
                        </span>
                      </div>
                      {stat.notes && (
                        <p className="text-xs text-muted-foreground mt-1.5 truncate max-w-[200px]" title={stat.notes}>
                          {stat.notes}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      <div className="flex flex-col">
                        <span className="flex items-center text-gray-600 dark:text-gray-400">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(stat.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center mt-1 text-gray-600 dark:text-gray-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(stat.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(stat)}
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 h-8 w-8 p-0 dark:hover:bg-blue-950/30"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteConfirmation(stat.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 dark:hover:bg-red-950/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        )}
      </div>

      {/* Edit Stat Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Health Measurement</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="edit-stat-type">Measurement Type</Label>
              <Select
                value={editingStat?.type || 'blood-pressure'}
                onValueChange={value => handleEditStatChange('type', value as any)}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select measurement type" />
                </SelectTrigger>
                <SelectContent>
                  {STAT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center">
                        <type.icon className="h-4 w-4 mr-2 text-emerald-600" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-stat-value">
                Value ({editingStat && getTypeInfo(editingStat.type).unit})
              </Label>
              <Input
                id="edit-stat-value"
                value={editingStat?.value || ''}
                onChange={e => handleEditStatChange('value', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-stat-notes">Notes (optional)</Label>
              <Input
                id="edit-stat-notes"
                value={editingStat?.notes || ''}
                onChange={e => handleEditStatChange('notes', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveEditedStat}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Health Measurement</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this health measurement? This action cannot be undone.</p>
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

export default HealthStatsSection;