import mongoose, { Schema, Document } from 'mongoose';

export interface IHealthMetric extends Document {
  user: mongoose.Types.ObjectId;
  type: 'bloodPressure' | 'weight' | 'heartRate' | 'bloodSugar' | 'temperature';
  value: number;
  unit: string;
  timestamp: Date;
  notes?: string;
  source: 'manual' | 'device' | 'automatic';
  metadata?: {
    systolic?: number; // For blood pressure
    diastolic?: number; // For blood pressure
    position?: 'sitting' | 'standing' | 'lying'; // For blood pressure
    device?: string; // Device used for measurement
    location?: string; // Body location for measurement
  };
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  isWithinRange(): boolean;
  getCategory(): 'low' | 'normal' | 'high' | 'critical';
  getDisplayValue(): string;
}

const HealthMetricSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  type: {
    type: String,
    enum: {
      values: ['bloodPressure', 'weight', 'heartRate', 'bloodSugar', 'temperature'],
      message: 'Type must be one of: bloodPressure, weight, heartRate, bloodSugar, temperature'
    },
    required: [true, 'Metric type is required']
  },
  value: {
    type: Number,
    required: [true, 'Value is required'],
    min: [0, 'Value must be positive']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    validate: {
      validator: function(this: IHealthMetric, v: string) {
        // Validate unit based on metric type
        const validUnits = {
          bloodPressure: ['mmHg'],
          weight: ['kg', 'lbs'],
          heartRate: ['bpm'],
          bloodSugar: ['mg/dL', 'mmol/L'],
          temperature: ['celsius', 'fahrenheit']
        };
        return validUnits[this.type]?.includes(v) || false;
      },
      message: 'Invalid unit for this metric type'
    }
  },
  timestamp: {
    type: Date,
    required: [true, 'Timestamp is required'],
    default: Date.now,
    validate: {
      validator: function(v: Date) {
        return v <= new Date();
      },
      message: 'Timestamp cannot be in the future'
    }
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  source: {
    type: String,
    enum: {
      values: ['manual', 'device', 'automatic'],
      message: 'Source must be one of: manual, device, automatic'
    },
    default: 'manual'
  },
  metadata: {
    systolic: {
      type: Number,
      min: [0, 'Systolic must be positive'],
      max: [300, 'Systolic seems too high']
    },
    diastolic: {
      type: Number,
      min: [0, 'Diastolic must be positive'],
      max: [200, 'Diastolic seems too high']
    },
    position: {
      type: String,
      enum: ['sitting', 'standing', 'lying']
    },
    device: {
      type: String,
      maxlength: [100, 'Device name cannot exceed 100 characters']
    },
    location: {
      type: String,
      maxlength: [50, 'Location cannot exceed 50 characters']
    }
  }
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
HealthMetricSchema.index({ user: 1, type: 1, timestamp: -1 });
HealthMetricSchema.index({ user: 1, timestamp: -1 });
HealthMetricSchema.index({ type: 1, timestamp: -1 });

// Validation for blood pressure (requires systolic and diastolic)
HealthMetricSchema.pre('validate', function(next) {
  if (this.type === 'bloodPressure') {
    if (!this.metadata || !this.metadata.systolic || !this.metadata.diastolic) {
      this.invalidate('metadata.systolic', 'Blood pressure requires both systolic and diastolic values');
    } else {
      // Set value to average of systolic and diastolic for sorting purposes
      this.value = (this.metadata.systolic + this.metadata.diastolic) / 2;
    }
  }
  next();
});

// Virtual fields
HealthMetricSchema.virtual('displayValue').get(function(this: IHealthMetric) {
  return this.getDisplayValue();
});

HealthMetricSchema.virtual('isNormal').get(function(this: IHealthMetric) {
  return this.getCategory() === 'normal';
});

// Instance methods

// Check if value is within normal range
HealthMetricSchema.methods.isWithinRange = function(): boolean {
  return this.getCategory() === 'normal';
};

// Get category (low, normal, high, critical)
HealthMetricSchema.methods.getCategory = function(): 'low' | 'normal' | 'high' | 'critical' {
  switch (this.type) {
    case 'bloodPressure':
      if (this.metadata?.systolic && this.metadata?.diastolic) {
        const systolic = this.metadata.systolic;
        const diastolic = this.metadata.diastolic;

        if (systolic < 90 || diastolic < 60) return 'low';
        if (systolic >= 180 || diastolic >= 120) return 'critical';
        if (systolic >= 140 || diastolic >= 90) return 'high';
        return 'normal';
      }
      return 'normal';

    case 'weight':
      // Weight categories depend on height, so we'll return normal by default
      // This would need additional logic if height is tracked
      return 'normal';

    case 'heartRate':
      if (this.value < 60) return 'low';
      if (this.value >= 120) return 'critical';
      if (this.value >= 100) return 'high';
      return 'normal';

    case 'bloodSugar':
      if (this.unit === 'mg/dL') {
        if (this.value < 70) return 'low';
        if (this.value >= 250) return 'critical';
        if (this.value >= 126) return 'high';
        return 'normal';
      } else { // mmol/L
        if (this.value < 3.9) return 'low';
        if (this.value >= 13.9) return 'critical';
        if (this.value >= 7.0) return 'high';
        return 'normal';
      }

    case 'temperature':
      if (this.unit === 'celsius') {
        if (this.value < 35.0) return 'low';
        if (this.value >= 40.0) return 'critical';
        if (this.value >= 38.0) return 'high';
        return 'normal';
      } else { // fahrenheit
        if (this.value < 95.0) return 'low';
        if (this.value >= 104.0) return 'critical';
        if (this.value >= 100.4) return 'high';
        return 'normal';
      }

    default:
      return 'normal';
  }
};

// Get formatted display value
HealthMetricSchema.methods.getDisplayValue = function(): string {
  switch (this.type) {
    case 'bloodPressure':
      if (this.metadata?.systolic && this.metadata?.diastolic) {
        return `${this.metadata.systolic}/${this.metadata.diastolic} ${this.unit}`;
      }
      return `${this.value} ${this.unit}`;

    default:
      return `${this.value} ${this.unit}`;
  }
};

// Static methods

// Get metrics by user and type within date range
HealthMetricSchema.statics.findByUserAndType = function(
  userId: string,
  type: string,
  startDate?: Date,
  endDate?: Date
) {
  const query: any = { user: userId, type };

  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = startDate;
    if (endDate) query.timestamp.$lte = endDate;
  }

  return this.find(query).sort({ timestamp: -1 });
};

// Get latest metric of each type for user
HealthMetricSchema.statics.getLatestMetrics = function(userId: string) {
  return this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $sort: { timestamp: -1 } },
    { $group: {
      _id: '$type',
      latest: { $first: '$$ROOT' }
    }},
    { $replaceRoot: { newRoot: '$latest' } }
  ]);
};

// Calculate statistics for user metrics
HealthMetricSchema.statics.calculateStats = function(
  userId: string,
  type: string,
  startDate?: Date,
  endDate?: Date
) {
  const matchStage: any = { user: new mongoose.Types.ObjectId(userId), type };

  if (startDate || endDate) {
    matchStage.timestamp = {};
    if (startDate) matchStage.timestamp.$gte = startDate;
    if (endDate) matchStage.timestamp.$lte = endDate;
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        average: { $avg: '$value' },
        min: { $min: '$value' },
        max: { $max: '$value' },
        latest: { $last: '$value' },
        earliest: { $first: '$value' }
      }
    }
  ]);
};

// Get trends over time
HealthMetricSchema.statics.getTrends = function(
  userId: string,
  type: string,
  days: number = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        type,
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        },
        value: { $avg: '$value' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
};

export default mongoose.model<IHealthMetric>('HealthMetric', HealthMetricSchema);