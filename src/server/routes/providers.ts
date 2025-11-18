import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import ProviderDirectoryService from '../services/providerDirectoryService.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Search healthcare providers
router.get('/search', asyncHandler(async (req: Request, res: Response) => {
  const {
    query,
    specialization,
    location,
    availability,
    insurance,
    rating,
    languages,
    gender,
    acceptsNewPatients,
    consultationFee,
    experience,
    isVerified,
    pageSize,
    page,
    sortBy,
    sortOrder
  } = req.query;

  const criteria = {
    query: query as string,
    specialization: specialization as string,
    location: location ? JSON.parse(location as string) : undefined,
    availability: availability ? JSON.parse(availability as string) : undefined,
    insurance: insurance ? JSON.parse(insurance as string) : undefined,
    rating: rating ? JSON.parse(rating as string) : undefined,
    languages: languages ? JSON.parse(languages as string) : undefined,
    gender: gender as 'male' | 'female' | 'any',
    acceptsNewPatients: acceptsNewPatients ? acceptsNewPatients === 'true' : undefined,
    consultationFee: consultationFee ? JSON.parse(consultationFee as string) : undefined,
    experience: experience ? JSON.parse(experience as string) : undefined,
    isVerified: isVerified ? isVerified === 'true' : undefined,
    pageSize: parseInt(pageSize as string) || 20,
    page: parseInt(page as string) || 1,
    sortBy: sortBy as 'relevance' | 'rating' | 'experience' | 'distance' | 'consultation_fee',
    sortOrder: sortOrder as 'asc' | 'desc'
  };

  const result = await ProviderDirectoryService.searchProviders(criteria);

  res.json({
    success: true,
    data: result
  });
}));

// Get provider by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const providerId = parseInt(id);

  const provider = await ProviderDirectoryService.getProviderById(providerId);

  if (!provider) {
    return res.status(404).json({
      success: false,
      error: 'Provider not found'
    });
  }

  res.json({
    success: true,
    data: provider
  });
}));

// Get specializations
router.get('/specializations', asyncHandler(async (req: Request, res: Response) => {
  const specializations = await ProviderDirectoryService.getSpecializations();

  res.json({
    success: true,
    data: specializations
  });
}));

// Get nearby providers
router.get('/nearby', asyncHandler(async (req: Request, res: Response) => {
  const { latitude, longitude, radius } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      error: 'Latitude and longitude are required'
    });
  }

  const providers = await ProviderDirectoryService.getNearbyProviders(
    parseFloat(latitude as string),
    parseFloat(longitude as string),
    parseFloat(radius as string) || 25
  );

  res.json({
    success: true,
    data: providers
  });
}));

// Get healthcare facilities
router.post('/facilities', asyncHandler(async (req: Request, res: Response) => {
  const { location, type, services, emergency } = req.body;

  if (!location || !location.latitude || !location.longitude) {
    return res.status(400).json({
      success: false,
      error: 'Location with coordinates is required'
    });
  }

  const facilities = await ProviderDirectoryService.searchHealthcareFacilities({
    location,
    type: type as string,
    services: services ? JSON.parse(services as string) : undefined,
    emergency: emergency
  });

  res.json({
    success: true,
    data: facilities
  });
}));

// Get provider statistics
router.get('/statistics', asyncHandler(async (req: Request, res: Response) => {
  const { specialization } = req.query;

  const statistics = await ProviderDirectoryService.getProviderStatistics(specialization as string);

  res.json({
    success: true,
    data: statistics
  });
}));

// Verify provider credentials
router.post('/:id/verify', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  const verificationData = req.body;

  const providerId = parseInt(id);
  await ProviderDirectoryService.verifyProvider(providerId, verificationData);

  res.json({
    success: true,
    message: 'Provider verification submitted'
  });
}));

// Update provider profile
router.patch('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  const updates = req.body;

  const providerId = parseInt(id);
  const updatedProvider = await ProviderDirectoryService.updateProviderProfile(providerId, userId, updates);

  res.json({
    success: true,
    data: updatedProvider
  });
}));

export default router;