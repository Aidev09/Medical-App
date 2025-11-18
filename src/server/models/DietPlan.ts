import mongoose, { Schema, Document } from 'mongoose';

export interface IMacros {
  protein: number; // grams
  carbohydrates: number; // grams
  fat: number; // grams
  fiber: number; // grams
  sugar: number; // grams
  sodium: number; // mg
}

export interface IMeal {
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  macros: IMacros;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
    calories?: number;
  }>;
  instructions: string[];
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
}

export interface IMealLog {
  date: Date;
  meals: Array<{
    mealId: mongoose.Types.ObjectId;
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    actualCalories?: number;
    notes?: string;
    consumedAt: Date;
  }>;
  totalCalories: number;
  totalMacros: IMacros;
  waterIntake: number; // ml
}

export interface IDietPlan extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  dailyCalories: number;
  macros: IMacros;
  dietaryRestrictions: string[];
  preferences: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
    lowCarb: boolean;
    lowSodium: boolean;
    keto: boolean;
    paleo: boolean;
  };
  meals: IMeal[];
  mealSchedule: {
    breakfastTime: string;
    lunchTime: string;
    dinnerTime: string;
    snackTimes: string[];
  };
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  adherence: {
    daysFollowed: number;
    totalDays: number;
    averageCalories: number;
    targetHitRate: number; // percentage of days hitting calorie target
  };
  mealLogs: IMealLog[];
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  calculateDailyMacros(): IMacros;
  addMealLog(mealLog: IMealLog): Promise<IMealLog>;
  calculateAdherence(): Promise<void>;
  getMealsForDate(date: Date): IMeal[];
}

const MacrosSchema: Schema = new Schema({
  protein: {
    type: Number,
    required: true,
    min: [0, 'Protein must be positive']
  },
  carbohydrates: {
    type: Number,
    required: true,
    min: [0, 'Carbohydrates must be positive']
  },
  fat: {
    type: Number,
    required: true,
    min: [0, 'Fat must be positive']
  },
  fiber: {
    type: Number,
    default: 0,
    min: [0, 'Fiber must be positive']
  },
  sugar: {
    type: Number,
    default: 0,
    min: [0, 'Sugar must be positive']
  },
  sodium: {
    type: Number,
    default: 0,
    min: [0, 'Sodium must be positive']
  }
}, { _id: false });

const IngredientSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Ingredient name cannot exceed 100 characters']
  },
  quantity: {
    type: Number,
    required: true,
    min: [0, 'Quantity must be positive']
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  calories: {
    type: Number,
    min: [0, 'Calories must be positive']
  }
}, { _id: false });

const MealSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Meal name cannot exceed 100 characters']
  },
  type: {
    type: String,
    enum: {
      values: ['breakfast', 'lunch', 'dinner', 'snack'],
      message: 'Meal type must be one of: breakfast, lunch, dinner, snack'
    },
    required: true
  },
  calories: {
    type: Number,
    required: true,
    min: [0, 'Calories must be positive']
  },
  macros: {
    type: MacrosSchema,
    required: true
  },
  ingredients: [IngredientSchema],
  instructions: {
    type: [String],
    validate: {
      validator: function(v: string[]) {
        return v.length > 0;
      },
      message: 'At least one instruction is required'
    }
  },
  prepTime: {
    type: Number,
    min: [0, 'Prep time must be positive'],
    default: 0
  },
  cookTime: {
    type: Number,
    min: [0, 'Cook time must be positive'],
    default: 0
  },
  servings: {
    type: Number,
    required: true,
    min: [1, 'Servings must be at least 1']
  }
}, { _id: true });

