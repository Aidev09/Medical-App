import { Op, Sequelize } from 'sequelize';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import { sendEmail, sendSMS } from './notificationService.js';

export interface CreateAppointmentData {
  patientId: number;
  doctorId: number;
  appointmentType: 'in-person' | 'video' | 'phone' | 'chat';
  scheduledDateTime: Date;
  duration: number;
  reason: string;
  symptoms?: string;
  medicalHistory?: string;
  medications?: string[];
  allergies?: string[];
  notes?: string;
  consultation: {
    fee: number;
    currency: string;
    insuranceUsed: boolean;
    insuranceDetails?: any;
  };
  location?: any;
  telehealth?: any;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface AvailableSlot {
  start: Date;
  end: Date;
  duration: number;
  doctorId: number;
  doctorName: string;
  consultationType: string;
  fee: number;
}

export interface AppointmentSearchCriteria {
  doctorId?: number;
  patientId?: number;
  status?: string[];
  appointmentType?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  priority?: string[];
}

class AppointmentService {
  private sequelize: Sequelize;

  constructor() {
    this.sequelize = new Sequelize(process.env.DATABASE_URL || '');
  }

  async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    return await this.sequelize.transaction(async (t) => {
      // Validate doctor exists and is available
      const doctor = await Doctor.findByPk(data.doctorId, { transaction: t });
      if (!doctor || !doctor.isActive) {
        throw new Error('Doctor not available');
      }

      // Validate patient exists
      const patient = await User.findByPk(data.patientId, { transaction: t });
      if (!patient) {
        throw new Error('Patient not found');
      }

      // Check for time conflicts
      const conflict = await Appointment.findConflicts(
        data.doctorId,
        data.scheduledDateTime,
        data.duration,
        undefined,
        { transaction: t }
      );

      if (conflict) {
        throw new Error('Doctor is not available at the requested time');
      }

      // Create the appointment
      const appointment = await Appointment.create({
        ...data,
        status: 'scheduled',
        priority: data.priority || 'normal',
        timezone: doctor.availability.timezone,
        cancellationPolicy: {
          refundable: true,
          noticePeriodHours: 24,
          cancellationFee: 0,
          cancellationFeeType: 'fixed'
        },
        reminders: {
          email: true,
          sms: true,
          push: true,
          times: [1440, 60, 15] // 24 hours, 1 hour, 15 minutes before
        }
      }, { transaction: t });

      // Send confirmation notifications
      await this.sendAppointmentNotifications(appointment, 'created', patient, doctor);

      return appointment;
    });
  }

  async rescheduleAppointment(
    appointmentId: number,
    newDateTime: Date,
    reason: string,
    requestedBy: 'patient' | 'doctor' | 'staff'
  ): Promise<Appointment> {
    return await this.sequelize.transaction(async (t) => {
      const appointment = await Appointment.findByPk(appointmentId, { transaction: t });
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      if (!appointment.canBeRescheduled()) {
        throw new Error('Appointment cannot be rescheduled');
      }

      const oldDateTime = appointment.scheduledDateTime;

      // Check for conflicts at the new time
      const conflict = await Appointment.findConflicts(
        appointment.doctorId,
        newDateTime,
        appointment.duration,
        appointmentId,
        { transaction: t }
      );

      if (conflict) {
        throw new Error('Doctor is not available at the requested time');
      }

      // Update appointment
      await appointment.update({
        scheduledDateTime: newDateTime,
        status: 'rescheduled'
      }, { transaction: t });

      // Add to reschedule history
      appointment.addToRescheduleHistory(oldDateTime, newDateTime, reason, requestedBy);

      // Send notifications
      const [patient, doctor] = await Promise.all([
        User.findByPk(appointment.patientId, { transaction: t }),
        Doctor.findByPk(appointment.doctorId, { transaction: t })
      ]);

      if (patient && doctor) {
        await this.sendAppointmentNotifications(appointment, 'rescheduled', patient, doctor, {
          oldDateTime,
          newDateTime,
          reason
        });
      }

      return appointment;
    });
  }

