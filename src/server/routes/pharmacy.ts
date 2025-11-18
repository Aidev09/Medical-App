import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import PharmacyService from '../services/pharmacyService.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Find nearby pharmacies
router.get('/nearby', asyncHandler(async (req: Request, res: Response) => {
  const { latitude, longitude, radius = 25 } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      error: 'Latitude and longitude are required'
    });
  }

  const pharmacies = await PharmacyService.findNearbyPharmacies(
    parseFloat(latitude as string),
    parseFloat(longitude as string),
    parseFloat(radius as string)
  );

  res.json({
    success: true,
    data: pharmacies
  });
}));

// Check medication availability
router.post('/medication-availability', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { medicationName, dosage, quantity, location } = req.body;

  const availability = await PharmacyService.checkMedicationAvailability(userId, {
    medicationName,
    dosage,
    quantity: parseInt(quantity),
    location
  });

  res.json({
    success: true,
    data: availability
  });
}));

// Transfer prescription
router.post('/prescription-transfer', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const transferData = req.body;

  const transfer = await PharmacyService.transferPrescription(userId, transferData);

  res.status(201).json({
    success: true,
    data: transfer
  });
}));

// Get medication pricing
router.post('/medication-pricing', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { medications, insuranceProvider, location } = req.body;

  const pricing = await PharmacyService.getMedicationPricing(userId, {
    medications,
    insuranceProvider,
    location
  });

  res.json({
    success: true,
    data: pricing
  });
}));

// Order medication delivery
router.post('/delivery-order', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const orderData = req.body;

  const order = await PharmacyService.orderMedicationDelivery(userId, orderData);

  res.status(201).json({
    success: true,
    data: order
  });
}));

// Get delivery status
router.get('/delivery/:orderId', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { orderId } = req.params;

  const status = await PharmacyService.getDeliveryStatus(userId, orderId);

  if (!status) {
    return res.status(404).json({
      success: false,
      error: 'Delivery order not found'
    });
  }

  res.json({
    success: true,
    data: status
  });
}));

// Get user prescription history
router.get('/prescriptions', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { status, limit = 10, offset = 0 } = req.query;

  const prescriptions = await PharmacyService.getPrescriptionHistory(userId, {
    status: status as string,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string)
  });

  res.json({
    success: true,
    data: prescriptions
  });
}));

// Refill prescription
router.post('/prescriptions/:prescriptionId/refill', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { prescriptionId } = req.params;
  const { pharmacyId, notes } = req.body;

  const refill = await PharmacyService.refillPrescription(userId, parseInt(prescriptionId), {
    pharmacyId,
    notes
  });

  res.status(201).json({
    success: true,
    data: refill
  });
}));

// Get pharmacy information
router.get('/pharmacies/:pharmacyId', asyncHandler(async (req: Request, res: Response) => {
  const { pharmacyId } = req.params;

  const pharmacy = await PharmacyService.getPharmacyInformation(parseInt(pharmacyId));

  if (!pharmacy) {
    return res.status(404).json({
      success: false,
      error: 'Pharmacy not found'
    });
  }

  res.json({
    success: true,
    data: pharmacy
  });
}));

// Check drug interactions
router.post('/drug-interactions', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { medications } = req.body;

  const interactions = await PharmacyService.checkDrugInteractions(userId, medications);

  res.json({
    success: true,
    data: interactions
  });
}));

// Get medication information
router.get('/medication/:medicationName', asyncHandler(async (req: Request, res: Response) => {
  const { medicationName } = req.params;

  const info = await PharmacyService.getMedicationInformation(medicationName);

  if (!info) {
    return res.status(404).json({
      success: false,
      error: 'Medication information not found'
    });
  }

  res.json({
    success: true,
    data: info
  });
}));

// Find 24-hour pharmacies
router.get('/24hour', asyncHandler(async (req: Request, res: Response) => {
  const { latitude, longitude, radius = 50 } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      error: 'Latitude and longitude are required'
    });
  }

  const pharmacies = await PharmacyService.find24HourPharmacies(
    parseFloat(latitude as string),
    parseFloat(longitude as string),
    parseFloat(radius as string)
  );

  res.json({
    success: true,
    data: pharmacies
  });
}));

// Get pharmacy reviews
router.get('/pharmacies/:pharmacyId/reviews', asyncHandler(async (req: Request, res: Response) => {
  const { pharmacyId } = req.params;
  const { limit = 10, offset = 0 } = req.query;

  const reviews = await PharmacyService.getPharmacyReviews(
    parseInt(pharmacyId),
    parseInt(limit as string),
    parseInt(offset as string)
  );

  res.json({
    success: true,
    data: reviews
  });
}));

// Submit pharmacy review
router.post('/pharmacies/:pharmacyId/reviews', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { pharmacyId } = req.params;
  const reviewData = req.body;

  const review = await PharmacyService.submitPharmacyReview(
    userId,
    parseInt(pharmacyId),
    reviewData
  );

  res.status(201).json({
    success: true,
    data: review
  });
}));

// Compare pharmacy prices
router.post('/price-comparison', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { medication, location, pharmacies } = req.body;

  const comparison = await PharmacyService.comparePharmacyPrices(userId, {
    medication,
    location,
    pharmacies
  });

  res.json({
    success: true,
    data: comparison
  });
}));

// Get medication reminders
router.get('/medication-reminders', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const reminders = await PharmacyService.getMedicationReminders(userId);

  res.json({
    success: true,
    data: reminders
  });
}));

// Set medication reminder
router.post('/medication-reminders', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const reminderData = req.body;

  const reminder = await PharmacyService.setMedicationReminder(userId, reminderData);

  res.status(201).json({
    success: true,
    data: reminder
  });
}));

export default router;