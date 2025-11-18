import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database.js';
import { initUserModel, User } from '../models/User.js';
import { initMedicationRecordModel, MedicationRecord } from '../models/MedicationRecord.js';
import { initHealthMetricModel, HealthMetric } from '../models/HealthMetric.js';
import { initDietPlanModel, DietPlan } from '../models/DietPlan.js';

export interface SeedData {
  users?: any[];
  medications?: any[];
  healthMetrics?: any[];
  dietPlans?: any[];
}

class DatabaseSeeder {
  private isSeeded = false;

  async initialize(): Promise<void> {
    // Initialize all models
    initUserModel(sequelize);
    initMedicationRecordModel(sequelize);
    initHealthMetricModel(sequelize);
    initDietPlanModel(sequelize);

    // Sync database
    await sequelize.sync({ force: false });
    console.log('✅ Database models synchronized');
  }

  async checkIfSeeded(): Promise<boolean> {
    try {
      const userCount = await User.count();
      return userCount > 0;
    } catch (error) {
      console.error('Error checking if database is seeded:', error);
      return false;
    }
  }

  async seedAll(): Promise<void> {
    if (await this.checkIfSeeded()) {
      console.log('📊 Database already contains data, skipping seeding');
      this.isSeeded = true;
      return;
    }

    console.log('🌱 Starting database seeding...');

    try {
      await this.seedUsers();
      await this.seedMedications();
      await this.seedHealthMetrics();
      await this.seedDietPlans();

      this.isSeeded = true;
      console.log('✅ Database seeding completed successfully');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  async seedUsers(): Promise<void> {
    console.log('👥 Seeding users...');

    const users = [
      {
        email: 'admin@medicalapp.com',
        password: await bcrypt.hash('admin123', 12),
        firstName: 'Admin',
        lastName: 'User',
        dateOfBirth: new Date('1980-01-01'),
        phone: '+1234567890',
        role: 'admin',
        emailVerified: true,
        isActive: true
      },
      {
        email: 'john.doe@example.com',
        password: await bcrypt.hash('password123', 12),
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1985-05-15'),
        phone: '+1234567891',
        role: 'user',
        emailVerified: true,
        isActive: true
      },
      {
        email: 'jane.smith@example.com',
        password: await bcrypt.hash('password123', 12),
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: new Date('1990-08-22'),
        phone: '+1234567892',
        role: 'user',
        emailVerified: true,
        isActive: true
      },
      {
        email: 'robert.johnson@example.com',
        password: await bcrypt.hash('password123', 12),
        firstName: 'Robert',
        lastName: 'Johnson',
        dateOfBirth: new Date('1975-12-10'),
        phone: '+1234567893',
        role: 'user',
        emailVerified: false,
        isActive: true
      },
      {
        email: 'doctor.wilson@medicalapp.com',
        password: await bcrypt.hash('doctor123', 12),
        firstName: 'Dr. Sarah',
        lastName: 'Wilson',
        dateOfBirth: new Date('1978-03-25'),
        phone: '+1234567894',
        role: 'doctor',
        emailVerified: true,
        isActive: true
      }
    ];

    const createdUsers = await User.bulkCreate(users);
    console.log(`✅ Created ${createdUsers.length} users`);
    return createdUsers;
  }

  async seedMedications(): Promise<void> {
    console.log('💊 Seeding medications...');

    const users = await User.findAll({ where: { role: 'user' } });

    const medications = [];
    const now = new Date();

    // Sample medications for each user
    users.forEach((user, index) => {
      const userMeds = [
        {
          userId: user.id,
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'once',
          startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          endDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
          reminders: [
            {
              time: '08:00',
              days: [0, 1, 2, 3, 4, 5, 6],
              enabled: true
            }
          ],
          notes: 'Take with water',
          prescribedBy: 'Dr. Wilson',
          adherenceRate: 85 + (index * 5), // Vary adherence rates
          active: true
        },
        {
          userId: user.id,
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'twice',
          startDate: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
          reminders: [
            {
              time: '08:00',
              days: [0, 1, 2, 3, 4, 5, 6],
              enabled: true
            },
            {
              time: '20:00',
              days: [0, 1, 2, 3, 4, 5, 6],
              enabled: true
            }
          ],
          notes: 'Take with meals',
          prescribedBy: 'Dr. Wilson',
          adherenceRate: 90 + (index * 2),
          active: true
        }
      ];

      // Add user-specific medications
      if (index === 0) {
        userMeds.push({
          userId: user.id,
          name: 'Atorvastatin',
          dosage: '20mg',
          frequency: 'once',
          startDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
          reminders: [
            {
              time: '21:00',
              days: [0, 1, 2, 3, 4, 5, 6],
              enabled: true
            }
          ],
          notes: 'Take at bedtime',
          prescribedBy: 'Dr. Wilson',
          adherenceRate: 95,
          active: true
        });
      }

      if (index === 1) {
        userMeds.push({
          userId: user.id,
          name: 'Aspirin',
          dosage: '81mg',
          frequency: 'once',
          startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
          reminders: [
            {
              time: '09:00',
              days: [0, 1, 2, 3, 4, 5, 6],
              enabled: true
            }
          ],
          notes: 'Low dose for heart health',
          prescribedBy: 'Dr. Wilson',
          adherenceRate: 88,
          active: true
        });
      }

      medications.push(...userMeds);
    });

    const createdMedications = await MedicationRecord.bulkCreate(medications);
    console.log(`✅ Created ${createdMedications.length} medication records`);
    return createdMedications;
  }

  async seedHealthMetrics(): Promise<void> {
    console.log('📊 Seeding health metrics...');

    const users = await User.findAll({ where: { role: 'user' } });
    const metrics = [];
    const now = new Date();

    users.forEach((user) => {
      // Generate blood pressure readings for the last 30 days
      for (let i = 30; i >= 0; i -= 3) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);

        metrics.push({
          userId: user.id,
          type: 'bloodPressure',
          value: 120, // Will be calculated from metadata
          unit: 'mmHg',
          timestamp: date,
          source: 'manual',
          metadata: {
            systolic: 120 + Math.floor(Math.random() * 20) - 10, // 110-130
            diastolic: 80 + Math.floor(Math.random() * 10) - 5, // 75-85
            position: 'sitting',
            device: 'Home BP Monitor'
          }
        });
      }

      // Generate weight readings for the last 30 days
      for (let i = 30; i >= 0; i -= 7) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const baseWeight = user.firstName === 'John' ? 180 : 150; // Different base weights

        metrics.push({
          userId: user.id,
          type: 'weight',
          value: baseWeight + Math.floor(Math.random() * 10) - 5, // ±5 lbs variation
          unit: 'lbs',
          timestamp: date,
          source: 'manual',
          metadata: {
            device: 'Digital Scale',
            location: 'Bathroom'
          }
        });
      }

      // Generate heart rate readings
      for (let i = 28; i >= 0; i -= 4) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);

        metrics.push({
          userId: user.id,
          type: 'heartRate',
          value: 72 + Math.floor(Math.random() * 16) - 8, // 64-80 bpm
          unit: 'bpm',
          timestamp: date,
          source: 'device',
          metadata: {
            device: 'Fitness Tracker',
            position: 'resting'
          }
        });
      }

