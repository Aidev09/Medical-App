import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicationRecord extends Document {
  userId: mongoose.Types.ObjectId;
  medicationName: string;
  dosage: string;
  timeScheduled: Date;
  timeTaken: Date;
  status: 'scheduled' | 'taken' | 'missed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MedicationRecordSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicationName: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  timeScheduled: {
    type: Date,
    required: true
  },
  timeTaken: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['scheduled', 'taken', 'missed'],
    default: 'scheduled'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
MedicationRecordSchema.index({ userId: 1, timeScheduled: 1 });
MedicationRecordSchema.index({ userId: 1, status: 1 });

export default mongoose.model<IMedicationRecord>('MedicationRecord', MedicationRecordSchema); 