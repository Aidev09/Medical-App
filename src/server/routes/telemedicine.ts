import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import TelemedicineService from '../services/telemedicineService.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Create telemedicine session
router.post('/sessions', asyncHandler(async (req: Request, res: Response) => {
  const { appointmentId, settings } = req.body;

  if (!appointmentId || !settings) {
    return res.status(400).json({
      success: false,
      error: 'Appointment ID and settings are required'
    });
  }

  const session = await TelemedicineService.createTelemedicineSession(
    parseInt(appointmentId),
    settings
  );

  res.status(201).json({
    success: true,
    data: session
  });
}));

// Start telemedicine session
router.post('/sessions/:sessionId/start', asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const userId = (req as any).user.id;
  const { role } = req.body;

  if (!role || !['doctor', 'patient'].includes(role)) {
    return res.status(400).json({
      success: false,
      error: 'Valid role (doctor or patient) is required'
    });
  }

  await TelemedicineService.startSession(sessionId, userId, role as 'doctor' | 'patient');

  res.json({
    success: true,
    message: 'Session started successfully'
  });
}));

// End telemedicine session
router.post('/sessions/:sessionId/end', asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const userId = (req as any).user.id;

  await TelemedicineService.endSession(sessionId, userId);

  res.json({
    success: true,
    message: 'Session ended successfully'
  });
}));

// Get session details
router.get('/sessions/:sessionId', asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const userId = (req as any).user.id;

  const session = await TelemedicineService.getSessionDetails(sessionId, userId);

  res.json({
    success: true,
    data: session
  });
}));

// Join waiting room
router.post('/sessions/:sessionId/waiting-room', asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const userId = (req as any).user.id;

  const waitingRoom = await TelemedicineService.joinWaitingRoom(sessionId, userId);

  res.json({
    success: true,
    data: waitingRoom
  });
}));

// Record diagnostic data
router.post('/sessions/:sessionId/diagnostic', asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const userId = (req as any).user.id;
  const diagnosticData = req.body;

  const userRole = (req as any).user.role;

  if (userRole !== 'doctor') {
    return res.status(403).json({
      success: false,
      error: 'Only doctors can record diagnostic data'
    });
  }

  await TelemedicineService.recordDiagnosticData(sessionId, userId, diagnosticData);

  res.json({
    success: true,
    message: 'Diagnostic data recorded successfully'
  });
}));

// Request technical support
router.post('/sessions/:sessionId/support', asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const userId = (req as any).user.id;
  const { issue } = req.body;

  if (!issue) {
    return res.status(400).json({
      success: false,
      error: 'Issue description is required'
    });
  }

  await TelemedicineService.getTechnicalSupport(sessionId, issue, userId);

  res.json({
    success: true,
    message: 'Technical support request submitted'
  });
}));

// Get active sessions
router.get('/sessions/active', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const userRole = (req as any).user.role;

  // Only doctors and admin can view all active sessions
  const doctorId = userRole === 'doctor' ? userId : undefined;

  const activeSessions = await TelemedicineService.getActiveSessions(doctorId);

  res.json({
    success: true,
    data: activeSessions
  });
}));

// Get session statistics
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

  const statistics = await TelemedicineService.getSessionStatistics(
    userRole === 'doctor' ? userId : undefined,
    dateRange
  );

  res.json({
    success: true,
    data: statistics
  });
}));

// Get session quality metrics
router.get('/sessions/:sessionId/metrics', asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const userId = (req as any).user.id;

  const session = await TelemedicineService.getSessionDetails(sessionId, userId);

  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Session not found'
    });
  }

  res.json({
    success: true,
    data: {
      sessionId: session.id,
      qualityMetrics: session.qualityMetrics,
      participants: session.participants,
      duration: session.endTime.getTime() - session.startTime.getTime()
    }
  });
}));

// Test telemedicine setup
router.post('/test-setup', asyncHandler(async (req: Request, res: Response) => {
  const { platform, testType = 'camera' } = req.body;

  // This would test the user's telemedicine setup
  const testResults = {
    platform,
    testType,
    status: 'passed',
    recommendations: []
  };

  res.json({
    success: true,
    data: testResults
  });
}));