const MealLogEntrySchema: Schema = new Schema({
  mealId: {
    type: Schema.Types.ObjectId,
    ref: 'Meal',
    required: true
  },
  type: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  actualCalories: {
    type: Number,
    min: [0, 'Calories must be positive']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  consumedAt: {
    type: Date,
    required: true,
    default: Date.now
  }
}, { _id: false });

const MealLogSchema: Schema = new Schema({
  date: {
    type: Date,
    required: true
  },
  meals: [MealLogEntrySchema],
  totalCalories: {
    type: Number,
    default: 0,
    min: [0, 'Total calories must be positive']
  },
  totalMacros: {
    type: MacrosSchema,
    default: () => ({})
  },
  waterIntake: {
    type: Number,
    default: 0,
    min: [0, 'Water intake must be positive']
  }
}, { _id: false });

const DietPlanSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true,
    maxlength: [100, 'Plan name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  dailyCalories: {
    type: Number,
    required: [true, 'Daily calories are required'],
    min: [800, 'Daily calories must be at least 800'],
    max: [5000, 'Daily calories cannot exceed 5000']
  },
  macros: {
    type: MacrosSchema,
    required: true,
    validate: {
      validator: function(v: IMacros) {
        // Check if macros roughly add up to calories
        const totalMacroCalories = (v.protein * 4) + (v.carbohydrates * 4) + (v.fat * 9);
        const variance = Math.abs(totalMacroCalories - this.dailyCalories);
        return variance <= (this.dailyCalories * 0.1); // Allow 10% variance
      },
      message: 'Macros should roughly match daily calories'
    }
  },
  dietaryRestrictions: [{
    type: String,
    trim: true,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'soy-free', 'kosher', 'halal']
  }],
  preferences: {
    vegetarian: { type: Boolean, default: false },
    vegan: { type: Boolean, default: false },
    glutenFree: { type: Boolean, default: false },
    dairyFree: { type: Boolean, default: false },
    lowCarb: { type: Boolean, default: false },
    lowSodium: { type: Boolean, default: false },
    keto: { type: Boolean, default: false },
    paleo: { type: Boolean, default: false }
  },
  meals: [MealSchema],
  mealSchedule: {
    breakfastTime: {
      type: String,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      default: '08:00'
    },
    lunchTime: {
      type: String,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      default: '12:00'
    },
    dinnerTime: {
      type: String,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      default: '18:00'
    },
    snackTimes: [{
      type: String,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    }]
  },
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
  isActive: {
    type: Boolean,
    default: true
  },
  adherence: {
    daysFollowed: { type: Number, default: 0, min: 0 },
    totalDays: { type: Number, default: 0, min: 0 },
    averageCalories: { type: Number, default: 0, min: 0 },
    targetHitRate: { type: Number, default: 0, min: 0, max: 100 }
  },
  mealLogs: [MealLogSchema]
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
DietPlanSchema.index({ user: 1, isActive: 1 });
DietPlanSchema.index({ user: 1, startDate: -1 });
DietPlanSchema.index({ user: 1, 'mealLogs.date': -1 });

// Virtual fields
DietPlanSchema.virtual('currentStreak').get(function(this: IDietPlan) {
  if (this.mealLogs.length === 0) return 0;

  const sortedLogs = [...this.mealLogs].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const log of sortedLogs) {
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);

    const dayDifference = Math.abs(currentDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);

    if (dayDifference <= streak && log.totalCalories > 0) {
      streak++;
      currentDate = new Date(logDate);
    } else {
      break;
    }
  }

  return streak;
});

DietPlanSchema.virtual('mealsByType').get(function(this: IDietPlan) {
  return this.meals.reduce((acc, meal) => {
    if (!acc[meal.type]) acc[meal.type] = [];
    acc[meal.type].push(meal);
    return acc;
  }, {} as Record<string, IMeal[]>);
});

// Instance methods

// Calculate daily macros based on meals
DietPlanSchema.methods.calculateDailyMacros = function(): IMacros {
  const meals = this.getMealsForDate(new Date());

  return meals.reduce((acc: IMacros, meal) => {
    acc.protein += meal.macros.protein;
    acc.carbohydrates += meal.macros.carbohydrates;
    acc.fat += meal.macros.fat;
    acc.fiber += meal.macros.fiber;
    acc.sugar += meal.macros.sugar;
    acc.sodium += meal.macros.sodium;
    return acc;
  }, {
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0
  });
};

// Add meal log
DietPlanSchema.methods.addMealLog = async function(mealLog: IMealLog): Promise<IMealLog> {
  this.mealLogs.push(mealLog);
  await this.calculateAdherence();
  return mealLog;
};

// Calculate adherence statistics
DietPlanSchema.methods.calculateAdherence = async function(): Promise<void> {
  const activeDays = this.mealLogs.filter(log => log.totalCalories > 0).length;
  const totalDays = Math.max(1, this.mealLogs.length);

  const targetHitDays = this.mealLogs.filter(log => {
    const variance = Math.abs(log.totalCalories - this.dailyCalories);
    return variance <= (this.dailyCalories * 0.1); // Within 10% of target
  }).length;

  this.adherence = {
    daysFollowed: activeDays,
    totalDays,
    averageCalories: this.mealLogs.reduce((sum, log) => sum + log.totalCalories, 0) / totalDays,
    targetHitRate: Math.round((targetHitDays / totalDays) * 100)
  };
};

// Get meals for specific date
DietPlanSchema.methods.getMealsForDate = function(date: Date): IMeal[] {
  const dayOfWeek = date.getDay();

  // For simplicity, return all meals. In a real implementation,
  // you might have meal schedules per day of the week
  return this.meals;
};

// Static methods

// Find active diet plan for user
DietPlanSchema.statics.findActiveByUser = function(userId: string) {
  return this.findOne({ user: userId, isActive: true }).sort({ startDate: -1 });
};

// Get meal logs for date range
DietPlanSchema.statics.getMealLogsInRange = function(
  planId: string,
  startDate: Date,
  endDate: Date
) {
  return this.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(planId) } },
    { $unwind: '$mealLogs' },
    {
      $match: {
        'mealLogs.date': { $gte: startDate, $lte: endDate }
      }
    },
    { $sort: { 'mealLogs.date': 1 } },
    {
      $group: {
        _id: '$_id',
        plan: { $first: '$$ROOT' },
        logs: { $push: '$mealLogs' }
      }
    }
  ]);
};

export default mongoose.model<IDietPlan>('DietPlan', DietPlanSchema);