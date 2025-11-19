import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Clock, Coffee, Salad, Apple, Utensils, ArrowDownCircle } from 'lucide-react';

const WeightLossPlan: React.FC = () => {
  const mealPlans = [
    {
      time: "Breakfast (7-8 AM)",
      icon: Coffee,
      meals: [
        {
          name: "Vegetable Omelette",
          description: "2 egg whites, spinach, tomatoes, and mushrooms",
          image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?q=80&w=400&auto=format"
        },
        {
          name: "Greek Yogurt Bowl",
          description: "Low-fat Greek yogurt with berries and a sprinkle of chia seeds",
          image: null
        },
        {
          name: "Overnight Oats",
          description: "1/2 cup oats soaked in almond milk with cinnamon and strawberries",
          image: null
        }
      ]
    },
    {
      time: "Mid-Morning Snack (10-11 AM)",
      icon: Apple,
      meals: [
        {
          name: "Apple & Nuts",
          description: "1 medium apple with 10 almonds",
          image: null
        },
        {
          name: "Veggie Sticks",
          description: "Carrot and cucumber sticks with hummus",
          image: null
        }
      ]
    },
    {
      time: "Lunch (1-2 PM)",
      icon: Salad,
      meals: [
        {
          name: "Mediterranean Salad",
          description: "Mixed greens, cucumber, tomatoes, olives, feta cheese with olive oil & lemon dressing",
          image: null
        },
        {
          name: "Quinoa Bowl",
          description: "1 cup quinoa with roasted vegetables and 3 oz grilled chicken",
          image: null
        }
      ]
    },
    {
      time: "Afternoon Snack (4-5 PM)",
      icon: Apple,
      meals: [
        {
          name: "Protein Smoothie",
          description: "Blend spinach, banana, protein powder, and almond milk",
          image: null
        },
        {
          name: "Rice Cake Snack",
          description: "2 rice cakes with 1 tbsp almond butter",
          image: null
        }
      ]
    },
    {
      time: "Dinner (7-8 PM)",
      icon: Utensils,
      meals: [
        {
          name: "Grilled Fish & Vegetables",
          description: "4 oz grilled salmon with steamed broccoli and cauliflower",
          image: null
        },
        {
          name: "Turkey Lettuce Wraps",
          description: "3 oz lean ground turkey with vegetables in lettuce cups",
          image: null
        }
      ]
    }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-800/30 mb-4">
        <h3 className="text-red-700 dark:text-red-400 font-medium mb-1 flex items-center gap-1">
          <ArrowDownCircle className="h-4 w-4" />
          Weight Loss Plan
        </h3>
        <p className="text-sm text-muted-foreground">
          This plan focuses on nutrient-dense, low-calorie foods to create a calorie deficit. Aim for a 500-calorie daily deficit for sustainable weight loss of about 1-2 pounds per week.
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
                    <div className={!item.image ? "w-full" : ""}>
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
          <li>• Drink at least 8 glasses of water daily</li>
          <li>• Limit processed foods and added sugars</li>
          <li>• Include 30 minutes of moderate exercise 5 times per week</li>
          <li>• Get 7-8 hours of quality sleep</li>
        </ul>
      </div>
    </div>
  );
};

export default WeightLossPlan;
