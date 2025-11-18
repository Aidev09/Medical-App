import express from 'express';
import { validateRequest, validationSchemas } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/profile', async (req: any, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          dateOfBirth: user.dateOfBirth,
          age: user.age,
          phone: user.phone,
          profilePicture: user.profilePicture,
          emailVerified: user.emailVerified,
          lastLogin: user.lastLogin,
          role: user.role,
          preferences: user.preferences,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/profile:
 *   patch:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *               phone:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.patch('/profile', validateRequest(validationSchemas.updateProfile), async (req: any, res, next) => {
  try {
    const { firstName, lastName, phone, dateOfBirth } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          dateOfBirth: user.dateOfBirth,
          age: user.age,
          phone: user.phone,
          profilePicture: user.profilePicture,
          emailVerified: user.emailVerified,
          role: user.role,
          preferences: user.preferences
        }
      }
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/preferences:
 *   get:
 *     summary: Get user preferences
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User preferences retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/preferences', async (req: any, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('preferences');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        preferences: user.preferences
      }
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/preferences:
 *   patch:
 *     summary: Update user preferences
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               timezone:
 *                 type: string
 *               units:
 *                 type: object
 *                 properties:
 *                   weight:
 *                     type: string
 *                     enum: [kg, lbs]
 *                   height:
 *                     type: string
 *                     enum: [cm, ft]
 *                   temperature:
 *                     type: string
 *                     enum: [celsius, fahrenheit]
 *               notifications:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: boolean
 *                   push:
 *                     type: boolean
 *                   sms:
 *                     type: boolean
 *                   medicationReminders:
 *                     type: boolean
 *                   healthAlerts:
 *                     type: boolean
 *               privacy:
 *                 type: object
 *                 properties:
 *                   shareHealthData:
 *                     type: boolean
 *                   allowAnalytics:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.patch('/preferences', validateRequest(validationSchemas.updatePreferences), async (req: any, res, next) => {
  try {
    const { timezone, units, notifications, privacy } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Deep merge preferences
    if (timezone !== undefined) user.preferences.timezone = timezone;
    if (units) user.preferences.units = { ...user.preferences.units, ...units };
    if (notifications) user.preferences.notifications = { ...user.preferences.notifications, ...notifications };
    if (privacy) user.preferences.privacy = { ...user.preferences.privacy, ...privacy };

    await user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: user.preferences
      }
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/profile-picture:
 *   post:
 *     summary: Upload profile picture
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture uploaded successfully
 *       400:
 *         description: Validation error or file too large
 *       401:
 *         description: Unauthorized
 */
router.post('/profile-picture', async (req: any, res, next) => {
  try {
    // TODO: Implement file upload logic with multer
    // For now, return a placeholder response
    res.json({
      success: true,
      message: 'Profile picture upload endpoint - implementation pending',
      data: {
        profilePictureUrl: 'https://placeholder.com/150'
      }
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/delete-account:
 *   delete:
 *     summary: Delete user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password, confirmation]
 *             properties:
 *               password:
 *                 type: string
 *               confirmation:
 *                 type: string
 *                 enum: [DELETE_ACCOUNT]
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       400:
 *         description: Validation error or wrong confirmation
 *       401:
 *         description: Invalid password
 *       403:
 *         description: Wrong confirmation phrase
 */
router.delete('/delete-account', async (req: any, res, next) => {
  try {
    const { password, confirmation } = req.body;

    if (!password || confirmation !== 'DELETE_ACCOUNT') {
      return res.status(400).json({
        success: false,
        error: 'Password and confirmation phrase "DELETE_ACCOUNT" are required'
      });
    }

    const user = await (User as any).findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify password if user has one
    if (user.password) {
      const bcrypt = await import('bcryptjs');
      const isPasswordValid = await bcrypt.default.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid password'
        });
      }
    }

    // Soft delete - mark as inactive and anonymize data
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    user.firstName = 'Deleted';
    user.lastName = 'User';
    user.phone = undefined;
    user.profilePicture = undefined;
    user.googleId = undefined;
    user.firebaseUid = undefined;

    await user.save();

    res.json({
      success: true,
      message: 'Account deleted successfully. Your data has been anonymized and marked for deletion.'
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', async (req: any, res, next) => {
  try {
    const userId = req.user._id;

    // Get user's medication count
    const MedicationRecord = (await import('../models/MedicationRecord.js')).default;
    const medicationCount = await MedicationRecord.countDocuments({ user: userId, active: true });

    // Get user's health metrics count
    const HealthMetric = (await import('../models/HealthMetric.js')).default;
    const healthMetricsCount = await HealthMetric.countDocuments({ user: userId });

    // Get user's diet plans count
    const DietPlan = (await import('../models/DietPlan.js')).default;
    const dietPlansCount = await DietPlan.countDocuments({ user: userId, isActive: true });

    // Get adherence statistics
    const medicationStats = await MedicationRecord.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalIntakes: { $sum: { $size: '$intakes' } },
          averageAdherence: { $avg: '$adherenceRate' }
        }
      }
    ]);

    const stats = {
      medications: medicationCount,
      healthMetrics: healthMetricsCount,
      dietPlans: dietPlansCount,
      adherence: {
        totalIntakes: medicationStats[0]?.totalIntakes || 0,
        averageRate: Math.round(medicationStats[0]?.averageAdherence || 0)
      },
      accountAge: Math.floor((Date.now() - new Date(req.user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/export-data:
 *   get:
 *     summary: Export user data (GDPR compliance)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data exported successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/export-data', async (req: any, res, next) => {
  try {
    const userId = req.user._id;

    // Get user profile data
    const user = await User.findById(userId).select('-password -passwordResetToken -emailVerificationToken');

    // Get related data
    const MedicationRecord = (await import('../models/MedicationRecord.js')).default;
    const HealthMetric = (await import('../models/HealthMetric.js')).default;
    const DietPlan = (await import('../models/DietPlan.js')).default;

    const [medications, healthMetrics, dietPlans] = await Promise.all([
      MedicationRecord.find({ user: userId }),
      HealthMetric.find({ user: userId }),
      DietPlan.find({ user: userId })
    ]);

    const exportData = {
      user,
      medications,
      healthMetrics,
      dietPlans,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    res.json({
      success: true,
      message: 'Data exported successfully',
      data: exportData
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;