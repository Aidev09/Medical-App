import { IMedicationRecord } from '../models/MedicationRecord';
import { scheduleJob } from 'node-schedule';
import { sendPushNotification } from './notificationService';

const activeReminders = new Map();

export const scheduleReminder = async (record: IMedicationRecord) => {
  try {
    // Cancel any existing reminder for this record
    if (activeReminders.has(record._id.toString())) {
      const existingJob = activeReminders.get(record._id.toString());
      existingJob.cancel();
    }

    // Schedule the reminder notification
    const job = scheduleJob(record.timeScheduled, async () => {
      try {
        // Send push notification
        await sendPushNotification({
          userId: record.userId,
          title: 'Medication Reminder',
          body: `Time to take ${record.medicationName} - ${record.dosage}`,
          data: {
            type: 'MEDICATION_REMINDER',
            recordId: record._id.toString()
          }
        });

        // After 30 minutes, check if medication was taken
        setTimeout(async () => {
          const updatedRecord = await MedicationRecord.findById(record._id);
          if (updatedRecord && updatedRecord.status === 'scheduled') {
            updatedRecord.status = 'missed';
            await updatedRecord.save();

            // Send missed medication notification
            await sendPushNotification({
              userId: record.userId,
              title: 'Missed Medication',
              body: `You missed your scheduled dose of ${record.medicationName}`,
              data: {
                type: 'MEDICATION_MISSED',
                recordId: record._id.toString()
              }
            });
          }
        }, 30 * 60 * 1000); // 30 minutes
      } catch (error) {
        console.error('Error in reminder job:', error);
      }
    });

    // Store the job reference
    activeReminders.set(record._id.toString(), job);
  } catch (error) {
    console.error('Error scheduling reminder:', error);
    throw error;
  }
};

export const cancelReminder = (recordId: string) => {
  if (activeReminders.has(recordId)) {
    const job = activeReminders.get(recordId);
    job.cancel();
    activeReminders.delete(recordId);
  }
}; 