// Get telemedicine requirements
router.get('/requirements/:platform', asyncHandler(async (req: Request, res: Response) => {
  const { platform } = req.params;

  const requirements = {
    zoom: {
      platform: 'Zoom',
      technicalRequirements: [
        'Zoom app or web browser',
        'Stable internet connection (minimum 1 Mbps)',
        'Camera and microphone',
        'Chrome, Firefox, Safari, or Edge browser',
        'Updated browser version'
      ],
      instructions: [
        'Click the meeting link 5 minutes before your appointment time',
        'Test your audio and video when prompted',
        'Wait in the waiting room until the doctor admits you',
        'Ensure you\'re in a quiet, private space',
        'Have good lighting and position your camera at eye level'
      ],
      testLink: 'https://zoom.us/test'
    },
    teams: {
      platform: 'Microsoft Teams',
      technicalRequirements: [
        'Microsoft Teams app or web browser',
        'Microsoft account',
        'Stable internet connection (minimum 1 Mbps)',
        'Camera and microphone',
        'Chrome, Firefox, Safari, or Edge browser'
      ],
      instructions: [
        'Join the Teams meeting using the provided link',
        'Sign in with your Microsoft account if prompted',
        'Test your microphone and camera',
        'Wait in the lobby until admitted by the doctor',
        'Find a quiet, well-lit space for the consultation'
      ],
      testLink: 'https://www.microsoft.com/en-us/microsoft-365/microsoft-teams/group-chat-software'
    },
    google_meet: {
      platform: 'Google Meet',
      technicalRequirements: [
        'Google account',
        'Stable internet connection (minimum 1 Mbps)',
        'Camera and microphone',
        'Chrome, Firefox, Safari, or Edge browser',
        'Updated browser version'
      ],
      instructions: [
        'Click the Google Meet link before your appointment time',
        'Sign in to your Google account',
        'Allow camera and microphone access',
        'Wait for the doctor to join the meeting',
        'Position yourself in a quiet, private environment'
      ],
      testLink: 'https://meet.google.com/new'
    }
  };

  const platformData = requirements[platform as keyof typeof requirements];

  if (!platformData) {
    return res.status(400).json({
      success: false,
      error: 'Unsupported platform'
    });
  }

  res.json({
    success: true,
    data: platformData
  });
}));

// Check device compatibility
router.post('/device-compatibility', asyncHandler(async (req: Request, res: Response) => {
  const { userAgent, platform } = req.body;

  // Check device compatibility for telemedicine
  const compatibility = {
    isCompatible: true,
    platform,
    userAgent,
    browser: this.parseBrowser(userAgent),
    operatingSystem: this.parseOperatingSystem(userAgent),
    recommendations: []
  };

  // Add specific recommendations based on platform
  if (platform === 'zoom' && !compatibility.browser.name.includes('Chrome') &&
      !compatibility.browser.name.includes('Firefox')) {
    compatibility.recommendations.push('For best experience, use Chrome or Firefox browser');
  }

  res.json({
    success: true,
    data: compatibility
  });
}));

// Parse browser from user agent
function parseBrowser(userAgent: string): { name: string; version: string } {
  const browsers = [
    { name: 'Chrome', pattern: /Chrome\/([0-9.]+)/ },
    { name: 'Firefox', pattern: /Firefox\/([0-9.]+)/ },
    { name: 'Safari', pattern: /Version\/([0-9.]+).*Safari/ },
    { name: 'Edge', pattern: /Edge\/([0-9.]+)/ }
  ];

  for (const browser of browsers) {
    const match = userAgent.match(browser.pattern);
    if (match) {
      return {
        name: browser.name,
        version: match[1]
      };
    }
  }

  return { name: 'Unknown', version: 'Unknown' };
}

// Parse operating system from user agent
function parseOperatingSystem(userAgent: string): { name: string; version: string } {
  const operatingSystems = [
    { name: 'Windows', pattern: /Windows NT ([0-9.]+)/ },
    { name: 'macOS', pattern: /Mac OS X ([0-9._]+)/ },
    { name: 'iOS', pattern: /iPhone OS ([0-9._]+)/ },
    { name: 'Android', pattern: /Android ([0-9.]+)/ },
    { name: 'Linux', pattern: /Linux/ }
  ];

  for (const os of operatingSystems) {
    const match = userAgent.match(os.pattern);
    if (match) {
      return {
        name: os.name,
        version: match[1] ? match[1].replace(/_/g, '.') : 'Unknown'
      };
    }
  }

  return { name: 'Unknown', version: 'Unknown' };
}

export default router;