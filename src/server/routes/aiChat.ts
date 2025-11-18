import { Router, Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import OpenAIService from '../services/openaiService.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Start AI chat session
router.post('/sessions', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const session = await OpenAIService.startChatSession(userId);

  res.status(201).json({
    success: true,
    data: {
      sessionId: session.id,
      createdAt: session.createdAt
    }
  });
}));

// Send message to AI
router.post('/sessions/:sessionId/message', asyncHandler(async (req: Request, res: Response) => {
  const { message } = req.body;
  const { sessionId } = req.params;
  const userId = (req as any).user.id;

  if (!message) {
    return res.status(400).json({
      success: false,
      error: 'Message is required'
    });
  }

  const response = await OpenAIService.sendMessage(sessionId, message, userId);

  res.json({
    success: true,
    data: response
  });
}));

// Analyze symptoms with AI
router.post('/symptoms/analyze', asyncHandler(async (req: Request, res: Response) => {
  const consultation = req.body;
  const userId = (req as any).user.id;

  const response = await OpenAIService.analyzeSymptoms(consultation, userId);

  res.json({
    success: true,
    data: response
  });
}));

// Get chat history
router.get('/history', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const limit = parseInt(req.query.limit as string) || 10;

  const sessions = await OpenAIService.getChatHistory(userId, limit);

  res.json({
    success: true,
    data: sessions
  });
}));

// End chat session
router.post('/sessions/:sessionId/end', asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const userId = (req as any).user.id;

  await OpenAIService.endChatSession(sessionId, userId);

  res.json({
    success: true,
    message: 'Chat session ended'
  });
}));

// Clear chat history
router.delete('/history', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  await OpenAIService.clearChatHistory(userId);

  res.json({
    success: true,
    message: 'Chat history cleared'
  });
}));

// Get health tips
router.get('/tips', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const category = req.query.category as string;

  const tips = await OpenAIService.generateHealthTips(userId, category);

  res.json({
    success: true,
    data: tips
  });
}));

// Get medication information
router.get('/medication/:medicationName', asyncHandler(async (req: Request, res: Response) => {
  const { medicationName } = req.params;

  const info = await OpenAIService.getMedicationInfo(medicationName);

  res.json({
    success: true,
    data: info
  });
}));

export default router;