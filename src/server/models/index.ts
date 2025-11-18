// Export all models
import User from './User.js';
import MedicationRecord from './MedicationRecord.js';
import HealthMetric from './HealthMetric.js';
import DietPlan from './DietPlan.js';

// Setup associations
User.hasMany(MedicationRecord, { foreignKey: 'userId', as: 'medications' });
MedicationRecord.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(HealthMetric, { foreignKey: 'userId', as: 'healthMetrics' });
HealthMetric.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(DietPlan, { foreignKey: 'userId', as: 'dietPlans' });
DietPlan.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { User, MedicationRecord, HealthMetric, DietPlan };