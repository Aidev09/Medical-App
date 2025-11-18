import express from 'express';
import { validateRequest, validationSchemas } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import HealthMetric from '../models/HealthMetric.js';

const router = express.Router();

// All health routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/health/metrics:
 *   get:
 *     summary: Get user's health metrics with filtering
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [bloodPressure, weight, heartRate, bloodSugar, temperature]
 *         description: Filter by metric type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of records to return
 *     responses:
 *       200:
 *         description: Health metrics retrieved successfully
 *       400:
 *         description: Invalid date range
 *       401:
 *         description: Unauthorized
 */
router.get('/metrics', validateRequest(validationSchemas.getHealthMetrics), async (req: any, res, next) => {
  try {
    const { type, startDate, endDate, limit = 50 } = req.query;
    const userId = req.user._id;

    // Build query
    const query: any = { user: userId };
    if (type) query.type = type;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate as string);
      if (endDate) query.timestamp.$lte = new Date(endDate as string);
    }

    const metrics = await HealthMetric.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit as string));

    // Calculate basic statistics
    const stats = await HealthMetric.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          average: { $avg: '$value' },
          min: { $min: '$value' },
          max: { $max: '$value' },
          latest: { $last: '$value' }
        }
      }
    ]);

    const summaries = stats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        average: Math.round(stat.average * 100) / 100,
        min: stat.min,
        max: stat.max,
        latest: stat.latest
      };
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        metrics: metrics.map(metric => ({
          ...metric.toJSON(),
          category: metric.getCategory(),
          displayValue: metric.getDisplayValue(),
          isWithinRange: metric.isWithinRange()
        })),
        summaries,
        total: metrics.length
      }
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * @swagger
 * /api/health/metrics:
 *   post:
 *     summary: Create a new health metric
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, value, unit]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [bloodPressure, weight, heartRate, bloodSugar, temperature]
 *               value:
 *                 type: number
 *               unit:
 *                 type: string
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *               source:
 *                 type: string
 *                 enum: [manual, device, automatic]
 *               metadata:
 *                 type: object
 *                 properties:
 *                   systolic:
 *                     type: number
 *                   diastolic:
 *                     type: number
 *                   position:
 *                     type: string
 *                     enum: [sitting, standing, lying]
 *                   device:
 *                     type: string
 *                   location:
 *                     type: string
 *     responses:
 *       201:
 *         description: Health metric created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/metrics', validateRequest(validationSchemas.createHealthMetric), async (req: any, res, next) => {
  try {
    const { type, value, unit, timestamp, notes, source, metadata } = req.body;

    const metric = new HealthMetric({
      user: req.user._id,
      type,
      value,
      unit,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      notes,
      source: source || 'manual',
      metadata: metadata || {}
    });

    // Special validation for blood pressure
    if (type === 'bloodPressure' && metadata) {
      if (!metadata.systolic || !metadata.diastolic) {
        return res.status(400).json({
          success: false,
          error: 'Blood pressure requires both systolic and diastolic values in metadata'
        });
      }
    }

    await metric.save();

    res.status(201).json({
      success: true,
      message: 'Health metric recorded successfully',
      data: {
        metric: {
          ...metric.toJSON(),
          category: metric.getCategory(),
          displayValue: metric.getDisplayValue(),
          isWithinRange: metric.isWithinRange()
        }
      }
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * @swagger
 * /api/health/metrics/{type}/summary:
 *   get:
 *     summary: Get health metric summary and trends
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [bloodPressure, weight, heartRate, bloodSugar, temperature]
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, year]
 *           default: month
 *         description: Time period for analysis
 *     responses:
 *       200:
 *         description: Summary retrieved successfully
 *       400:
 *         description: Invalid metric type or period
 *       401:
 *         description: Unauthorized
 */
router.get('/metrics/:type/summary', validateRequest({
  params: {
    type: {
      in: ['bloodPressure', 'weight', 'heartRate', 'bloodSugar', 'temperature'],
      error: 'Invalid metric type'
    }
  },
  query: {
    period: {
      in: ['week', 'month', 'year'],
      default: 'month',
      error: 'Invalid period. Must be week, month, or year'
    }
  }
}), async (req: any, res, next) => {
  try {
    const { type } = req.params;
    const { period = 'month' } = req.query;
    const userId = req.user._id;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    // Get statistics
    const stats = await (HealthMetric as any).calculateStats(userId, type, startDate, endDate);

    // Get trends
    const trends = await (HealthMetric as any).getTrends(userId, type, period === 'week' ? 7 : period === 'month' ? 30 : 365);

    // Get latest metrics
    const latestMetrics = await (HealthMetric as any).findByUserAndType(userId, type, startDate, endDate);

    // Generate insights based on type and data
    const insights = generateHealthInsights(type, stats[0], trends);

    res.json({
      success: true,
      data: {
        type,
        period,
        summary: stats[0] || {
          count: 0,
          average: 0,
          min: 0,
          max: 0
        },
        trends: trends.map(trend => ({
          date: new Date(trend._id.year, trend._id.month - 1, trend._id.day),
          value: Math.round(trend.value * 100) / 100,
          count: trend.count
        })),
        insights,
        totalRecords: latestMetrics.length
      }
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * @swagger
 * /api/health/metrics/{id}:
 *   delete:
 *     summary: Delete a health metric
 *     tags: [Health]
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
 *         description: Health metric deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Health metric not found
 */
router.delete('/metrics/:id', validateRequest(validationSchemas.idParam), async (req: any, res, next) => {
  try {
    const metric = await HealthMetric.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!metric) {
      return res.status(404).json({
        success: false,
        error: 'Health metric not found'
      });
    }

    await metric.deleteOne();

    res.json({
      success: true,
      message: 'Health metric deleted successfully'
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * @swagger
 * /api/health/export:
 *   get:
 *     summary: Export health data in various formats
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, csv]
 *           default: csv
 *         description: Export format
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for export
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for export
 *       - in: query
 *         name: types
 *         schema:
 *           type: string
 *           pattern: "^(bloodPressure|weight|heartRate|bloodSugar|temperature)(,(bloodPressure|weight|heartRate|bloodSugar|temperature))*$"
 *         description: Comma-separated metric types
 *     responses:
 *       200:
 *         description: Export generated successfully
 *       400:
 *         description: Invalid format or parameters
 *       401:
 *         description: Unauthorized
 *       503:
 *         description: Export service unavailable
 */
router.get('/export', validateRequest({
  query: {
    format: {
      in: ['pdf', 'csv'],
      default: 'csv',
      error: 'Format must be pdf or csv'
    },
    startDate: {
      custom: {
        options: {
          format: 'ISO8601'
        },
        optional: true
      }
    },
    endDate: {
      custom: {
        options: {
          format: 'ISO8601'
        },
        optional: true
      }
    },
    types: {
      custom: {
        options: {
          pattern: "^(bloodPressure|weight|heartRate|bloodSugar|temperature)(,(bloodPressure|weight|heartRate|bloodSugar|temperature))*$"
        },
        optional: true
      }
    }
  }
}), async (req: any, res, next) => {
  try {
    const { format = 'csv', startDate, endDate, types } = req.query;
    const userId = req.user._id;

    // Build query
    const query: any = { user: userId };
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate as string);
      if (endDate) query.timestamp.$lte = new Date(endDate as string);
    }
    if (types) {
      query.type = { $in: (types as string).split(',') };
    }

    const metrics = await HealthMetric.find(query)
      .sort({ timestamp: -1 });

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = ['Date', 'Type', 'Value', 'Unit', 'Display Value', 'Category', 'Notes', 'Source'];
      const csvRows = metrics.map(metric => [
        metric.timestamp.toISOString(),
        metric.type,
        metric.value,
        metric.unit,
        metric.getDisplayValue(),
        metric.getCategory(),
        metric.notes || '',
        metric.source
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="health-metrics-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } else {
      // TODO: Generate PDF using PDF service
      res.status(503).json({
        success: false,
        error: 'PDF export not yet implemented'
      });
    }
  } catch (error: any) {
    next(error);
  }
});

/**
 * @swagger
 * /api/health/latest:
 *   get:
 *     summary: Get latest health metrics of each type
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Latest metrics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/latest', async (req: any, res, next) => {
  try {
    const userId = req.user._id;

    const latestMetrics = await (HealthMetric as any).getLatestMetrics(userId);

    res.json({
      success: true,
      data: {
        metrics: latestMetrics.map(metric => ({
          ...metric,
          category: metric.getCategory?.() || 'normal',
          displayValue: metric.getDisplayValue?.() || `${metric.value} ${metric.unit}`,
          isWithinRange: metric.isWithinRange?.() || true
        }))
      }
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * @swagger
 * /api/health/goals:
 *   get:
 *     summary: Get health goals and progress
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Health goals retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/goals', async (req: any, res, next) => {
  try {
    const userId = req.user._id;

    // Get user's health metrics from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentMetrics = await HealthMetric.find({
      user: userId,
      timestamp: { $gte: thirtyDaysAgo }
    });

    // Generate goals based on user's data and health guidelines
    const goals = generateHealthGoals(recentMetrics, req.user.preferences);

    res.json({
      success: true,
      data: {
        goals,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error: any) {
    next(error);
  }
});

// Helper function to generate health insights
function generateHealthInsights(type: string, stats: any, trends: any[]): string[] {
  const insights: string[] = [];

  if (!stats || stats.count === 0) {
    return [`No ${type} data available for analysis`];
  }

  switch (type) {
    case 'bloodPressure':
      if (stats.average > 140) {
        insights.push('Your average blood pressure is elevated. Consider consulting with a healthcare provider.');
      } else if (stats.average < 120) {
        insights.push('Your blood pressure is within a healthy range. Keep up the good work!');
      }
      break;

    case 'weight':
      const trendDirection = trends.length > 1 ?
        (trends[trends.length - 1].value - trends[0].value) : 0;

      if (Math.abs(trendDirection) > 2) {
        insights.push(trendDirection > 0 ?
          'Your weight has been trending upward recently.' :
          'Your weight has been trending downward recently.'
        );
      }
      break;

    case 'heartRate':
      if (stats.average > 100) {
        insights.push('Your average heart rate is elevated. This could be due to stress, caffeine, or exercise.');
      } else if (stats.average < 60) {
        insights.push('Your average heart rate is low, which is normal for physically active individuals.');
      }
      break;

    case 'bloodSugar':
      if (stats.average > 126) {
        insights.push('Your average blood sugar is elevated. Please consult with a healthcare provider.');
      }
      break;

    case 'temperature':
      if (stats.average > 37.5) {
        insights.push('Your average temperature is slightly elevated. Monitor for signs of illness.');
      }
      break;
  }

  if (trends.length > 1) {
    const lastTrend = trends[trends.length - 1];
    const previousTrend = trends[trends.length - 2];
    const change = ((lastTrend.value - previousTrend.value) / previousTrend.value) * 100;

    if (Math.abs(change) > 10) {
      insights.push(`Recent change: ${change > 0 ? '+' : ''}${change.toFixed(1)}% compared to previous period.`);
    }
  }

  if (insights.length === 0) {
    insights.push('Your health metrics look consistent. Continue regular monitoring.');
  }

  return insights;
}

// Helper function to generate health goals
function generateHealthGoals(metrics: any[], userPreferences: any): any[] {
  const goals = [];

  // Weight goal based on recent measurements
  const weightMetrics = metrics.filter(m => m.type === 'weight');
  if (weightMetrics.length > 0) {
    const latestWeight = weightMetrics[0].value;
    goals.push({
      type: 'weight',
      current: latestWeight,
      target: 'Maintain current weight',
      unit: weightMetrics[0].unit,
      recommendation: 'Continue monitoring your weight weekly'
    });
  }

  // Blood pressure goal
  const bpMetrics = metrics.filter(m => m.type === 'bloodPressure');
  if (bpMetrics.length > 0) {
    goals.push({
      type: 'bloodPressure',
      current: 'Check latest reading',
      target: 'Below 120/80 mmHg',
      unit: 'mmHg',
      recommendation: 'Monitor blood pressure regularly and maintain a healthy lifestyle'
    });
  }

  // Exercise goal based on heart rate
  const hrMetrics = metrics.filter(m => m.type === 'heartRate');
  if (hrMetrics.length > 0) {
    goals.push({
      type: 'exercise',
      current: 'Varies',
      target: '150 minutes of moderate activity per week',
      unit: 'minutes/week',
      recommendation: 'Aim for at least 30 minutes of moderate exercise most days'
    });
  }

  return goals;
}

export default router;