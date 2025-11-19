
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpCircle, ArrowDownCircle, Salad, Apple, Utensils, Clock, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import UserMetricsForm, { UserMetrics } from './UserMetricsForm';
import { DietRecommendation, getDietRecommendations } from '@/services/dietApi';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

const DietPlanSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('weight-loss');
  const [showForm, setShowForm] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [dietData, setDietData] = useState<DietRecommendation | null>(null);

  const handleMetricsSubmit = async (data: UserMetrics) => {
    setIsLoading(true);
    try {
      const result = await getDietRecommendations(data);
      setDietData(result);
      setShowForm(false);
    } catch (error) {
      console.error("Error getting diet plans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const MacronutrientBar = ({ 
    protein, carbs, fats, calories, 
    isWeightLoss = false 
  }: { 
    protein: number; 
    carbs: number; 
    fats: number; 
    calories: number;
    isWeightLoss?: boolean;
  }) => {
    return (
      <div className="space-y-2 mt-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Daily Calories:</span>
          <span>{calories} kcal</span>
        </div>
        
        <div className="h-3 flex rounded-full overflow-hidden">
          <div 
            className={`${isWeightLoss ? "bg-red-400" : "bg-emerald-400"}`} 
            style={{ width: `${(protein * 4 / calories) * 100}%` }}
          />
          <div 
            className={`${isWeightLoss ? "bg-red-600" : "bg-emerald-600"}`}
            style={{ width: `${(carbs * 4 / calories) * 100}%` }}
          />
          <div 
            className={`${isWeightLoss ? "bg-red-800" : "bg-emerald-800"}`}
            style={{ width: `${(fats * 9 / calories) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-3 text-xs">
          <div className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-full ${isWeightLoss ? "bg-red-400" : "bg-emerald-400"}`}></div>
            <span>Protein: {protein}g</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-full ${isWeightLoss ? "bg-red-600" : "bg-emerald-600"}`}></div>
            <span>Carbs: {carbs}g</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-full ${isWeightLoss ? "bg-red-800" : "bg-emerald-800"}`}></div>
            <span>Fats: {fats}g</span>
          </div>
        </div>
      </div>
    );
  };

  const MealList = ({ meals, isWeightLoss = false }) => {
    return (
      <Accordion type="single" collapsible className="space-y-2 mt-4">
        {meals.map((meal, index) => (
          <AccordionItem 
            key={index} 
            value={`meal-${index}`} 
            className="border border-muted rounded-lg overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 data-[state=open]:bg-muted/50">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className={`${isWeightLoss ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"} dark:bg-opacity-20 p-2 rounded-full`}>
                    <Utensils className="h-4 w-4" />
                  </div>
                  <div className="font-medium text-left">{meal.name}</div>
                </div>
                {meal.calories && (
                  <div className="text-xs text-muted-foreground">{meal.calories} kcal</div>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-1">
              <div className="text-sm space-y-2">
                <p className="text-muted-foreground">{meal.description}</p>
                {meal.time && <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {meal.time}
                </p>}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  };

  const renderMetricsInfo = () => {
    if (!dietData) return null;
    
    return (
      <div className="bg-muted/50 p-3 rounded-lg text-sm mb-4">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Base Metabolic Rate (BMR):</span>
          <span className="font-medium">{dietData.bmr} kcal</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Daily Energy Expenditure:</span>
          <span className="font-medium">{dietData.tdee} kcal</span>
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      className="mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            Personalized Diet Plans
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showForm ? (
            <UserMetricsForm onMetricsSubmit={handleMetricsSubmit} isLoading={isLoading} />
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <button 
                  onClick={() => setShowForm(true)} 
                  className="text-sm text-primary hover:underline"
                >
                  Edit Metrics
                </button>
              </div>
              
              {renderMetricsInfo()}
              
              <Tabs defaultValue="weight-loss" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="weight-loss" className="flex items-center gap-2">
                    <ArrowDownCircle className="h-4 w-4" />
                    <span>Weight Loss</span>
                  </TabsTrigger>
                  <TabsTrigger value="weight-gain" className="flex items-center gap-2">
                    <ArrowUpCircle className="h-4 w-4" />
                    <span>Weight Gain</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="weight-loss" className="mt-0">
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-40 w-full" />
                    </div>
                  ) : dietData ? (
                    <div>
                      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-800/30 mb-4">
                        <h3 className="text-red-700 dark:text-red-400 font-medium mb-1 flex items-center gap-1">
                          <ArrowDownCircle className="h-4 w-4" />
                          Weight Loss Plan
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          This plan creates a 500-calorie daily deficit for sustainable weight loss of about 1 pound per week.
                        </p>
                      </div>
                      
                      <MacronutrientBar 
                        protein={dietData.weightLossPlan.macros.protein}
                        carbs={dietData.weightLossPlan.macros.carbs}
                        fats={dietData.weightLossPlan.macros.fats}
                        calories={dietData.weightLossPlan.calories}
                        isWeightLoss={true}
                      />
                      
                      <MealList 
                        meals={dietData.weightLossPlan.meals} 
                        isWeightLoss={true}
                      />
                      
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
                  ) : null}
                </TabsContent>
                
                <TabsContent value="weight-gain" className="mt-0">
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-40 w-full" />
                    </div>
                  ) : dietData ? (
                    <div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800/30 mb-4">
                        <h3 className="text-green-700 dark:text-green-400 font-medium mb-1 flex items-center gap-1">
                          <ArrowUpCircle className="h-4 w-4" />
                          Weight Gain Plan
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          This plan creates a 500-calorie surplus for healthy weight gain of about 1 pound per week.
                        </p>
                      </div>
                      
                      <MacronutrientBar 
                        protein={dietData.weightGainPlan.macros.protein}
                        carbs={dietData.weightGainPlan.macros.carbs}
                        fats={dietData.weightGainPlan.macros.fats}
                        calories={dietData.weightGainPlan.calories}
                        isWeightLoss={false}
                      />
                      
                      <MealList 
                        meals={dietData.weightGainPlan.meals} 
                        isWeightLoss={false}
                      />
                      
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
                  ) : null}
                </TabsContent>
              </Tabs>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DietPlanSection;
