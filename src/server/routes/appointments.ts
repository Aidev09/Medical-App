import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import AppointmentService from '../services/appointmentService.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Create new appointment
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const appointmentData = {
    ...req.body,
    patientId: userId
  };

  const appointment = await AppointmentService.createAppointment(appointmentData);

  res.status(201).json({
    success: true,
    data: appointment
  });
}));

// Get available slots for a doctor
router.get('/slots/doctor/:doctorId', asyncHandler(async (req: Request, res: Response) => {
  const { doctorId } = req.params;
  const { date, type = 'in-person' } = req.query;

  const appointmentDate = new Date(date as string);
  const slots = await AppointmentService.getAvailableSlots(
    parseInt(doctorId),
    appointmentDate,
    type as any
  );

  res.json({
    success: true,
    data: slots
  });
}));

// Get appointment details
router.get('/:appointmentId', asyncHandler(async (req: Request, res: Response) => {
  const { appointmentId } = req.params;
  const userId = (req as any).user.id;

  const appointment = await AppointmentService.getAppointmentDetails(parseInt(appointmentId));

  if (!appointment) {
    return res.status(404).json({
      success: false,
      error: 'Appointment not found'
    });
  }

  // Check if user is authorized to view this appointment
  if (appointment.patientId !== userId) {
    return res.status(403).json({
      success: false,
      error: 'Unauthorized to view this appointment'
    });
  }

  res.json({
    success: true,
    data: appointment
  });
}));

// Reschedule appointment
router.patch('/:appointmentId/reschedule', asyncHandler(async (req: Request, res: Response) => {
  const { appointmentId } = req.params;
  const { newDateTime, reason } = req.body;
  const userId = (req as any).user.id;

  if (!newDateTime || !reason) {
    return res.status(400).json({
      success: false,
      error: 'New date time and reason are required'
    });
  }

  const appointment = await AppointmentService.rescheduleAppointment(
    parseInt(appointmentId),
    new Date(newDateTime),
    reason,
    'patient'
  );

  res.json({
    success: true,
    data: appointment
  });
}));

// Cancel appointment
router.patch('/:appointmentId/cancel', asyncHandler(async (req: Request, res: Response) => {
  const { appointmentId } = req.params;
  const { reason } = req.body;
  const userId = (req as any).user.id;

  if (!reason) {
    return res.status(400).json({
      success: false,
      error: 'Cancellation reason is required'
    });
  }

  const appointment = await AppointmentService.cancelAppointment(
    parseInt(appointmentId),
    reason,
    'patient'
  );

  res.json({
    success: true,
    data: appointment
  });
}));

// Confirm appointment
router.patch('/:appointmentId/confirm', asyncHandler(async (req: Request, res: Response) => {
  const { appointmentId } = req.params;

  const appointment = await AppointmentService.confirmAppointment(parseInt(appointmentId));

  res.json({
    success: true,
    data: appointment
  });
}));

// Start appointment
router.patch('/:appointmentId/start', asyncHandler(async (req: Request, res: Response) => {
  const { appointmentId } = req.params;

  const appointment = await AppointmentService.startAppointment(parseInt(appointmentId));

  res.json({
    success: true,
    data: appointment
  });
}));

// Complete appointment
router.patch('/:appointmentId/complete', asyncHandler(async (req: Request, res: Response) => {
  const { appointmentId } = req.params;
  const { followUpData } = req.body;

  const appointment = await AppointmentService.completeAppointment(
    parseInt(appointmentId),
    followUpData
  );

  res.json({
    success: true,
    data: appointment
  });
}));

// Add review to appointment
router.post('/:appointmentId/review', asyncHandler(async (req: Request, res: Response) => {
  const { appointmentId } = req.params;
  const { rating, comment } = req.body;
  const userId = (req as any).user.id;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      error: 'Valid rating (1-5) is required'
    });
  }

  await AppointmentService.addAppointmentReview(
    parseInt(appointmentId),
    userId,
    rating,
    comment
  );

  res.json({
    success: true,
    message: 'Review added successfully'
  });
}));

// Upload appointment document
router.post('/:appointmentId/documents', asyncHandler(async (req: Request, res: Response) => {
  const { appointmentId } = req.params;
  const document = req.body;
  const userId = (req as any).user.id;

  if (!document.name || !document.url || !document.type) {
    return res.status(400).json({
      success: false,
      error: 'Document name, URL, and type are required'
    });
  }

  await AppointmentService.uploadAppointmentDocument(
    parseInt(appointmentId),
    userId,
    document
  );

  res.status(201).json({
    success: true,
    message: 'Document uploaded successfully'
  });
}));

// Get patient's appointments
router.get('/patient/my-appointments', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { status, limit = 50 } = req.query;

  const appointments = await AppointmentService.getPatientAppointments(
    userId,
    status as string,
    parseInt(limit as string)
  );

  res.json({
    success: true,
    data: appointments
  });
}));

// Get upcoming appointments
router.get('/patient/upcoming', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const appointments = await AppointmentService.searchAppointments({
    patientId: userId,
    status: ['scheduled', 'confirmed']
  });

  const upcoming = appointments.filter(apt => apt.isUpcoming());

  res.json({
    success: true,
    data: upcoming
  });
}));

// Get pending reviews
router.get('/patient/pending-reviews', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const appointments = await Appointment.findPendingReviews(userId);

  res.json({
    success: true,
    data: appointments
  });
}));

// Search appointments (for doctors or admin)
router.get('/search', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const userRole = (req as any).user.role;

  // Only doctors and admin can search appointments
  if (!['doctor', 'admin'].includes(userRole)) {
    return res.status(403).json({
      success: false,
      error: 'Unauthorized'
    });
  }

  const criteria = {
    doctorId: userRole === 'doctor' ? userId : undefined,
    ...req.query
  };

  const appointments = await AppointmentService.searchAppointments(criteria);

  res.json({
    success: true,
    data: appointments
  });
}));

// Get appointment statistics (for doctors)
router.get('/statistics', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const userRole = (req as any).user.role;

  if (!['doctor', 'admin'].includes(userRole)) {
    return res.status(403).json({
      success: false,
      error: 'Unauthorized'
    });
  }

  const { start, end } = req.query;
  const dateRange = start && end ? {
    start: new Date(start as string),
    end: new Date(end as string)
  } : undefined;

  const statistics = await AppointmentService.getAppointmentStatistics(
    userRole === 'doctor' ? userId : undefined,
    dateRange
  );

  res.json({
    success: true,
    data: statistics
  });
}));

export default router;