  async cancelAppointment(
    appointmentId: number,
    reason: string,
    cancelledBy: 'patient' | 'doctor' | 'staff'
  ): Promise<Appointment> {
    return await this.sequelize.transaction(async (t) => {
      const appointment = await Appointment.findByPk(appointmentId, { transaction: t });
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      if (!appointment.canBeCancelled()) {
        throw new Error('Appointment cannot be cancelled');
      }

      // Update appointment
      await appointment.update({
        status: 'cancelled',
        cancellationReason: reason,
        cancelledBy,
        cancellationDate: new Date()
      }, { transaction: t });

      // Process refund if applicable
      if (appointment.consultation.paymentStatus === 'paid') {
        const refundAmount = appointment.getRefundAmount();
        if (refundAmount > 0) {
          await this.processRefund(appointment, refundAmount, t);
        }
      }

      // Send notifications
      const [patient, doctor] = await Promise.all([
        User.findByPk(appointment.patientId, { transaction: t }),
        Doctor.findByPk(appointment.doctorId, { transaction: t })
      ]);

      if (patient && doctor) {
        await this.sendAppointmentNotifications(appointment, 'cancelled', patient, doctor, {
          reason,
          refundAmount: appointment.getRefundAmount()
        });
      }

      return appointment;
    });
  }

  async confirmAppointment(appointmentId: number): Promise<Appointment> {
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.status !== 'scheduled') {
      throw new Error('Appointment cannot be confirmed');
    }

    await appointment.update({ status: 'confirmed' });

    // Send confirmation notifications
    const [patient, doctor] = await Promise.all([
      User.findByPk(appointment.patientId),
      Doctor.findByPk(appointment.doctorId)
    ]);

    if (patient && doctor) {
      await this.sendAppointmentNotifications(appointment, 'confirmed', patient, doctor);
    }

