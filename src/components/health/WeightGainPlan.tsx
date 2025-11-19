
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Clock, Coffee, Salad, Apple, Utensils, ArrowUpCircle } from 'lucide-react';

const WeightGainPlan: React.FC = () => {
  const mealPlans = [
    {
      time: "Breakfast (7-8 AM)",
      icon: Coffee,
      meals: [
        {
          name: "Protein-Packed Oats",
          description: "1 cup oats cooked in whole milk, 1 scoop protein powder, 1 banana, 2 tbsp peanut butter",
          image: null
        },
        {
          name: "High-Calorie Smoothie",
          description: "2 bananas, 1 cup Greek yogurt, 2 tbsp honey, 1 cup milk, 2 tbsp almond butter",
          image: null
        }
      ]
    },
    {
      time: "Mid-Morning Snack (10-11 AM)",
      icon: Apple,
      meals: [
        {
          name: "Trail Mix",
          description: "1/2 cup mixed nuts, dried fruits, and dark chocolate chips",
          image: null
        },
        {
          name: "Avocado Toast",
          description: "2 slices whole grain bread with mashed avocado, olive oil drizzle",
          image: null
        }
      ]
    },
    {
      time: "Lunch (1-2 PM)",
      icon: Salad,
      meals: [
        {
          name: "Bulking Bowl",
          description: "1.5 cups brown rice, 6 oz grilled chicken, 1 avocado, roasted vegetables, olive oil",
          image: null
        },
        {
          name: "Hearty Sandwich",
          description: "Whole grain bread, 4 oz turkey, cheese, avocado, mixed veggies and mayo",
          image: null
        }
      ]
    },
    {
      time: "Afternoon Snack (4-5 PM)",
      icon: Apple,
      meals: [
        {
          name: "Protein Shake",
          description: "2 scoops protein powder, 1 cup whole milk, banana, 1 tbsp honey, 1 tbsp olive oil",
          image: null
        },
        {
          name: "Greek Yogurt Parfait",
          description: "1 cup full-fat Greek yogurt, granola, mixed berries, honey drizzle",
          image: null
        }
      ]
    },
    {
      time: "Dinner (7-8 PM)",
      icon: Utensils,
      meals: [
        {
          name: "Salmon with Sweet Potatoes",
          description: "6 oz salmon fillet, 1 large sweet potato, steamed vegetables with olive oil",
          image: null
        },
        {
          name: "Pasta with Meat Sauce",
          description: "1.5 cups whole grain pasta, 5 oz beef in tomato sauce, parmesan cheese",
          image: null
        }
      ]
    },
    {
      time: "Before Bed (9-10 PM)",
      icon: Clock,
      meals: [
        {
          name: "Casein Protein Shake",
          description: "1 scoop casein protein, 1 cup milk, 1 tbsp almond butter",
          image: null
        },
        {
          name: "Cottage Cheese & Fruits",
          description: "1 cup cottage cheese with pineapple chunks and honey",
          image: null
        }
      ]
    }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800/30 mb-4">
        <h3 className="text-green-700 dark:text-green-400 font-medium mb-1 flex items-center gap-1">
          <ArrowUpCircle className="h-4 w-4" />
          Weight Gain Plan
        </h3>
        <p className="text-sm text-muted-foreground">
          This plan focuses on calorie-dense, nutritious foods to create a calorie surplus. Aim for 300-500 calories above maintenance for healthy weight gain of 0.5-1 pound per week.
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {mealPlans.map((meal, index) => (
          <AccordionItem key={index} value={`meal-${index}`} className="border border-muted rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 data-[state=open]:bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <meal.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="font-medium">{meal.time}</div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-1">
              <div className="grid gap-3 mt-2">
                {meal.meals.map((item, mealIndex) => (
                  <div key={mealIndex} className="flex gap-3">
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                    <div>
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="bg-muted/50 p-4 rounded-lg mt-4">
        <h4 className="font-medium text-sm mb-1">Additional Tips</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Eat every 2-3 hours throughout the day</li>
          <li>• Incorporate strength training 3-4 times per week</li>
          <li>• Prioritize protein with each meal (aim for 1.6-2.2g per kg of bodyweight)</li>
          <li>• Add healthy fats like olive oil, avocado, and nuts to meals</li>
          <li>• Get 7-9 hours of quality sleep for optimal recovery and muscle growth</li>
        </ul>
      </div>
    </div>
  );
};

export default WeightGainPlan;
