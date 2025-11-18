import { DataTypes, Model, Sequelize, Op } from 'sequelize';

export interface IMacros {
  protein: number; // grams
  carbohydrates: number; // grams
  fat: number; // grams
  fiber: number; // grams
  sugar: number; // grams
  sodium: number; // mg
}

export interface IMeal {
  id?: number;
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
  id?: number;
  dietPlanId: number;
  date: Date;
  meals: Array<{
    mealId?: number;
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    actualCalories?: number;
    notes?: string;
    consumedAt: Date;
  }>;
  totalCalories: number;
  totalMacros: IMacros;
  waterIntake: number; // ml
}

export interface IDietPlanAttributes {
  id: number;
  userId: number;
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
  currentStreak?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDietPlanCreationAttributes extends Omit<IDietPlanAttributes, 'id' | 'createdAt' | 'updatedAt' | 'currentStreak'> {}

class DietPlan extends Model<IDietPlanAttributes, IDietPlanCreationAttributes> implements IDietPlanAttributes {
  public id!: number;
  public userId!: number;
  public name!: string;
  public description?: string;
  public dailyCalories!: number;
  public macros!: IMacros;
  public dietaryRestrictions!: string[];
  public preferences!: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
    lowCarb: boolean;
    lowSodium: boolean;
    keto: boolean;
    paleo: boolean;
  };
  public meals!: IMeal[];
  public mealSchedule!: {
    breakfastTime: string;
    lunchTime: string;
    dinnerTime: string;
    snackTimes: string[];
  };
  public startDate!: Date;
  public endDate?: Date;
  public isActive!: boolean;
  public adherence!: {
    daysFollowed: number;
    totalDays: number;
    averageCalories: number;
    targetHitRate: number;
  };
  public currentStreak!: number;
  public createdAt!: Date;
  public updatedAt!: Date;

  // Instance methods
  public calculateDailyMacros(): IMacros {
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
  }

  public async addMealLog(mealLog: Omit<IMealLog, 'id' | 'dietPlanId'>): Promise<IMealLog> {
    // This would typically create a separate MealLog record
    // For now, we'll simulate the functionality
    const newMealLog: IMealLog = {
      ...mealLog,
      dietPlanId: this.id,
      id: 0 // Would be set by database
    };

    await this.calculateAdherence();
    return newMealLog;
  }

  public async calculateAdherence(): Promise<void> {
    // This would typically query meal logs and calculate adherence
    // For now, we'll set basic values
    this.adherence = {
      daysFollowed: this.adherence?.daysFollowed || 0,
      totalDays: this.adherence?.totalDays || 1,
      averageCalories: this.dailyCalories,
      targetHitRate: 85 // Example value
    };

    await this.save();
  }

  public getMealsForDate(date: Date): IMeal[] {
    // For simplicity, return all meals. In a real implementation,
    // you might have meal schedules per day of the week
    return this.meals;
  }

  public getMealsByType(): Record<string, IMeal[]> {
    return this.meals.reduce((acc, meal) => {
      if (!acc[meal.type]) acc[meal.type] = [];
      acc[meal.type].push(meal);
      return acc;
    }, {} as Record<string, IMeal[]>);
  }

  // Static methods will be added after model initialization
}

export const initDietPlanModel = (sequelize: Sequelize) => {
  DietPlan.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    dailyCalories: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [800],
          msg: 'Daily calories must be at least 800'
        },
        max: {
          args: [5000],
          msg: 'Daily calories cannot exceed 5000'
        }
      }
    },
    macros: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        isValidMacros(value: IMacros) {
          if (!value.protein || !value.carbohydrates || !value.fat) {
            throw new Error('Protein, carbohydrates, and fat are required');
          }
          if (value.protein < 0 || value.carbohydrates < 0 || value.fat < 0) {
            throw new Error('Macro values must be positive');
          }
          // Check if macros roughly add up to calories
          const totalMacroCalories = (value.protein * 4) + (value.carbohydrates * 4) + (value.fat * 9);
          const variance = Math.abs(totalMacroCalories - this.dailyCalories);
          if (variance > (this.dailyCalories * 0.1)) {
            throw new Error('Macros should roughly match daily calories');
          }
        }
      }
    },
    dietaryRestrictions: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    preferences: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        vegetarian: false,
        vegan: false,
        glutenFree: false,
        dairyFree: false,
        lowCarb: false,
        lowSodium: false,
        keto: false,
        paleo: false
      }
    },
    meals: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    mealSchedule: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        breakfastTime: '08:00',
        lunchTime: '12:00',
        dinnerTime: '18:00',
        snackTimes: []
      },
      validate: {
        isValidTimeFormat(value: any) {
          const timeFields = ['breakfastTime', 'lunchTime', 'dinnerTime'];
          for (const field of timeFields) {
            if (value[field] && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value[field])) {
              throw new Error(`Invalid time format for ${field}`);
            }
          }
        }
      }
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isAfterStart(value: Date) {
          if (value && this.startDate && value <= this.startDate) {
            throw new Error('End date must be after start date');
          }
        }
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    adherence: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        daysFollowed: 0,
        totalDays: 0,
        averageCalories: 0,
        targetHitRate: 0
      }
    },
    currentStreak: {
      type: DataTypes.VIRTUAL,
      get() {
        // This would typically calculate based on meal logs
        return this.adherence?.daysFollowed || 0;
      }
    }
  }, {
    sequelize,
    modelName: 'DietPlan',
    tableName: 'diet_plans',
    timestamps: true,
    indexes: [
      {
        fields: ['userId', 'isActive']
      },
      {
        fields: ['userId', 'startDate']
      }
    ],
    hooks: {
      beforeValidate: (dietPlan: DietPlan) => {
        // Additional validation can be added here
      }
    }
  });

  // Static methods
  DietPlan.findActiveByUser = function(userId: number) {
    return this.findOne({
      where: { userId, isActive: true },
      order: [['startDate', 'DESC']]
    });
  };

  DietPlan.getMealLogsInRange = async function(
    planId: number,
    startDate: Date,
    endDate: Date
  ) {
    // This would typically query a separate MealLog table
    // For now, return the diet plan with filtered logs
    const plan = await this.findByPk(planId);
    if (!plan) return null;

    return {
      plan,
      logs: [] // Would be populated from MealLog table
    };
  };

  return DietPlan;
};

export default DietPlan;