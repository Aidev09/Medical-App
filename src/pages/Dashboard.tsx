import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import MedicationCard from '@/components/medication/MedicationCard';
import { Plus, Calendar, Clock, MessageCircle, Activity, Heart, ChevronLeft, ChevronRight, Pill, BarChart2, User, Shield, X, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import CompactHealthTip from '@/components/health/CompactHealthTip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useMedications } from '../MedicationContext';
import { patchMedicationTaken, deleteMedication as apiDeleteMedication } from '../services/medicationApi';
import { useToast } from '../hooks/use-toast';

const Dashboard = () => {
  const { medications, deleteMedication: contextDeleteMedication, toggleTaken: contextToggleTaken } = useMedications();
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [expandedMedications, setExpandedMedications] = useState<Set<string>>(new Set());
  const isSmallScreen = useMediaQuery('(max-width: 640px)');

  useEffect(() => {
    // Calculate progress
    const takenCount = medications.filter(med => med.taken).length;
    const progressValue = medications.length > 0 ? takenCount / medications.length * 100 : 0;

    // Animate progress from 0 to actual value
    let start = 0;
    const target = progressValue;
    const duration = 1500;
    const startTime = Date.now();
    const animateProgress = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setProgress(start + progress * (target - start));
      if (progress < 1) {
        requestAnimationFrame(animateProgress);
      }
    };
    requestAnimationFrame(animateProgress);
  }, [medications]);

  // PATCH: Mark as taken
  const handleToggleTaken = async (id: string, taken: boolean) => {
    // Optimistic update
    contextToggleTaken(id);
    try {
      await patchMedicationTaken(id, taken);
      toast({ title: 'Success', description: `Medication marked as ${taken ? 'taken' : 'not taken'}.` });
    } catch (error: any) {
      // Revert optimistic update
      contextToggleTaken(id);
      toast({ title: 'Error', description: error.message || 'Failed to update medication status.' });
    }
  };
  // DELETE: Remove medication
  const handleDeleteMedication = async (id: string) => {
    // Optimistic update
    contextDeleteMedication(id);
    try {
      await apiDeleteMedication(id);
      toast({ title: 'Deleted', description: 'Medication removed.' });
    } catch (error: any) {
      // Optionally: refetch or revert UI
      toast({ title: 'Error', description: error.message || 'Failed to delete medication.' });
    }
  };
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCalendarOpen(false);
    }
  };
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  const toggleExpanded = (medicationId: string) => {
    setExpandedMedications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(medicationId)) {
        newSet.delete(medicationId);
      } else {
        newSet.add(medicationId);
      }
      return newSet;
    });
  };

  // Container animation variants
  const container = {
    hidden: {
      opacity: 0
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const item = {
    hidden: {
      opacity: 0,
      y: 20
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
    }
  };

  // Format the selected date
  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  const [stats] = useState({
    medicationAdherence: 92,
    waterIntake: 6,
    steps: 8240,
    sleepHours: 7.5
  });

  const colorMap = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    peach: "bg-orange-500",
    teal: "bg-sky-500",
    red: "bg-red-500",
    yellow: "bg-yellow-400",
    pink: "bg-pink-400",
    gray: "bg-gray-400",
    brown: "bg-amber-700"
  };

  return <PageTransition className="app-container">
      {/* Hero section with quick stats */}
      <div className="mb-6">
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-primary/5 via-primary/10 to-background">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-medium text-gray-600 dark:text-gray-400">
                  Health Overview
                </h2>
              </div>
              <motion.div 
                className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <User className="h-5 w-5 text-primary" />
              </motion.div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-md bg-blue-500/20">
                    <Pill className="h-4 w-4 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Adherence</span>
                </div>
                <p className="text-2xl font-semibold text-blue-700 dark:text-blue-300">
                  {stats.medicationAdherence}%
                </p>
              </div>

              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-md bg-green-500/20">
                    <Activity className="h-4 w-4 text-green-500" />
                  </div>
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">Steps</span>
                </div>
                <p className="text-2xl font-semibold text-green-700 dark:text-green-300">
                  {stats.steps.toLocaleString()}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-md bg-purple-500/20">
                    <Clock className="h-4 w-4 text-purple-500" />
                  </div>
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Sleep</span>
                </div>
                <p className="text-2xl font-semibold text-purple-700 dark:text-purple-300">
                  {stats.sleepHours}h
                </p>
              </div>

              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-md bg-cyan-500/20">
                    <Heart className="h-4 w-4 text-cyan-500" />
                  </div>
                  <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Water</span>
                </div>
                <p className="text-2xl font-semibold text-cyan-700 dark:text-cyan-300">
                  {stats.waterIntake}L
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Enhanced Daily Health Tip */}
      <div className="mb-6">
        <CompactHealthTip />
      </div>
      
      {/* Enhanced animated progress section */}
      <div className="mb-6">
        <Card className="overflow-hidden border border-primary/10 shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-base font-medium">Daily Medications Progress</p>
              <span className="text-sm bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                {medications.filter(m => m.taken).length}/{medications.length} taken
              </span>
            </div>
            
            {/* Progress bar */}
            <div>
              <Progress value={progress} className="h-2.5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick action buttons with refined animations */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <Link to="/add-medication">
          <div 
            className="flex flex-col items-center justify-center p-3 min-h-[88px] rounded-xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 hover:shadow-md hover:shadow-primary/5 transition-all duration-300"
          >
            <div className="w-9 h-9 flex items-center justify-center bg-primary/10 text-primary rounded-full mb-2">
              <Plus className="w-4 h-4" />
            </div>
            <span className="block w-full text-xs font-medium text-muted-foreground text-center leading-tight whitespace-nowrap">Add Meds</span>
          </div>
        </Link>
        
        <Link to="/reminders">
          <div 
            className="flex flex-col items-center justify-center p-3 min-h-[88px] rounded-xl bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/10 hover:shadow-md hover:shadow-blue-500/5 transition-all duration-300"
          >
            <div className="w-9 h-9 flex items-center justify-center bg-blue-500/10 text-blue-500 rounded-full mb-2">
              <Clock className="w-4 h-4" />
            </div>
            <span className="block w-full text-xs font-medium text-muted-foreground text-center leading-tight whitespace-nowrap">Reminders</span>
          </div>
        </Link>
        
        <Link to="/chatbot">
          <div 
            className="flex flex-col items-center justify-center p-3 min-h-[88px] rounded-xl bg-gradient-to-br from-green-500/5 to-transparent border border-green-500/10 hover:shadow-md hover:shadow-green-500/5 transition-all duration-300"
          >
            <div className="w-9 h-9 flex items-center justify-center bg-green-500/10 text-green-500 rounded-full mb-2">
              <MessageCircle className="w-4 h-4" />
            </div>
            <span className="block w-full text-xs font-medium text-muted-foreground text-center leading-tight whitespace-nowrap">Health AI</span>
          </div>
        </Link>
        
        <Link to="/health-records">
          <div 
            className="flex flex-col items-center justify-center p-3 min-h-[88px] rounded-xl bg-gradient-to-br from-purple-500/5 to-transparent border border-purple-500/10 hover:shadow-md hover:shadow-purple-500/5 transition-all duration-300"
          >
            <div className="w-9 h-9 flex items-center justify-center bg-purple-500/10 text-purple-500 rounded-full mb-2">
              <Heart className="w-4 h-4" />
            </div>
            <span className="block w-full text-xs font-medium text-muted-foreground text-center leading-tight whitespace-nowrap">Records</span>
          </div>
        </Link>
      </div>

      {/* Calendar strip with elegant date navigation */}
      <div className="mb-6">
        <Card className="overflow-hidden border border-primary/10 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-medium text-gray-900 dark:text-white">Schedule</h2>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigateDate('prev')} 
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <button 
                      className="text-sm bg-primary/5 hover:bg-primary/10 text-primary px-3 py-1.5 rounded-lg flex items-center gap-2"
                    >
                      {formatSelectedDate(selectedDate)}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <CalendarComponent 
                      mode="single" 
                      selected={selectedDate} 
                      onSelect={handleDateSelect} 
                      initialFocus 
                      className="rounded-lg border-none shadow-none" 
                    />
                  </PopoverContent>
                </Popover>
                <button 
                  onClick={() => navigateDate('next')} 
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Refined day selection strip */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, index) => {
                const date = new Date();
                date.setDate(date.getDate() + index - 3);
                const isToday = index === 3;
                const isSelected = date.toDateString() === selectedDate.toDateString();
                
                return (
                  <button
                    key={index}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200",
                      isSelected 
                        ? "bg-primary text-white shadow-md" 
                        : isToday 
                          ? "bg-primary/10 text-primary border border-primary/20" 
                          : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                    )}
                    onClick={() => setSelectedDate(new Date(date))}
                  >
                    <span className="text-xs opacity-80">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]}
                    </span>
                    <span className={cn(
                      "text-lg font-medium mt-1",
                      isSelected 
                        ? "text-white" 
                        : isToday 
                          ? "text-primary"
                          : "text-gray-900 dark:text-gray-100"
                    )}>
                      {date.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's medications with enhanced styling */}
      <div className="mb-6">
        <Card className="overflow-hidden border border-primary/10 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Pill className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-medium text-gray-900 dark:text-white">Today's Medications</h2>
              </div>
              <Link to="/add-medication">
                <Button
                  size="icon"
                  className="ml-2 rounded-full bg-primary text-white shadow-md hover:bg-primary/90 transition-colors duration-200 focus:ring-2 focus:ring-primary/40"
                  aria-label="Add Medication"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            {medications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                  <Pill className="h-8 w-8 text-primary" />
                </div>
                <div className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
                  No medications scheduled for today
                </div>
                <Link to="/add-medication">
                  <Button className="mt-2 px-5 py-2 flex items-center gap-2 text-base" variant="outline">
                    <Plus className="h-4 w-4" />
                    Add your first medication
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-3">
                {medications.map(medication => (
                  <div
                    key={medication.id}
                    className={cn(
                      "relative p-4 rounded-2xl border-2 bg-white dark:bg-gray-900 shadow-sm",
                      medication.taken
                        ? "bg-green-50 dark:bg-green-950/20 border-green-400"
                        : "border-gray-200 dark:border-gray-700"
                    )}
                  >
                    {/* Main compact row */}
                    <div className="flex items-center justify-between">
                      {/* Left side: Color and name */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className={cn(
                          "w-8 h-8 rounded-full border-2 shadow ring-1 ring-primary/10 flex-shrink-0",
                          colorMap[medication.color] || "bg-gray-200"
                        )} />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-base text-gray-900 dark:text-white truncate">
                            {medication.name}
                          </h3>
                          {/* Days display in compact view */}
                          {Array.isArray(medication.days) && medication.days.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(() => {
                                const allDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                                const weekend = ['Sunday', 'Saturday'];
                                const selected = medication.days;
                                
                                // Check if it's daily (all 7 days)
                                if (selected.length === 7 && allDays.every(day => selected.includes(day))) {
                                  return <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded-full border border-primary/20">Daily</span>;
                                } 
                                // Check if it's weekend only
                                else if (selected.length === 2 && weekend.every(day => selected.includes(day))) {
                                  return <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded-full border border-primary/20">Weekend</span>;
                                } 
                                // Check if it's weekdays only (Mon-Fri)
                                else if (selected.length === 5 && selected.every(day => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day))) {
                                  return <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded-full border border-primary/20">Weekdays</span>;
                                }
                                // Show individual days
                                else {
                                  return selected.map((day, idx) => (
                                    <span key={idx} className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded-full border border-primary/20">
                                      {day.slice(0,3)}
                                    </span>
                                  ));
                                }
                              })()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right side: Delete and expand buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleExpanded(medication.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                          title="Toggle details"
                          aria-label="Toggle medication details"
                        >
                          {expandedMedications.has(medication.id) ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleDeleteMedication(medication.id)}
                          className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 text-red-500 hover:text-red-700 transition-colors"
                          title="Delete medication"
                          aria-label="Delete medication"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Taken indicator - green checkmark */}
                    {medication.taken && (
                      <div className="absolute -top-1 -right-1 z-20">
                        <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-900">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Expandable details section */}
                    {expandedMedications.has(medication.id) && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="space-y-3">
                          {/* Dosage and amount */}
                          <div className="flex flex-wrap gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded px-2 py-1 border border-gray-200 dark:border-gray-700">
                              {medication.dosage}
                            </span>
                            {medication.amount && medication.amount_type && (
                              <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded px-2 py-1 border border-gray-200 dark:border-gray-700">
                                {medication.amount} {medication.amount_type}
                              </span>
                            )}
                            {medication.frequency && (
                              <span className="text-sm text-primary bg-primary/10 rounded px-2 py-1 border border-primary/20">
                                {medication.frequency.charAt(0).toUpperCase() + medication.frequency.slice(1)}
                              </span>
                            )}
                          </div>

                          {/* Time */}
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className={cn(
                              "text-sm px-2 py-1 rounded-lg",
                              medication.taken
                                ? "bg-green-500/10 text-green-700 dark:text-green-300"
                                : "bg-orange-500/10 text-orange-700 dark:text-orange-300"
                            )}>
                              {medication.time}
                            </span>
                          </div>

                          {/* Days */}
                          {Array.isArray(medication.days) && medication.days.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {(() => {
                                const allDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                                const weekend = ['Sunday', 'Saturday'];
                                const selected = medication.days;
                                if (selected.length === 7 && allDays.every(day => selected.includes(day))) {
                                  return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">Daily</span>;
                                } else if (selected.length === 2 && weekend.every(day => selected.includes(day))) {
                                  return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">Weekend</span>;
                                } else {
                                  return selected.map((day, idx) => (
                                    <span key={idx} className="px-2 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                                      {day.slice(0,3)}
                                    </span>
                                  ));
                                }
                              })()}
                            </div>
                          )}

                          {/* End date */}
                          {medication.end_date && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                End: {new Date(medication.end_date).toLocaleDateString('en-US', { year: '2-digit', month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          )}

                          {/* Mark as Taken button */}
                          <div className="pt-2">
                            <Button
                              variant={medication.taken ? "default" : "outline"}
                              size="sm"
                              className={cn(
                                "w-full transition-all duration-200",
                                medication.taken
                                  ? "bg-green-500 text-white hover:bg-green-600 focus:ring-2 focus:ring-green-400"
                                  : "text-orange-600 hover:text-orange-700 hover:bg-orange-500/10"
                              )}
                              onClick={() => handleToggleTaken(medication.id, !medication.taken)}
                              aria-pressed={medication.taken}
                              aria-label={medication.taken ? 'Mark as Not Taken' : 'Mark as Taken'}
                            >
                              {medication.taken ? (
                                <span className="flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                  Taken
                                </span>
                              ) : (
                                <span className="flex items-center gap-2">
                                  <Pill className="w-4 h-4" />
                                  Mark as Taken
                                </span>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>


    </PageTransition>;
};
export default Dashboard;
