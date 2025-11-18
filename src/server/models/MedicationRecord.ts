import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicationReminder {
  time: string; // HH:mm format
  days: number[]; // 0-6 (Sunday to Saturday)
  enabled: boolean;
}

export interface IMedicationIntake {
  takenAt: Date;
  notes?: string;
  scheduledTime: string;
}

export interface IMedicationRecord extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  dosage: string;
  frequency: 'once' | 'twice' | 'three_times' | 'four_times' | 'as_needed';
  reminders: IMedicationReminder[];
  startDate: Date;
  endDate?: Date;
  notes?: string;
  rxNormId?: string;
  active: boolean;
  adherence: {
    totalScheduled: number;
    totalTaken: number;
    streak: number;
    lastTaken?: Date;
  };
  intakes: IMedicationIntake[];
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  calculateAdherenceRate(): number;
  recordIntake(notes?: string): Promise<IMedicationIntake>;
  updateStreak(): Promise<number>;
}

const MedicationReminderSchema: Schema = new Schema({
  time: {
    type: String,
    required: true,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    validate: {
      validator: function(v: string) {
        const [hours, minutes] = v.split(':').map(Number);
        return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
      },
      message: 'Time must be in HH:mm format (24-hour)'
    }
  },
  days: {
    type: [Number],
    required: true,
    validate: {
      validator: function(v: number[]) {
        return v.length > 0 && v.every(day => day >= 0 && day <= 6);
      },
      message: 'At least one day must be selected (0-6, Sunday to Saturday)'
    }
  },
  enabled: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const MedicationIntakeSchema: Schema = new Schema({
  takenAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: 500
  },
  scheduledTime: {
    type: String,
    required: true
  }
}, { _id: false });

const MedicationRecordSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Medication name is required'],
    trim: true,
    maxlength: [100, 'Medication name cannot exceed 100 characters']
  },
  dosage: {
    type: String,
    required: [true, 'Dosage is required'],
    trim: true,
    maxlength: [50, 'Dosage cannot exceed 50 characters']
  },
  frequency: {
    type: String,
    enum: {
      values: ['once', 'twice', 'three_times', 'four_times', 'as_needed'],
      message: 'Frequency must be one of: once, twice, three_times, four_times, as_needed'
    },
    required: [true, 'Frequency is required']
  },
  reminders: [MedicationReminderSchema],
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(v: Date) {
        return !v || v > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  rxNormId: {
    type: String,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  },
  adherence: {
    totalScheduled: {
      type: Number,
      default: 0,
      min: 0
    },
    totalTaken: {
      type: Number,
      default: 0,
      min: 0
    },
    streak: {
      type: Number,
      default: 0,
      min: 0
    },
    lastTaken: {
      type: Date
    }
  },
  intakes: [MedicationIntakeSchema]
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better performance
MedicationRecordSchema.index({ user: 1, active: 1 });
MedicationRecordSchema.index({ user: 1, 'adherence.lastTaken': 1 });
MedicationRecordSchema.index({ user: 1, name: 'text', notes: 'text' });
MedicationRecordSchema.index({ rxNormId: 1 });

// Virtual fields
MedicationRecordSchema.virtual('adherenceRate').get(function(this: IMedicationRecord) {
  if (this.adherence.totalScheduled === 0) return 0;
  return Math.round((this.adherence.totalTaken / this.adherence.totalScheduled) * 100);
});

MedicationRecordSchema.virtual('nextDose').get(function(this: IMedicationRecord) {
  if (!this.active || !this.reminders.length) return null;

  const now = new Date();
  const today = now.getDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  // Sort reminders by time
  const todayReminders = this.reminders
    .filter(reminder => reminder.enabled && reminder.days.includes(today))
    .sort((a, b) => {
      const [aHours, aMinutes] = a.time.split(':').map(Number);
      const [bHours, bMinutes] = b.time.split(':').map(Number);
      return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes);
    });

  // Find next reminder for today
  for (const reminder of todayReminders) {
    const [hours, minutes] = reminder.time.split(':').map(Number);
    const reminderMinutes = hours * 60 + minutes;
    if (reminderMinutes > currentTime) {
      const nextDose = new Date(now);
      nextDose.setHours(hours, minutes, 0, 0);
      return nextDose;
    }
  }

  // If no reminders left today, find first reminder for tomorrow
  if (todayReminders.length > 0) {
    const [hours, minutes] = todayReminders[0].time.split(':').map(Number);
    const nextDose = new Date(now);
    nextDose.setDate(nextDose.getDate() + 1);
    nextDose.setHours(hours, minutes, 0, 0);
    return nextDose;
  }

  return null;
});

// Pre-save middleware to update adherence
MedicationRecordSchema.pre('save', function(next) {
  if (this.isModified('intakes')) {
    this.adherence.totalTaken = this.intakes.length;
    this.adherence.lastTaken = this.intakes.length > 0
      ? this.intakes[this.intakes.length - 1].takenAt
      : undefined;
  }
  next();
});

// Instance methods

// Calculate adherence rate
MedicationRecordSchema.methods.calculateAdherenceRate = function(): number {
  if (this.adherence.totalScheduled === 0) return 0;
  return Math.round((this.adherence.totalTaken / this.adherence.totalScheduled) * 100);
};

// Record medication intake
MedicationRecordSchema.methods.recordIntake = async function(notes?: string): Promise<IMedicationIntake> {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const intake: IMedicationIntake = {
    takenAt: now,
    notes,
    scheduledTime: currentTime
  };

  this.intakes.push(intake);
  this.adherence.totalTaken = this.intakes.length;
  this.adherence.lastTaken = now;

  await this.updateStreak();

  return intake;
};

// Update adherence streak
MedicationRecordSchema.methods.updateStreak = async function(): Promise<number> {
  if (this.intakes.length === 0) {
    this.adherence.streak = 0;
    return 0;
  }

  // Sort intakes by date (newest first)
  const sortedIntakes = [...this.intakes].sort((a, b) =>
    new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime()
  );

  let streak = 1;
  let currentDate = new Date(sortedIntakes[0].takenAt);
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 1; i < sortedIntakes.length; i++) {
    const intakeDate = new Date(sortedIntakes[i].takenAt);
    intakeDate.setHours(0, 0, 0, 0);

    const dayDifference = Math.abs(currentDate.getTime() - intakeDate.getTime()) / (1000 * 60 * 60 * 24);

    if (dayDifference === 1) {
      streak++;
      currentDate = intakeDate;
    } else if (dayDifference > 1) {
      break;
    }
  }

  this.adherence.streak = streak;
  return streak;
};

// Static methods

// Find active medications for user
MedicationRecordSchema.statics.findActiveByUser = function(userId: string) {
  return this.find({ user: userId, active: true }).sort({ createdAt: -1 });
};

// Find medications due for user
MedicationRecordSchema.statics.findMedicationsDue = function(userId: string, date: Date = new Date()) {
  const dayOfWeek = date.getDay();
  const currentTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

  return this.find({
    user: userId,
    active: true,
    $or: [
      { startDate: { $lte: date } },
      { startDate: { $exists: false } }
    ],
    $and: [
      {
        $or: [
          { endDate: { $gte: date } },
          { endDate: { $exists: false } }
        ]
      }
    ],
    'reminders.days': dayOfWeek,
    'reminders.enabled': true
  });
};

export default mongoose.model<IMedicationRecord>('MedicationRecord', MedicationRecordSchema); 