    return appointment;
  }

  async startAppointment(appointmentId: number): Promise<Appointment> {
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (!['scheduled', 'confirmed'].includes(appointment.status)) {
      throw new Error('Appointment cannot be started');
    }

    if (appointment.scheduledDateTime > new Date()) {
      throw new Error('Appointment time has not arrived yet');
    }

    await appointment.update({ status: 'in-progress' });

    return appointment;
  }

  async completeAppointment(
    appointmentId: number,
    followUpData?: {
      recommended: boolean;
      suggestedTimeframe?: string;
      nextAppointmentType?: string;
      notes?: string;
    }
  ): Promise<Appointment> {
    return await this.sequelize.transaction(async (t) => {
      const appointment = await Appointment.findByPk(appointmentId, { transaction: t });
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      if (appointment.status !== 'in-progress') {
        throw new Error('Appointment cannot be completed');
      }

      // Update appointment status
      await appointment.update({
        status: 'completed',
        followUp: followUpData
      }, { transaction: t });

      // Process payment if not already paid
      if (appointment.consultation.paymentStatus === 'pending') {
        await this.processPayment(appointment, t);
      }

      // Send completion notifications
      const [patient, doctor] = await Promise.all([
        User.findByPk(appointment.patientId, { transaction: t }),
        Doctor.findByPk(appointment.doctorId, { transaction: t })
      ]);

      if (patient && doctor) {
        await this.sendAppointmentNotifications(appointment, 'completed', patient, doctor, {
          followUpData
        });
      }

      return appointment;
    });
  }

  async getAvailableSlots(
    doctorId: number,
    date: Date,
    appointmentType: 'in-person' | 'video' | 'phone' | 'chat' = 'in-person'
  ): Promise<AvailableSlot[]> {
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor || !doctor.isActive) {
      throw new Error('Doctor not available');
    }

    // Get doctor's available time slots for the date
    const availableTimes = doctor.getAvailableTimeSlots(date);
    if (availableTimes.length === 0) {
      return [];
    }

    // Get existing appointments for the date
    const existingAppointments = await Appointment.findAll({
      where: {
        doctorId,
        scheduledDateTime: {
          [Op.between]: [
            new Date(date.setHours(0, 0, 0, 0)),
            new Date(date.setHours(23, 59, 59, 999))
          ]
        },
        status: ['scheduled', 'confirmed']
      }
    });

    // Find consultation type details
    const consultationType = doctor.consultationTypes.find(
      type => type.type === appointmentType
    );

    if (!consultationType) {
      throw new Error('Consultation type not available for this doctor');
    }

    const duration = consultationType.duration;
    const fee = consultationType.fee;

    // Filter out occupied time slots
    const availableSlots: AvailableSlot[] = [];
    const occupiedRanges = existingAppointments.map(apt => ({
      start: apt.scheduledDateTime,
      end: new Date(apt.scheduledDateTime.getTime() + apt.duration * 60000)
    }));

    for (const timeString of availableTimes) {
      const [hours, minutes] = timeString.split(':').map(Number);
      const slotStart = new Date(date);
      slotStart.setHours(hours, minutes, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + duration * 60000);

      // Check if slot conflicts with existing appointments
      const hasConflict = occupiedRanges.some(range =>
        (slotStart < range.end && slotEnd > range.start)
      );

      if (!hasConflict) {
        availableSlots.push({
          start: slotStart,
          end: slotEnd,
          duration,
          doctorId,
          doctorName: doctor.getFullName(),
          consultationType: appointmentType,
          fee
        });
      }
    }

    return availableSlots;
  }

  async searchAppointments(criteria: AppointmentSearchCriteria): Promise<Appointment[]> {
    const whereClause: any = {};

    if (criteria.doctorId) whereClause.doctorId = criteria.doctorId;
    if (criteria.patientId) whereClause.patientId = criteria.patientId;
    if (criteria.status) whereClause.status = { [Op.in]: criteria.status };
    if (criteria.appointmentType) whereClause.appointmentType = { [Op.in]: criteria.appointmentType };
    if (criteria.priority) whereClause.priority = { [Op.in]: criteria.priority };

    if (criteria.dateRange) {
      whereClause.scheduledDateTime = {
        [Op.between]: [criteria.dateRange.start, criteria.dateRange.end]
      };
    }

    return await Appointment.findAll({
      where: whereClause,
      order: [['scheduledDateTime', 'DESC']],
      include: [
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['id', 'firstName', 'lastName', 'specialization']
        }
      ]
    });
  }

  async getAppointmentDetails(appointmentId: number): Promise<Appointment | null> {
    return await Appointment.findByPk(appointmentId, {
      include: [
        {
          model: Doctor,
          as: 'doctor'
        }
      ]
    });
  }

  async getPatientAppointments(
    patientId: number,
    status?: string,
    limit: number = 50
  ): Promise<Appointment[]> {
    const whereClause: any = { patientId };
    if (status) whereClause.status = status;

    return await Appointment.findAll({
      where: whereClause,
      order: [['scheduledDateTime', 'DESC']],
      limit,
      include: [
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['id', 'firstName', 'lastName', 'specialization', 'profileImage']
        }
      ]
    });
  }

  async getDoctorAppointments(
    doctorId: number,
    dateRange?: { start: Date; end: Date }
  ): Promise<Appointment[]> {
    const whereClause: any = { doctorId };

    if (dateRange) {
      whereClause.scheduledDateTime = {
        [Op.between]: [dateRange.start, dateRange.end]
      };
    }

    return await Appointment.findAll({
      where: whereClause,
      order: [['scheduledDateTime', 'ASC']],
      include: [
        {
          model: User,
          as: 'patient',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });
  }

  async addAppointmentReview(
    appointmentId: number,
    patientId: number,
    rating: number,
    comment?: string
  ): Promise<void> {
    return await this.sequelize.transaction(async (t) => {
      const appointment = await Appointment.findByPk(appointmentId, { transaction: t });
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      if (appointment.patientId !== patientId) {
        throw new Error('Unauthorized to review this appointment');
      }

      if (appointment.status !== 'completed') {
        throw new Error('Can only review completed appointments');
      }

      // Add review to appointment
      appointment.addReview(rating, comment);
      await appointment.save({ transaction: t });

      // Update doctor's average rating
      const doctor = await Doctor.findByPk(appointment.doctorId, { transaction: t });
      if (doctor) {
        const appointments = await Appointment.findAll({
          where: {
            doctorId: appointment.doctorId,
            status: 'completed'
          },
          transaction: t
        });

        const allReviews = appointments.flatMap(apt => apt.reviews);
        const totalReviews = allReviews.length;
        const averageRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

        await doctor.update({
          averageRating,
          totalReviews
        }, { transaction: t });
      }
    });
  }

  async uploadAppointmentDocument(
    appointmentId: number,
    userId: number,
    document: {
      type: 'medical_record' | 'prescription' | 'lab_result' | 'imaging' | 'insurance' | 'other';
      name: string;
      url: string;
    }
  ): Promise<void> {
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.patientId !== userId) {
      throw new Error('Unauthorized to upload documents to this appointment');
    }

    appointment.addDocument({
      ...document,
      uploadedBy: 'patient'
    });

    await appointment.save();
  }

  async getAppointmentStatistics(doctorId?: number, dateRange?: { start: Date; end: Date }) {
    const whereClause: any = {};

    if (doctorId) whereClause.doctorId = doctorId;
    if (dateRange) {
      whereClause.scheduledDateTime = {
        [Op.between]: [dateRange.start, dateRange.end]
      };
    }

    return await Appointment.getStatistics(whereClause);
  }

  private async sendAppointmentNotifications(
    appointment: Appointment,
    action: 'created' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed',
    patient: any,
    doctor: any,
    additionalData?: any
  ): Promise<void> {
    const emailData = {
      to: patient.email,
      subject: this.getNotificationSubject(action, doctor),
      template: `appointment-${action}`,
      data: {
        patientName: `${patient.firstName} ${patient.lastName}`,
        doctorName: doctor.getFullName(),
        appointment: appointment,
        additionalData
      }
    };

    const smsData = {
      to: patient.phone,
      message: this.getSMSMessage(action, doctor, appointment, additionalData)
    };

    try {
      await Promise.all([
        sendEmail(emailData),
        sendSMS(smsData)
      ]);
    } catch (error) {
      console.error('Error sending appointment notifications:', error);
    }
  }

  private getNotificationSubject(action: string, doctor: Doctor): string {
    const subjects = {
      created: `Appointment Scheduled with ${doctor.getFullName()}`,
      confirmed: `Appointment Confirmed with ${doctor.getFullName()}`,
      rescheduled: `Appointment Rescheduled with ${doctor.getFullName()}`,
      cancelled: `Appointment Cancelled with ${doctor.getFullName()}`,
      completed: `Appointment Completed with ${doctor.getFullName()}`
    };

    return subjects[action as keyof typeof subjects] || 'Appointment Update';
  }

  private getSMSMessage(
    action: string,
    doctor: Doctor,
    appointment: Appointment,
    additionalData?: any
  ): string {
    const doctorName = doctor.getFullName();
    const dateTime = appointment.getFormattedDateTime();

    const messages = {
      created: `Your appointment with Dr. ${doctorName} has been scheduled for ${dateTime}.`,
      confirmed: `Your appointment with Dr. ${doctorName} on ${dateTime} has been confirmed.`,
      rescheduled: `Your appointment with Dr. ${doctorName} has been rescheduled to ${dateTime}.`,
      cancelled: `Your appointment with Dr. ${doctorName} has been cancelled.`,
      completed: `Thank you for visiting Dr. ${doctorName}. Your appointment is complete.`
    };

    return messages[action as keyof typeof messages] || 'Appointment updated.';
  }

  private async processPayment(appointment: Appointment, transaction: any): Promise<void> {
    // Payment processing logic would go here
    // This would integrate with payment gateways like Stripe
    console.log(`Processing payment for appointment ${appointment.id}`);
  }

  private async processRefund(appointment: Appointment, amount: number, transaction: any): Promise<void> {
    // Refund processing logic would go here
    console.log(`Processing refund of $${amount} for appointment ${appointment.id}`);
  }
}

export default new AppointmentService();