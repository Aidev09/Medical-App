import express from 'express';
import { validateRequest, validationSchemas } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import DietPlan from '../models/DietPlan.js';

const router = express.Router();

// All diet routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/diet/plans:
 *   get:
 *     summary: Get user's diet plans
 *     tags: [Diet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Diet plans retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/plans', async (req: any, res, next) => {
  try {
    const userId = req.user._id;

    const plans = await DietPlan.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    const currentPlan = await DietPlan.findOne({
      where: { userId, isActive: true }
    });

    res.json({
      success: true,
      data: {
        plans: plans.map(plan => ({
          ...plan.toJSON(),
          currentStreak: plan.currentStreak || 0
        })),
        currentPlan
      }
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * @swagger
 * /api/diet/plans:
 *   post:
 *     summary: Create a new diet plan
 *     tags: [Diet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, targetCalories]
 *             properties:
 *               name:
 *                 type: string
 *               targetCalories:
 *                 type: number
 *               dietaryRestrictions:
 *                 type: array
 *                 items:
 *                   type: string
 *               preferences:
 *                 type: object
 *                 properties:
 *                   vegetarian:
 *                     type: boolean
 *                   vegan:
 *                     type: boolean
 *                   glutenFree:
 *                     type: boolean
 *                   dairyFree:
 *                     type: boolean
 *                   lowCarb:
 *                     type: boolean
 *                   lowSodium:
 *                     type: boolean
 *     responses:
 *       201:
 *         description: Diet plan created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/plans', validateRequest(validationSchemas.createDietPlan), async (req: any, res, next) => {
  try {
    const { name, targetCalories, dietaryRestrictions, preferences } = req.body;
    const userId = req.user._id;

    // Deactivate other plans if this is active
    await DietPlan.update(
      { isActive: false },
      { where: { userId, isActive: true } }
    );

    const plan = await DietPlan.create({
      userId,
      name,
      targetCalories,
      dietaryRestrictions: dietaryRestrictions || [],
      preferences: preferences || {},
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Diet plan created successfully',
      data: { plan }
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * @swagger
 * /api/diet/calculator:
 *   get:
 *     summary: Calculate BMR and TDEE
 *     tags: [Diet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: weight
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: height
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: age
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: gender
 *         required: true
 *         schema:
 *           type: string
 *           enum: [male, female, other]
 *       - in: query
 *         name: activityLevel
 *         required: true
 *         schema:
 *           type: string
 *           enum: [sedentary, lightly_active, moderately_active, very_active, extremely_active]
 *     responses:
 *       200:
 *         description: Calculations completed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get('/calculator', validateRequest(validationSchemas.calculateDiet), async (req, res, next) => {
  try {
    const { weight, height, age, gender, activityLevel } = req.query;

    // Mifflin-St Jeor Equation for BMR
    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age) + 5;
    } else {
      bmr = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age) - 161;
    }

    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };

    const tdee = bmr * activityMultipliers[activityLevel as keyof typeof activityMultipliers];

    // Calculate macronutrient recommendations (40-30-30 split for protein-carbs-fat)
    const protein = Math.round((tdee * 0.3) / 4); // 30% of calories from protein (4 calories per gram)
    const carbs = Math.round((tdee * 0.4) / 4); // 40% of calories from carbs (4 calories per gram)
    const fat = Math.round((tdee * 0.3) / 9); // 30% of calories from fat (9 calories per gram)

    res.json({
      success: true,
      data: {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        recommendedCalories: Math.round(tdee),
        macros: {
          protein,
          carbohydrates: carbs,
          fat,
          fiber: 25, // Recommended daily fiber
          sodium: 2300 // Maximum recommended sodium (mg)
        }
      }
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * @swagger
 * /api/diet/meal-log:
 *   post:
 *     summary: Log a meal
 *     tags: [Diet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [meal, foods]
 *             properties:
 *               meal:
 *                 type: string
 *                 enum: [breakfast, lunch, dinner, snack]
 *               foods:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     unit:
 *                       type: string
 *                     calories:
 *                       type: number
 *               calories:
 *                 type: number
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Meal logged successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/meal-log', validateRequest(validationSchemas.logMeal), async (req: any, res, next) => {
  try {
    const { meal, foods, calories, timestamp } = req.body;
    const userId = req.user._id;

    // Find active diet plan
    const plan = await DietPlan.findOne({
      where: { userId, isActive: true }
    });

    if (!plan) {
      return res.status(400).json({
        success: false,
        error: 'No active diet plan found'
      });
    }

    // Calculate nutrition from foods if not provided
    const totalCalories = calories || foods.reduce((sum: number, food: any) => sum + (food.calories || 0), 0);

    // Create meal log entry
    const mealLog = {
      date: new Date(timestamp || new Date()),
      meals: [{
        mealId: null, // Could reference specific meal from plan
        type: meal,
        actualCalories: totalCalories,
        notes: '',
        consumedAt: new Date(timestamp || new Date())
      }],
      totalCalories,
      totalMacros: {
        protein: 0, // Calculate from foods if needed
        carbohydrates: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0
      },
      waterIntake: 0
    };

    // Add meal log to plan
    plan.mealLogs = [...(plan.mealLogs || []), mealLog];
    await plan.calculateAdherence();
    await plan.save();

    res.status(201).json({
      success: true,
      message: 'Meal logged successfully',
      data: {
        mealLog,
        dailySummary: {
          targetCalories: plan.targetCalories,
          consumedCalories: totalCalories,
          remainingCalories: plan.targetCalories - totalCalories
        }
      }
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * @swagger
 * /api/diet/meal-suggestions:
 *   get:
 *     summary: Get meal suggestions based on criteria
 *     tags: [Diet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: mealType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [breakfast, lunch, dinner, snack]
 *       - in: query
 *         name: calories
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: dietaryRestrictions
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Meal suggestions retrieved successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get('/meal-suggestions', async (req: any, res, next) => {
  try {
    const { mealType, calories, dietaryRestrictions } = req.query;
    const userId = req.user._id;

    // Get user's active diet plan
    const plan = await DietPlan.findOne({
      where: { userId, isActive: true }
    });

    const targetCalories = Number(calories) || 400;
    const restrictions = dietaryRestrictions ? dietaryRestrictions.split(',') : [];

    // Generate mock meal suggestions based on preferences
    const suggestions = generateMealSuggestions(
      mealType as string,
      targetCalories,
      restrictions,
      plan?.preferences
    );

    res.json({
      success: true,
      data: { suggestions }
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * @swagger
 * /api/diet/nutrition-summary:
 *   get:
 *     summary: Get nutrition summary for a date range
 *     tags: [Diet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Nutrition summary retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/nutrition-summary', async (req: any, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user._id;

    const plan = await DietPlan.findOne({
      where: { userId, isActive: true }
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'No active diet plan found'
      });
    }

    // Filter meal logs by date range
    const filteredLogs = plan.mealLogs.filter((log: any) => {
      const logDate = new Date(log.date);
      const start = startDate ? new Date(startDate as string) : new Date(0);
      const end = endDate ? new Date(endDate as string) : new Date();
      return logDate >= start && logDate <= end;
    });

    // Calculate nutrition summary
    const totalCalories = filteredLogs.reduce((sum: number, log: any) => sum + log.totalCalories, 0);
    const totalDays = filteredLogs.length || 1;
    const averageCalories = totalCalories / totalDays;

    const adherenceRate = Math.min(100, Math.round((averageCalories / plan.targetCalories) * 100));

    res.json({
      success: true,
      data: {
        summary: {
          totalCalories,
          averageCalories: Math.round(averageCalories),
          targetCalories: plan.targetCalories,
          adherenceRate,
          totalDays
        },
        period: {
          startDate: startDate || 'All time',
          endDate: endDate || 'Now'
        }
      }
    });
  } catch (error: any) {
    next(error);
  }
});

// Helper function to generate meal suggestions
function generateMealSuggestions(
  mealType: string,
  targetCalories: number,
  dietaryRestrictions: string[],
  preferences: any
): any[] {
  const suggestions = [];

  const baseMeals = {
    breakfast: [
      { name: 'Oatmeal with Berries', calories: 300, protein: 12, carbs: 45, fat: 8 },
      { name: 'Greek Yogurt Parfait', calories: 280, protein: 15, carbs: 35, fat: 6 },
      { name: 'Avocado Toast with Eggs', calories: 350, protein: 18, carbs: 30, fat: 15 }
    ],
    lunch: [
      { name: 'Grilled Chicken Salad', calories: 400, protein: 35, carbs: 20, fat: 18 },
      { name: 'Quinoa Bowl with Vegetables', calories: 380, protein: 14, carbs: 52, fat: 12 },
      { name: 'Turkey and Hummus Wrap', calories: 420, protein: 28, carbs: 40, fat: 16 }
    ],
    dinner: [
      { name: 'Salmon with Sweet Potato', calories: 450, protein: 32, carbs: 35, fat: 20 },
      { name: 'Lean Beef Stir Fry', calories: 480, protein: 38, carbs: 42, fat: 18 },
      { name: 'Tofu and Vegetable Curry', calories: 350, protein: 18, carbs: 40, fat: 14 }
    ],
    snack: [
      { name: 'Apple with Almond Butter', calories: 180, protein: 6, carbs: 22, fat: 10 },
      { name: 'Protein Smoothie', calories: 220, protein: 20, carbs: 25, fat: 5 },
      { name: 'Mixed Nuts and Fruit', calories: 200, protein: 8, carbs: 18, fat: 14 }
    ]
  };

  let meals = baseMeals[mealType as keyof typeof baseMeals] || [];

  // Filter based on dietary restrictions
  if (dietaryRestrictions.includes('vegetarian')) {
    meals = meals.filter(meal => !meal.name.toLowerCase().includes('chicken') &&
                                  !meal.name.toLowerCase().includes('turkey') &&
                                  !meal.name.toLowerCase().includes('beef'));
  }

  if (dietaryRestrictions.includes('vegan')) {
    meals = meals.filter(meal => !meal.name.toLowerCase().includes('chicken') &&
                                  !meal.name.toLowerCase().includes('turkey') &&
                                  !meal.name.toLowerCase().includes('beef') &&
                                  !meal.name.toLowerCase().includes('salmon') &&
                                  !meal.name.toLowerCase().includes('greek yogurt') &&
                                  !meal.name.toLowerCase().includes('eggs'));
  }

  return meals.slice(0, 3).map(meal => ({
    ...meal,
    mealType,
    meetsTarget: Math.abs(meal.calories - targetCalories) <= (targetCalories * 0.2)
  }));
}

export default router;