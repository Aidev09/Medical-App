import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageTransition from '@/components/ui/PageTransition';
import { motion } from 'framer-motion';
import { 
  Clock, Calendar, Info, Search, Check, PlusCircle, 
  Pill, Syringe, Droplet, Tablets, Repeat, AlertCircle,
  CalendarClock, BellRing, Stethoscope, Sparkles, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DrugResult } from '@/services/fdaApi';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import ConfettiExplosion from 'react-confetti-explosion';
import { useMedications } from '../MedicationContext';

interface MedicationLocationState {
  medication?: {
    name: string;
    usage: string;
    dosage: string;
    warnings: string;
    details: DrugResult;
  };
}

const AddMedication = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const medicationData = (location.state as MedicationLocationState)?.medication;
  const { addMedication } = useMedications();

  // Form state
  const [name, setName] = useState<string>(medicationData?.name || '');
  const [dosage, setDosage] = useState<string>('');
  const [dosageUnit, setDosageUnit] = useState<string>('mg');
  const [amount, setAmount] = useState<string>('1');
  const [amountType, setAmountType] = useState<string>('tablet');
  const [frequency, setFrequency] = useState<string>('daily');
  const [selectedTime, setSelectedTime] = useState<string>('08:00');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('blue');
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]); // All days selected by default
  const [timePickerOpen, setTimePickerOpen] = useState<boolean>(false);
  const [hour, setHour] = useState<number>(8);
  const [minute, setMinute] = useState<number>(0);
  const [ampm, setAmPm] = useState<'AM' | 'PM'>('AM');
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [showConfetti, setShowConfetti] = useState(false);

  // Enhanced color options with icons
  const colors = [
    {
      name: 'blue',
      value: 'bg-blue-500',
      displayName: 'Blue',
      icon: Pill
    },
    {
      name: 'green',
      value: 'bg-green-500',
      displayName: 'Green',
      icon: Tablets
    },
    {
      name: 'peach',
      value: 'bg-orange-500',
      displayName: 'Peach',
      icon: Droplet
    },
    {
      name: 'purple',
      value: 'bg-purple-500',
      displayName: 'Purple',
      icon: Syringe
    },
    {
      name: 'teal',
      value: 'bg-sky-500',
      displayName: 'Teal',
      icon: BellRing
    },
    // New colors
    {
      name: 'red',
      value: 'bg-red-500',
      displayName: 'Red',
      icon: AlertCircle
    },
    {
      name: 'yellow',
      value: 'bg-yellow-400',
      displayName: 'Yellow',
      icon: Sparkles
    },
    {
      name: 'pink',
      value: 'bg-pink-400',
      displayName: 'Pink',
      icon: Heart
    },
    {
      name: 'gray',
      value: 'bg-gray-400',
      displayName: 'Gray',
      icon: Calendar
    },
    {
      name: 'brown',
      value: 'bg-amber-700',
      displayName: 'Brown',
      icon: Stethoscope
    }
  ];

  // Time presets with icons
  const timePresets = [
    { label: 'Morning', time: '08:00', icon: '🌅' },
    { label: 'Noon', time: '12:00', icon: '☀️' },
    { label: 'Evening', time: '18:00', icon: '🌆' },
    { label: 'Night', time: '22:00', icon: '🌙' }
  ];

  useEffect(() => {
    if (selectedTime) {
      const [hourStr, minuteStr] = selectedTime.split(':');
      let hourNum = parseInt(hourStr, 10);
      const minuteNum = parseInt(minuteStr, 10);
      const isAm = hourNum < 12;
      if (hourNum === 0) hourNum = 12;
      if (hourNum > 12) hourNum = hourNum - 12;
      setHour(hourNum);
      setMinute(minuteNum);
      setAmPm(isAm ? 'AM' : 'PM');
    }
  }, [selectedTime]);

  useEffect(() => {
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      setEndDate(formattedDate);
      setCalendarOpen(false);
    }
  }, [date]);

  useEffect(() => {
    if (frequency === 'daily') {
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]); // All days
    } else if (frequency === 'weekly') {
      setSelectedDays([0, 6]); // Saturday (6) and Sunday (0)
    } else if (frequency === 'monthly') {
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
    } else if (frequency === 'as-needed') {
      setSelectedDays([]); // No auto-selection
    }
  }, [frequency]);

  const updateSelectedTime = () => {
    let hourIn24 = hour;
    if (ampm === 'PM' && hour < 12) hourIn24 = hour + 12;
    if (ampm === 'AM' && hour === 12) hourIn24 = 0;
    const formattedHour = hourIn24.toString().padStart(2, '0');
    const formattedMinute = minute.toString().padStart(2, '0');
    setSelectedTime(`${formattedHour}:${formattedMinute}`);
    setTimePickerOpen(false);
  };

  const handleScheduleChange = (days: number[]) => {
    setSelectedDays(days);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error("Please enter a medication name", { duration: 3000, icon: <AlertCircle className="w-5 h-5 text-red-500" /> });
      return;
    }
    if (!dosage) {
      toast.error("Please enter a dosage amount", { duration: 3000, icon: <AlertCircle className="w-5 h-5 text-red-500" /> });
      return;
    }
    if (selectedDays.length === 0) {
      toast.error("Please select at least one day for your schedule", { duration: 3000, icon: <AlertCircle className="w-5 h-5 text-red-500" /> });
      return;
    }

    const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayNames = selectedDays.map(i => DAY_NAMES[i]);
    const userId = localStorage.getItem('userId');
    const payload = {
      name,
      dosage: `${dosage} ${dosageUnit}`,
      amount,
      amount_type: amountType,
      frequency,
      days: Array.isArray(dayNames) ? dayNames.join(',') : dayNames, // as string
      time: selectedTime,
      end_date: endDate || null,
      color: selectedColor,
      taken: false
      // DO NOT include owner_id here!
    };
    const response = await fetch(`http://127.0.0.1:8000/medications/?owner_id=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const newMedication = await response.json();
    addMedication(newMedication);
    setShowConfetti(true);
    toast.success("Great job! Medication added.", {
      duration: 3500,
      icon: <Check className="w-5 h-5 text-green-500" />
    });
    setTimeout(() => setShowConfetti(false), 2500);
    navigate('/dashboard');
  };

  const goToSearch = () => {
    navigate('/medicine-search');
  };

  const formatTimeDisplay = () => {
    return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  const formatDateDisplay = () => {
    if (date) {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    return 'Select end date';
  };

  return (
    <PageTransition className="app-container pb-20">
      {showConfetti && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <ConfettiExplosion particleCount={80} duration={2200} width={600} force={0.7} />
        </div>
      )}
      {/* Enhanced Header with Icon */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-full bg-primary/10">
            <Stethoscope className="h-6 w-6 text-primary" />
          </div>
          <h1 className="page-title text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
            Add Medication
          </h1>
        </div>
        <p className="text-muted-foreground text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Enter your medication details below to set up your reminders
        </p>
      </div>

      <Card className="border-none shadow-lg bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 overflow-hidden mb-8">
        <CardContent className="p-0">
          {!medicationData ? (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6"
            >
              <Button
                onClick={goToSearch}
                variant="outline"
                className="w-full flex items-center justify-center gap-3 h-16 text-lg border-dashed border-2 hover:bg-secondary/50 hover:border-primary transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                    <Pill className="h-4 w-4 text-primary absolute -top-1 -right-1 group-hover:rotate-12 transition-transform" />
                  </div>
                  <span className="font-medium">Enter Your Drug Name</span>
                </div>
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 border-b border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Info className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-medium">FDA Information for {medicationData.name}</h3>
                  <p className="text-sm text-muted-foreground">From the official FDA database</p>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                {medicationData.usage && (
                  <div className="p-4 rounded-lg bg-secondary/30 flex items-start gap-3">
                    <Pill className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h4 className="text-sm font-medium">Usage:</h4>
                      <p className="text-sm text-muted-foreground line-clamp-3 mt-1">{medicationData.usage}</p>
                    </div>
                  </div>
                )}

                {medicationData.dosage && (
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-start gap-3">
                    <Tablets className="h-5 w-5 text-green-500 mt-1" />
                    <div>
                      <h4 className="text-sm font-medium">Recommended Dosage:</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{medicationData.dosage}</p>
                    </div>
                  </div>
                )}

                {medicationData.warnings && (
                  <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/30 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-rose-500 mt-1" />
                    <div>
                      <h4 className="text-sm font-medium text-rose-600 dark:text-rose-400">Warnings:</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{medicationData.warnings}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Pill className="h-5 w-5 text-primary" />
                <label htmlFor="name" className="block text-sm font-medium">
                  Medication Name
                </label>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Aspirin, Lisinopril"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tablets className="h-5 w-5 text-primary" />
                  <label htmlFor="dosage" className="block text-sm font-medium">
                    Dosage
                  </label>
                </div>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    id="dosage"
                    value={dosage}
                    onChange={e => setDosage(e.target.value)}
                    placeholder="e.g. 10"
                    className="w-1/3 px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <select
                    className="w-2/3 px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={dosageUnit}
                    onChange={e => setDosageUnit(e.target.value)}
                  >
                    <option value="mg">mg - Milligram</option>
                    <option value="mcg">mcg - Microgram</option>
                    <option value="g">g - Gram</option>
                    <option value="ml">ml - Milliliter</option>
                    <option value="IU">IU - International Unit</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Droplet className="h-5 w-5 text-primary" />
                  <label htmlFor="amount" className="block text-sm font-medium">
                    Amount
                  </label>
                </div>
                <div className="flex space-x-3">
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="e.g. 1"
                    className="w-1/3 px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <select
                    className="w-2/3 px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={amountType}
                    onChange={e => setAmountType(e.target.value)}
                  >
                    <option value="tablet">Tablet</option>
                    <option value="capsule">Capsule</option>
                    <option value="pill">Pill</option>
                    <option value="injection">Injection</option>
                    <option value="drop">Drop</option>
                    <option value="puff">Puff</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarClock className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-lg">Schedule</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Repeat className="h-5 w-5 text-primary" />
                  <label className="block text-sm font-medium">
                    Frequency
                  </label>
                </div>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  value={frequency}
                  onChange={e => setFrequency(e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="as-needed">As needed</option>
                </select>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <label className="block text-sm font-medium">
                    Days of the Week
                  </label>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <Button
                      key={day}
                      type="button"
                      variant={selectedDays.includes(index) ? 'default' : 'outline'}
                      className={`h-12 w-full
                        ${selectedDays.includes(index) && (frequency === 'daily' || frequency === 'weekly') ? 'bg-green-500 text-white' : ''}
                        ${selectedDays.includes(index) && frequency === 'monthly' ? 'bg-gray-400 text-white' : ''}
                      `}
                      disabled={frequency !== 'as-needed'}
                      onClick={() => {
                        if (frequency === 'as-needed') {
                          const newDays = selectedDays.includes(index)
                            ? selectedDays.filter(d => d !== index)
                            : [...selectedDays, index];
                          handleScheduleChange(newDays);
                        }
                      }}
                    >
                      {day}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleScheduleChange([0,1,2,3,4,5,6])}
                  >
                    Every Day
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleScheduleChange([1,2,3,4,5])}
                  >
                    Weekdays
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleScheduleChange([0,6])}
                  >
                    Weekends
                  </Button>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <label className="block text-sm font-medium">
                    Time
                  </label>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  {timePresets.map(preset => (
                    <Button
                      key={preset.time}
                      type="button"
                      variant="outline"
                      className={`h-auto py-3 ${selectedTime === preset.time ? 'border-primary bg-primary/5' : ''}`}
                      onClick={() => setSelectedTime(preset.time)}
                    >
                      <div>
                        <div className="text-2xl mb-1">{preset.icon}</div>
                        <div className="font-medium">{preset.label}</div>
                        <div className="text-xs text-muted-foreground">{preset.time}</div>
                      </div>
                    </Button>
                  ))}
                </div>
                <Popover open={timePickerOpen} onOpenChange={setTimePickerOpen}>
                  <PopoverTrigger asChild>
                    <div className="relative">
                      <input
                        type="text"
                        value={formatTimeDisplay()}
                        readOnly
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                        onClick={() => setTimePickerOpen(true)}
                      />
                      <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="p-4 w-80 shadow-lg rounded-xl" align="start">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Hour</label>
                        <div className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setHour(prev => prev === 1 ? 12 : prev - 1)}
                            className="h-8 w-8 p-0"
                          >
                            -
                          </Button>
                          <span className="text-2xl font-semibold w-12 text-center">{hour}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setHour(prev => prev === 12 ? 1 : prev + 1)}
                            className="h-8 w-8 p-0"
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Minute</label>
                        <div className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setMinute(prev => prev === 0 ? 55 : prev - 5)}
                            className="h-8 w-8 p-0"
                          >
                            -
                          </Button>
                          <span className="text-2xl font-semibold w-12 text-center">
                            {minute.toString().padStart(2, '0')}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setMinute(prev => prev === 55 ? 0 : prev + 5)}
                            className="h-8 w-8 p-0"
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-2">
                        <Button
                          type="button"
                          variant={ampm === 'AM' ? 'default' : 'outline'}
                          className="flex-1"
                          onClick={() => setAmPm('AM')}
                        >
                          AM
                        </Button>
                        <Button
                          type="button"
                          variant={ampm === 'PM' ? 'default' : 'outline'}
                          className="flex-1"
                          onClick={() => setAmPm('PM')}
                        >
                          PM
                        </Button>
                      </div>
                      
                      <Button
                        type="button"
                        className="w-full mt-4"
                        onClick={updateSelectedTime}
                      >
                        Confirm Time
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CalendarClock className="h-5 w-5 text-primary" />
                  <label className="block text-sm font-medium">
                    End Date (Optional)
                  </label>
                </div>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <div className="relative">
                      <input
                        type="text"
                        value={formatDateDisplay()}
                        readOnly
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                        onClick={() => setCalendarOpen(true)}
                      />
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 shadow-lg rounded-xl" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="pointer-events-auto"
                      disabled={date => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-lg">Choose Color Tag</h3>
            </div>
            <div className="mb-4 border-b border-dashed border-gray-200 dark:border-gray-700" />
            <div className="grid grid-cols-5 gap-8 justify-items-center py-2">
              {colors.map(color => (
                <div key={color.name} className="relative flex flex-col items-center group">
                  <button
                    type="button"
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-150 focus:outline-none border-2
                      ${color.value} shadow-md
                      ${selectedColor === color.name ? 'ring-4 ring-primary border-primary' : 'border-gray-200 dark:border-gray-700'}
                      hover:shadow-lg hover:-translate-y-1
                    `}
                    onClick={() => setSelectedColor(color.name)}
                    aria-label={`Select ${color.displayName} color`}
                    tabIndex={0}
                  >
                    {selectedColor === color.name ? (
                      <Check className="w-6 h-6 text-white drop-shadow-lg" />
                    ) : (
                      <color.icon className="w-6 h-6 text-white opacity-80 drop-shadow" />
                    )}
                    {/* Tooltip */}
                    <span className="absolute left-1/2 -bottom-8 -translate-x-1/2 scale-0 group-hover:scale-100 group-focus:scale-100 transition-transform bg-gray-900 text-white text-xs rounded px-2 py-1 pointer-events-none z-20 whitespace-nowrap shadow-lg">
                      {color.displayName}
                      {color.name === 'blue' && (
                        <span className="ml-1 text-teal-300 font-semibold">(Recommended)</span>
                      )}
                    </span>
                  </button>
                  <span className="text-xs text-muted-foreground mt-3 font-medium">
                    {color.displayName}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="pt-6 pb-10">
          <motion.button
            whileTap={{ scale: 0.98 }}
            whileHover={{
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              y: -2
            }}
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl font-medium transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Save Medication
          </motion.button>
        </div>
      </form>
    </PageTransition>
  );
};

export default AddMedication;