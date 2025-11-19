import express from 'express';
import { auth } from '../middleware/auth';
import MedicationRecord from '../models/MedicationRecord';
import { scheduleReminder } from '../services/reminderService';

const router = express.Router();

// Get all medication records for the user
router.get('/', auth, async (req, res) => {
  try {
    const records = await MedicationRecord.find({ userId: req.user._id })
      .sort({ timeScheduled: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching medication records' });
  }
});

// Schedule a new medication
router.post('/schedule', auth, async (req, res) => {
  try {
    const { medicationName, dosage, timeScheduled, notes } = req.body;

    const newRecord = new MedicationRecord({
      userId: req.user._id,
      medicationName,
      dosage,
      timeScheduled: new Date(timeScheduled),
      notes
    });

    await newRecord.save();

    // Schedule a reminder for this medication
    await scheduleReminder(newRecord);

    res.status(201).json(newRecord);
  } catch (error) {
    res.status(400).json({ message: 'Error scheduling medication' });
  }
});

// Mark medication as taken
router.post('/:id/taken', auth, async (req, res) => {
  try {
    const record = await MedicationRecord.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    record.status = 'taken';
    record.timeTaken = new Date();
    await record.save();

    res.json(record);
  } catch (error) {
    res.status(400).json({ message: 'Error updating medication status' });
  }
});

// Get medication statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days

    const stats = await MedicationRecord.aggregate([
      {
        $match: {
          userId: req.user._id,
          timeScheduled: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

// Download medication records
router.get('/download', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {
      userId: req.user._id,
      timeScheduled: {}
    };

    if (startDate) {
      query.timeScheduled.$gte = new Date(startDate as string);
    }
    if (endDate) {
      query.timeScheduled.$lte = new Date(endDate as string);
    }

    const records = await MedicationRecord.find(query)
      .sort({ timeScheduled: -1 });

    const csvContent = records.map(record => {
      return `${record.medicationName},${record.dosage},${record.timeScheduled},${record.timeTaken || 'Not taken'},${record.status},${record.notes || ''}\n`;
    }).join('');

    const headers = 'Medication,Dosage,Scheduled Time,Taken Time,Status,Notes\n';

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=medication-records-${new Date().toISOString().split('T')[0]}.csv`);
    
    res.send(headers + csvContent);
  } catch (error) {
    res.status(500).json({ message: 'Error downloading records' });
  }
});

export default router; 