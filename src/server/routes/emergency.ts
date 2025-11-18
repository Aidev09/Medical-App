import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import EmergencyService from '../services/emergencyService.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Find nearby emergency services
router.get('/nearby', asyncHandler(async (req: Request, res: Response) => {
  const { latitude, longitude, radius = 25 } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      error: 'Latitude and longitude are required'
    });
  }

  const services = await EmergencyService.findNearbyEmergencyServices(
    parseFloat(latitude as string),
    parseFloat(longitude as string),
    parseFloat(radius as string)
  );

  res.json({
    success: true,
    data: services
  });
}));

// Report emergency incident
router.post('/incidents', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const incidentData = req.body;

  const incident = await EmergencyService.reportEmergencyIncident(userId, incidentData);

  res.status(201).json({
    success: true,
    data: incident
  });
}));

// Get emergency guidelines
router.get('/guidelines/:category', asyncHandler(async (req: Request, res: Response) => {
  const { category } = req.params;
  const { language = 'en' } = req.query;

  const guidelines = await EmergencyService.getEmergencyGuidelines(
    category,
    language as string
  );

  res.json({
    success: true,
    data: guidelines
  });
}));

// Get first aid instructions
router.get('/first-aid/:condition', asyncHandler(async (req: Request, res: Response) => {
  const { condition } = req.params;
  const { severity = 'moderate', language = 'en' } = req.query;

  const instructions = await EmergencyService.getFirstAidInstructions(
    condition,
    severity as 'mild' | 'moderate' | 'severe',
    language as string
  );

  res.json({
    success: true,
    data: instructions
  });
}));

// Call emergency services
router.post('/call', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { emergencyType, location, contactNumber, notes } = req.body;

  const result = await EmergencyService.callEmergencyServices(userId, {
    emergencyType,
    location,
    contactNumber,
    notes
  });

  res.status(201).json({
    success: true,
    data: result
  });
}));

// Get emergency contacts
router.get('/contacts', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const contacts = await EmergencyService.getEmergencyContacts(userId);

  res.json({
    success: true,
    data: contacts
  });
}));

// Add emergency contact
router.post('/contacts', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const contactData = req.body;

  const contact = await EmergencyService.addEmergencyContact(userId, contactData);

  res.status(201).json({
    success: true,
    data: contact
  });
}));

// Update emergency contact
router.put('/contacts/:contactId', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { contactId } = req.params;
  const updateData = req.body;

  const contact = await EmergencyService.updateEmergencyContact(
    userId,
    parseInt(contactId),
    updateData
  );

  if (!contact) {
    return res.status(404).json({
      success: false,
      error: 'Emergency contact not found'
    });
  }

  res.json({
    success: true,
    data: contact
  });
}));

// Delete emergency contact
router.delete('/contacts/:contactId', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { contactId } = req.params;

  await EmergencyService.removeEmergencyContact(userId, parseInt(contactId));

  res.json({
    success: true,
    message: 'Emergency contact removed successfully'
  });
}));

// Get hospital wait times
router.get('/wait-times', asyncHandler(async (req: Request, res: Response) => {
  const { latitude, longitude, radius = 50 } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      error: 'Latitude and longitude are required'
    });
  }

  const waitTimes = await EmergencyService.getHospitalWaitTimes(
    parseFloat(latitude as string),
    parseFloat(longitude as string),
    parseFloat(radius as string)
  );

  res.json({
    success: true,
    data: waitTimes
  });
}));

// Find urgent care centers
router.get('/urgent-care', asyncHandler(async (req: Request, res: Response) => {
  const { latitude, longitude, radius = 25, acceptsInsurance, isOpenNow } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      error: 'Latitude and longitude are required'
    });
  }

  const urgentCare = await EmergencyService.findUrgentCareCenters(
    parseFloat(latitude as string),
    parseFloat(longitude as string),
    {
      radius: parseFloat(radius as string),
      acceptsInsurance: acceptsInsurance === 'true',
      isOpenNow: isOpenNow === 'true'
    }
  );

  res.json({
    success: true,
    data: urgentCare
  });
}));

// Get emergency room information
router.get('/emergency-rooms/:hospitalId', asyncHandler(async (req: Request, res: Response) => {
  const { hospitalId } = req.params;

  const erInfo = await EmergencyService.getEmergencyRoomInfo(parseInt(hospitalId));

  if (!erInfo) {
    return res.status(404).json({
      success: false,
      error: 'Emergency room information not found'
    });
  }

  res.json({
    success: true,
    data: erInfo
  });
}));

// Get poison control information
router.get('/poison-control', asyncHandler(async (req: Request, res: Response) => {
  const { substance, age, weight, timeElapsed } = req.query;

  const info = await EmergencyService.getPoisonControlInfo({
    substance: substance as string,
    age: age ? parseInt(age as string) : undefined,
    weight: weight ? parseFloat(weight as string) : undefined,
    timeElapsed: timeElapsed ? timeElapsed as string : undefined
  });

  res.json({
    success: true,
    data: info
  });
}));

// Get mental health crisis resources
router.get('/mental-health-crisis', asyncHandler(async (req: Request, res: Response) => {
  const { latitude, longitude, crisisType } = req.query;

  const resources = await EmergencyService.getMentalHealthCrisisResources({
    latitude: latitude ? parseFloat(latitude as string) : undefined,
    longitude: longitude ? parseFloat(longitude as string) : undefined,
    crisisType: crisisType as string
  });

  res.json({
    success: true,
    data: resources
  });
}));

// Check emergency service availability
router.get('/availability/:serviceType', asyncHandler(async (req: Request, res: Response) => {
  const { serviceType } = req.params;
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      error: 'Latitude and longitude are required'
    });
  }

  const availability = await EmergencyService.checkEmergencyServiceAvailability(
    serviceType,
    parseFloat(latitude as string),
    parseFloat(longitude as string)
  );

  res.json({
    success: true,
    data: availability
  });
}));

export default router;