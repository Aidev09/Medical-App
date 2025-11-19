
import { UserMetrics } from "@/components/health/UserMetricsForm";

export interface DietPlan {
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  meals: {
    name: string;
    description: string;
    time?: string;
    calories?: number;
    image?: string | null;
  }[];
}

export interface DietRecommendation {
  bmr: number;
  tdee: number;
  weightLossPlan: DietPlan;
  weightGainPlan: DietPlan;
}

// Calculate BMR using the Mifflin-St Jeor Equation
const calculateBMR = (metrics: UserMetrics): number => {
  const { weight, height, age, gender } = metrics;
  
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

// Calculate TDEE (Total Daily Energy Expenditure)
const calculateTDEE = (bmr: number, activityLevel: string): number => {
  const activityMultipliers: Record<string, number> = {
    'sedentary': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'active': 1.725,
    'very-active': 1.9
  };
  
  return Math.round(bmr * activityMultipliers[activityLevel]);
};

// Generate appropriate meal plans based on caloric needs
const generateDietPlans = (tdee: number): { weightLossPlan: DietPlan; weightGainPlan: DietPlan } => {
  const weightLossCalories = Math.round(tdee - 500); // 500 calorie deficit
  const weightGainCalories = Math.round(tdee + 500); // 500 calorie surplus
  
  const weightLossPlan: DietPlan = {
    calories: weightLossCalories,
    macros: {
      protein: Math.round((weightLossCalories * 0.3) / 4), // 30% protein, 4 calories per gram
      carbs: Math.round((weightLossCalories * 0.4) / 4),   // 40% carbs, 4 calories per gram
      fats: Math.round((weightLossCalories * 0.3) / 9)     // 30% fats, 9 calories per gram
    },
    meals: [
      {
        name: "Vegetable Omelette",
        description: "2 egg whites, spinach, tomatoes, and mushrooms",
        time: "Breakfast (7-8 AM)",
        calories: Math.round(weightLossCalories * 0.25)
      },
      {
        name: "Greek Yogurt with Berries",
        description: "Low-fat Greek yogurt with mixed berries and a sprinkle of chia seeds",
        time: "Mid-Morning Snack (10-11 AM)",
        calories: Math.round(weightLossCalories * 0.1)
      },
      {
        name: "Mediterranean Salad",
        description: "Mixed greens, cucumber, tomatoes, olives, feta cheese with olive oil & lemon dressing",
        time: "Lunch (1-2 PM)",
        calories: Math.round(weightLossCalories * 0.3)
      },
      {
        name: "Protein Smoothie",
        description: "Blend spinach, banana, protein powder, and almond milk",
        time: "Afternoon Snack (4-5 PM)",
        calories: Math.round(weightLossCalories * 0.1)
      },
      {
        name: "Grilled Fish & Vegetables",
        description: "4 oz grilled salmon with steamed broccoli and cauliflower",
        time: "Dinner (7-8 PM)",
        calories: Math.round(weightLossCalories * 0.25)
      }
    ]
  };
  
  const weightGainPlan: DietPlan = {
    calories: weightGainCalories,
    macros: {
      protein: Math.round((weightGainCalories * 0.25) / 4), // 25% protein, 4 calories per gram
      carbs: Math.round((weightGainCalories * 0.5) / 4),    // 50% carbs, 4 calories per gram
      fats: Math.round((weightGainCalories * 0.25) / 9)     // 25% fats, 9 calories per gram
    },
    meals: [
      {
        name: "Protein-Packed Oatmeal",
        description: "1 cup oats cooked in whole milk, 1 scoop protein powder, 1 banana, 2 tbsp peanut butter",
        time: "Breakfast (7-8 AM)",
        calories: Math.round(weightGainCalories * 0.25)
      },
      {
        name: "Trail Mix",
        description: "1/2 cup mixed nuts, dried fruits, and dark chocolate chips",
        time: "Mid-Morning Snack (10-11 AM)",
        calories: Math.round(weightGainCalories * 0.1)
      },
      {
        name: "Bulking Bowl",
        description: "1.5 cups brown rice, 6 oz grilled chicken, 1 avocado, roasted vegetables, olive oil",
        time: "Lunch (1-2 PM)",
        calories: Math.round(weightGainCalories * 0.3)
      },
      {
        name: "Protein Shake",
        description: "2 scoops protein powder, 1 cup whole milk, banana, 1 tbsp honey, 1 tbsp olive oil",
        time: "Afternoon Snack (4-5 PM)",
        calories: Math.round(weightGainCalories * 0.1)
      },
      {
        name: "Salmon with Sweet Potatoes",
        description: "6 oz salmon fillet, 1 large sweet potato, steamed vegetables with olive oil",
        time: "Dinner (7-8 PM)",
        calories: Math.round(weightGainCalories * 0.25)
      }
    ]
  };
  
  return { weightLossPlan, weightGainPlan };
};

// Simulate API call - in reality this would call an external API
export const getDietRecommendations = async (metrics: UserMetrics): Promise<DietRecommendation> => {
  // Add a small delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const bmr = calculateBMR(metrics);
  const tdee = calculateTDEE(bmr, metrics.activityLevel);
  const { weightLossPlan, weightGainPlan } = generateDietPlans(tdee);
  
  return {
    bmr,
    tdee,
    weightLossPlan,
    weightGainPlan
  };
};