      // Generate blood sugar readings (for demonstration)
      if (user.firstName === 'John') { // Only for diabetic patient
        for (let i = 14; i >= 0; i -= 2) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);

          metrics.push({
            userId: user.id,
            type: 'bloodSugar',
            value: 95 + Math.floor(Math.random() * 30) - 15, // 80-125 mg/dL
            unit: 'mg/dL',
            timestamp: date,
            source: 'manual',
            metadata: {
              device: 'Glucometer',
              location: 'Finger prick'
            }
          });
        }
      }
    });

    const createdMetrics = await HealthMetric.bulkCreate(metrics);
    console.log(`✅ Created ${createdMetrics.length} health metrics`);
    return createdMetrics;
  }

  async seedDietPlans(): Promise<void> {
    console.log('🥗 Seeding diet plans...');

    const users = await User.findAll({ where: { role: 'user' } });
    const dietPlans = [];
    const now = new Date();

    users.forEach((user) => {
      const plan = {
        userId: user.id,
        name: `${user.firstName}'s Health Plan`,
        description: 'Personalized nutrition plan for optimal health',
        dailyCalories: user.firstName === 'John' ? 2200 : 1800, // Different calorie targets
        macros: {
          protein: 120,
          carbohydrates: 250,
          fat: 65,
          fiber: 30,
          sugar: 40,
          sodium: 2300
        },
        dietaryRestrictions: user.firstName === 'Jane' ? ['vegetarian'] : [],
        preferences: {
          vegetarian: user.firstName === 'Jane',
          vegan: false,
          glutenFree: false,
          dairyFree: user.firstName === 'Robert',
          lowCarb: user.firstName === 'John',
          lowSodium: true,
          keto: false,
          paleo: false
        },
        meals: [
          {
            name: 'Oatmeal with Berries',
            type: 'breakfast',
            calories: 350,
            macros: {
              protein: 12,
              carbohydrates: 45,
              fat: 8,
              fiber: 8,
              sugar: 15,
              sodium: 150
            },
            ingredients: [
              { name: 'Rolled Oats', quantity: 1, unit: 'cup', calories: 150 },
              { name: 'Blueberries', quantity: 0.5, unit: 'cup', calories: 40 },
              { name: 'Almonds', quantity: 10, unit: 'count', calories: 100 }
            ],
            instructions: [
              'Cook oats with water or milk',
              'Top with berries and almonds',
              'Add honey if desired'
            ],
            prepTime: 5,
            cookTime: 10,
            servings: 1
          },
          {
            name: 'Grilled Chicken Salad',
            type: 'lunch',
            calories: 450,
            macros: {
              protein: 35,
              carbohydrates: 20,
              fat: 18,
              fiber: 8,
              sugar: 5,
              sodium: 400
            },
            ingredients: [
              { name: 'Chicken Breast', quantity: 4, unit: 'oz', calories: 180 },
              { name: 'Mixed Greens', quantity: 2, unit: 'cups', calories: 20 },
              { name: 'Cherry Tomatoes', quantity: 0.5, unit: 'cup', calories: 15 },
              { name: 'Olive Oil', quantity: 1, unit: 'tbsp', calories: 120 }
            ],
            instructions: [
              'Season and grill chicken breast',
              'Wash and prepare vegetables',
              'Toss with olive oil and serve'
            ],
            prepTime: 10,
            cookTime: 15,
            servings: 1
          }
        ],
        mealSchedule: {
          breakfastTime: '08:00',
          lunchTime: '12:00',
          dinnerTime: '18:00',
          snackTimes: ['10:00', '15:00']
        },
        startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        isActive: true,
        adherence: {
          daysFollowed: 5,
          totalDays: 7,
          averageCalories: 2000,
          targetHitRate: 75
        }
      };

      dietPlans.push(plan);
    });

    const createdDietPlans = await DietPlan.bulkCreate(dietPlans);
    console.log(`✅ Created ${createdDietPlans.length} diet plans`);
    return createdDietPlans;
  }

  async clearDatabase(): Promise<void> {
    console.log('🧹 Clearing database...');

    await HealthMetric.destroy({ where: {}, force: true });
    await MedicationRecord.destroy({ where: {}, force: true });
    await DietPlan.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });

    console.log('✅ Database cleared');
  }

  async resetAndSeed(): Promise<void> {
    console.log('🔄 Resetting and seeding database...');

    try {
      await this.clearDatabase();
      await this.seedAll();
      console.log('✅ Database reset and seeding completed');
    } catch (error) {
      console.error('❌ Database reset failed:', error);
      throw error;
    }
  }

  async getSeedStatus(): Promise<{ isSeeded: boolean; userCount: number; recordCounts: any }> {
    const userCount = await User.count();
    const medicationCount = await MedicationRecord.count();
    const healthMetricCount = await HealthMetric.count();
    const dietPlanCount = await DietPlan.count();

    return {
      isSeeded: userCount > 0,
      userCount,
      recordCounts: {
        medications: medicationCount,
        healthMetrics: healthMetricCount,
        dietPlans: dietPlanCount
      }
    };
  }
}

// Export singleton instance
export default new DatabaseSeeder();

// CLI function for running seeder
export const runSeeder = async (command: 'seed' | 'reset' | 'status' | 'clear' = 'seed'): Promise<void> => {
  const seeder = DatabaseSeeder;

  try {
    await seeder.initialize();

    switch (command) {
      case 'seed':
        await seeder.seedAll();
        break;
      case 'reset':
        await seeder.resetAndSeed();
        break;
      case 'status':
        const status = await seeder.getSeedStatus();
        console.log('📊 Database Seeding Status:');
        console.log(`Is Seeded: ${status.isSeeded}`);
        console.log(`Users: ${status.userCount}`);
        console.log(`Medications: ${status.recordCounts.medications}`);
        console.log(`Health Metrics: ${status.recordCounts.healthMetrics}`);
        console.log(`Diet Plans: ${status.recordCounts.dietPlans}`);
        break;
      case 'clear':
        await seeder.clearDatabase();
        break;
    }

    await sequelize.close();
  } catch (error) {
    console.error('❌ Seeder error:', error);
    process.exit(1);
  }
};

// Allow running from command line
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2] || 'seed';
  runSeeder(command as any);
}