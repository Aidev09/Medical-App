import express from 'express';
import { validateRequest, validationSchemas, commonSchemas } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import MedicationRecord from '../models/MedicationRecord.js';

const router = express.Router();

// All medication routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/medications:
 *   get:
 *     summary: Get user's medications with pagination and filtering
 *     tags: [Medications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Medications retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', validateRequest(validationSchemas.pagination), async (req: any, res, next) => {
  try {
    const { active, category, page = 1, limit = 10 } = req.query;
    const userId = req.user._id;

    // Build query
    const query: any = { user: userId };
    if (active !== undefined) query.active = active === 'true';
    if (category) query.category = category;

    // Get pagination info
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get medications
    const [medications, total] = await Promise.all([
      MedicationRecord.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('nextDose'), // This will trigger the virtual
      MedicationRecord.countDocuments(query)
    ]);

    const pages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        medications: medications.map(med => ({
          ...med.toJSON(),
          adherenceRate: med.calculateAdherenceRate(),
          nextDose: med.nextDose
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages,
          hasNext: pageNum < pages,
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * @swagger
 * /api/medications:
 *   post:
 *     summary: Create a new medication
 *     tags: [Medications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, dosage, frequency, startDate]
 *             properties:
 *               name:
 *                 type: string
 *               dosage:
 *                 type: string
 *               frequency:
 *                 type: string
 *                 enum: [once, twice, three_times, four_times, as_needed]
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *               rxNormId:
 *                 type: string
 *               reminders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     time:
 *                       type: string
 *                       pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
 *                     days:
 *                       type: array
 *                       items:
 *                         type: integer
 *                         minimum: 0
 *                         maximum: 6
 *                     enabled:
 *                       type: boolean
 *     responses:
 *       201:
 *         description: Medication created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', validateRequest(validationSchemas.createMedication), async (req: any, res, next) => {
  try {
    const { name, dosage, frequency, startDate, endDate, notes, rxNormId, reminders } = req.body;

    // TODO: Fetch drug info from RxNorm if rxNormId is provided
    let drugInfo = {};
    if (rxNormId) {
      // drugInfo = await rxnormService.getDrugInfo(rxNormId);
    }

    const medication = new MedicationRecord({
      user: req.user._id,
      name,
      dosage,
      frequency,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      notes,
      rxNormId,
      reminders: reminders || generateDefaultReminders(frequency),
      ...drugInfo
    });

    await medication.save();

    res.status(201).json({
      success: true,
      message: 'Medication created successfully',
      data: {
        medication: {
          ...medication.toJSON(),
          adherenceRate: medication.calculateAdherenceRate(),
          nextDose: medication.nextDose
        }
      }
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * @swagger
 * /api/medications/{id}:
 *   get:
 *     summary: Get a specific medication with reminder history
 *     tags: [Medications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medication retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Medication not found
 */
router.get('/:id', validateRequest(validationSchemas.idParam), async (req: any, res, next) => {
  try {
    const medication = await MedicationRecord.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!medication) {
      return res.status(404).json({
        success: false,
        error: 'Medication not found'
      });
    }

    // Get adherence and streak data
    await medication.updateStreak();

    res.json({
      success: true,
      data: {
        medication: {
          ...medication.toJSON(),
          adherenceRate: medication.calculateAdherenceRate(),
          nextDose: medication.nextDose,
          reminders: medication.intakes.slice(-10) // Last 10 reminders
        }
      }
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * @swagger
 * /api/medications/{id}:
 *   patch:
 *     summary: Update a medication
 *     tags: [Medications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               dosage:
 *                 type: string
 *               frequency:
 *                 type: string
 *                 enum: [once, twice, three_times, four_times, as_needed]
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Medication updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Medication not found
 */
router.patch('/:id', validateRequest(validationSchemas.updateMedication), async (req: any, res, next) => {
  try {
    const medication = await MedicationRecord.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!medication) {
      return res.status(404).json({
        success: false,
        error: 'Medication not found'
      });
    }

    // Update fields
    const { name, dosage, frequency, startDate, endDate, notes, active, reminders } = req.body;

    if (name) medication.name = name;
    if (dosage) medication.dosage = dosage;
    if (frequency) medication.frequency = frequency;
    if (startDate) medication.startDate = new Date(startDate);
    if (endDate !== undefined) medication.endDate = endDate ? new Date(endDate) : undefined;
    if (notes !== undefined) medication.notes = notes;
    if (active !== undefined) medication.active = active;
    if (reminders) medication.reminders = reminders;

    await medication.save();

    res.json({
      success: true,
      message: 'Medication updated successfully',
      data: {
        medication: {
          ...medication.toJSON(),
          adherenceRate: medication.calculateAdherenceRate(),
          nextDose: medication.nextDose
        }
      }
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * @swagger
 * /api/medications/{id}:
 *   delete:
 *     summary: Delete a medication (soft delete)
 *     tags: [Medications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medication deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Medication not found
 */
router.delete('/:id', validateRequest(validationSchemas.idParam), async (req: any, res, next) => {
  try {
    const medication = await MedicationRecord.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!medication) {
      return res.status(404).json({
        success: false,
        error: 'Medication not found'
      });
    }

    // Soft delete - mark as inactive
    medication.active = false;
    await medication.save();

    res.json({
      success: true,
      message: 'Medication removed successfully'
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * @swagger
 * /api/medications/{id}/take:
 *   post:
 *     summary: Record medication intake
 *     tags: [Medications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *               takenAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Intake recorded successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Medication not found
 */
router.post('/:id/take', validateRequest(validationSchemas.idParam), async (req: any, res, next) => {
  try {
    const medication = await MedicationRecord.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!medication) {
      return res.status(404).json({
        success: false,
        error: 'Medication not found'
      });
    }

    if (!medication.active) {
      return res.status(400).json({
        success: false,
        error: 'Medication is not active'
      });
    }

    const { notes, takenAt } = req.body;

    // Record intake
    const intake = await medication.recordIntake(notes);

    res.json({
      success: true,
      message: 'Medication intake recorded successfully',
      data: {
        intake,
        adherence: {
          rate: medication.calculateAdherenceRate(),
          streak: medication.adherence.streak,
          totalTaken: medication.adherence.totalTaken
        }
      }
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * @swagger
 * /api/medications/search/{query}:
 *   get:
 *     summary: Search medications in FDA/RxNorm databases
 *     tags: [Medications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *       400:
 *         description: Invalid search query
 *       401:
 *         description: Unauthorized
 *       503:
 *         description: External API service unavailable
 */
router.get('/search/:query', validateRequest({
  params: {
    query: commonSchemas.name
  },
  query: {
    limit: commonSchemas.pagination.limit
  }
}), async (req, res, next) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;

    // TODO: Implement actual search using FDA/RxNorm services
    // For now, return mock results
    const mockResults = [
      {
        id: '1',
        name: `${query} (Example Medication)`,
        dosage: '10mg',
        description: 'This is a sample medication result',
        rxNormId: '123456'
      }
    ];

    res.json({
      success: true,
      data: {
        results: mockResults,
        total: mockResults.length
      }
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * @swagger
 * /api/medications/due:
 *   get:
 *     summary: Get medications due for the user
 *     tags: [Medications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Due medications retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/due', async (req: any, res, next) => {
  try {
    const today = new Date();
    const userId = req.user._id;

    const dueMedications = await (MedicationRecord as any).findMedicationsDue(userId, today);

    res.json({
      success: true,
      data: {
        medications: dueMedications.map(med => ({
          ...med.toJSON(),
          nextDose: med.nextDose
        })),
        date: today.toISOString()
      }
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * @swagger
 * /api/medications/stats:
 *   get:
 *     summary: Get medication statistics for the user
 *     tags: [Medications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', async (req: any, res, next) => {
  try {
    const userId = req.user._id;

    const [totalMeds, activeMeds, recentIntakes] = await Promise.all([
      MedicationRecord.countDocuments({ user: userId }),
      MedicationRecord.countDocuments({ user: userId, active: true }),
      MedicationRecord.aggregate([
        { $match: { user: userId } },
        { $unwind: '$intakes' },
        { $sort: { 'intakes.takenAt': -1 } },
        { $limit: 1 },
        { $project: { lastTaken: '$intakes.takenAt' } }
      ])
    ]);

    const adherenceStats = await MedicationRecord.aggregate([
      { $match: { user: userId, active: true } },
      {
        $group: {
          _id: null,
          averageAdherenceRate: { $avg: { $multiply: [{ $divide: ['$adherence.totalTaken', '$adherence.totalScheduled'] }, 100] } },
          totalIntakes: { $sum: '$adherence.totalTaken' },
          totalScheduled: { $sum: '$adherence.totalScheduled' }
        }
      }
    ]);

    const stats = {
      total: totalMeds,
      active: activeMeds,
      inactive: totalMeds - activeMeds,
      adherence: adherenceStats[0] ? {
        rate: Math.round(adherenceStats[0].averageAdherenceRate || 0),
        totalIntakes: adherenceStats[0].totalIntakes,
        totalScheduled: adherenceStats[0].totalScheduled
      } : {
        rate: 0,
        totalIntakes: 0,
        totalScheduled: 0
      },
      lastTaken: recentIntakes[0]?.lastTaken || null
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error: any) {
    next(error);
  }
});

// Helper function to generate default reminders based on frequency
function generateDefaultReminders(frequency: string) {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const everyDay = [0, 1, 2, 3, 4, 5, 6]; // All days of the week

  switch (frequency) {
    case 'once':
      return [{ time: '09:00', days: everyDay, enabled: true }];
    case 'twice':
      return [
        { time: '09:00', days: everyDay, enabled: true },
        { time: '21:00', days: everyDay, enabled: true }
      ];
    case 'three_times':
      return [
        { time: '08:00', days: everyDay, enabled: true },
        { time: '14:00', days: everyDay, enabled: true },
        { time: '20:00', days: everyDay, enabled: true }
      ];
    case 'four_times':
      return [
        { time: '08:00', days: everyDay, enabled: true },
        { time: '12:00', days: everyDay, enabled: true },
        { time: '16:00', days: everyDay, enabled: true },
        { time: '20:00', days: everyDay, enabled: true }
      ];
    default:
      return [];
  }
}

export default router; 