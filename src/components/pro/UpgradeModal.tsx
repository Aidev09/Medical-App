import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, X, CreditCard, Calendar, Star, Sparkles } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: 'monthly' | 'biannual' | 'yearly') => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onSelectPlan }) => {
  const plans = [
    {
      id: 'monthly',
      title: '1 Month',
      price: '$9.99',
      period: 'per month',
      features: [
        'All Pro Features',
        'Priority Support',
        'Cancel Anytime'
      ],
      gradient: 'from-blue-500 to-cyan-500',
      popular: false,
      icon: Calendar,
      savings: 'Basic'
    },
    {
      id: 'biannual',
      title: '6 Months',
      price: '$49.99',
      period: '6 months',
      pricePerMonth: '$8.33/mo',
      features: [
        'All Pro Features',
        'Priority Support',
        'Cancel Anytime',
        'Save 16%'
      ],
      gradient: 'from-purple-500 to-pink-500',
      popular: true,
      icon: Star,
      savings: 'Popular'
    },
    {
      id: 'yearly',
      title: '12 Months',
      price: '$89.99',
      period: 'per year',
      pricePerMonth: '$7.49/mo',
      features: [
        'All Pro Features',
        'Priority Support',
        'Cancel Anytime',
        'Save 25%'
      ],
      gradient: 'from-amber-500 to-orange-500',
      popular: false,
      icon: Crown,
      savings: 'Best Value'
    }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-3xl mx-auto"
        >
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <div className="p-4 sm:p-6">
              {/* Header with Close Button */}
              <div className="relative text-center mb-6">
                {/* Close Button */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={onClose}
                  className="absolute right-0 top-0 p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </motion.button>

                <div className="inline-flex items-center justify-center mb-2">
                  <motion.div
                    className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg"
                    animate={{
                      rotate: [0, -3, 3, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      repeatType: "reverse",
                      duration: 4
                    }}
                  >
                    <Crown className="h-5 w-5 text-white" />
                  </motion.div>
                </div>
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mb-1">
                  Choose Your Pro Plan
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Select the perfect plan for your health journey
                </p>
              </div>

              {/* Plans Grid */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch mb-6">
                {plans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex-1 ${plan.popular ? 'sm:-mt-2 sm:-mb-2' : ''}`}
                  >
                    <Card
                      className={`relative overflow-hidden cursor-pointer border transition-all duration-300 h-full ${
                        plan.popular 
                          ? 'border-purple-500/50 dark:border-purple-500/50 shadow-lg shadow-purple-500/10' 
                          : 'hover:border-purple-500/30 dark:hover:border-purple-500/30'
                      }`}
                      onClick={() => onSelectPlan(plan.id as 'monthly' | 'biannual' | 'yearly')}
                    >
                      {plan.popular && (
                        <div className="absolute top-0 right-0">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-medium px-2 py-0.5 rounded-bl-lg">
                            Popular
                          </div>
                        </div>
                      )}
                      
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`p-1.5 rounded-lg bg-gradient-to-br ${plan.gradient} relative`}>
                            <plan.icon className="h-3.5 w-3.5 text-white" />
                            {plan.popular && (
                              <Sparkles className="absolute -top-1 -right-1 h-2 w-2 text-yellow-300" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                              {plan.title}
                            </h3>
                            <Badge 
                              variant="secondary" 
                              className={`bg-gradient-to-r ${plan.gradient} text-white border-0 text-[10px] px-1.5 py-0`}
                            >
                              {plan.savings}
                            </Badge>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                              {plan.price}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {plan.period}
                            </span>
                          </div>
                          {plan.pricePerMonth && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Just {plan.pricePerMonth}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 mb-4">
                          {plan.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-1.5">
                              <div className={`p-0.5 rounded-full bg-gradient-to-br ${plan.gradient}`}>
                                <Check className="h-2.5 w-2.5 text-white" />
                              </div>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>

                        <Button 
                          size="sm"
                          className={`w-full bg-gradient-to-r ${plan.gradient} text-white hover:opacity-90 text-xs`}
                        >
                          <CreditCard className="h-3 w-3 mr-1.5" />
                          Select Plan
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                Secure payment powered by Stripe. Cancel anytime.
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpgradeModal; 