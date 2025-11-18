import express from 'express';
import { validateRequest, validationSchemas } from '../middleware/validation.js';
import authService from '../services/authService.js';
import { authenticateToken, generateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName, dateOfBirth]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
router.post('/register', validateRequest(validationSchemas.register), async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, dateOfBirth, phone } = req.body;

    const result = await authService.register({
      email,
      password,
      firstName,
      lastName,
      dateOfBirth: new Date(dateOfBirth),
      phone
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      data: result
    });
  } catch (error: any) {
    if (error.message === 'User with this email already exists') {
      return res.status(409).json({
        success: false,
        error: error.message
      });
    }
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials or account locked
 */
router.post('/login', validateRequest(validationSchemas.login), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error: any) {
    let statusCode = 401;

    if (error.message.includes('Account is temporarily locked')) {
      statusCode = 423; // Locked
    } else if (error.message === 'Please verify your email before logging in') {
      statusCode = 403; // Forbidden
    }

    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Authenticate with Google OAuth
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idToken]
 *             properties:
 *               idToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentication successful
 *       400:
 *         description: Invalid Google token
 */
router.post('/google', validateRequest(validationSchemas.googleAuth), async (req, res, next) => {
  try {
    const { idToken } = req.body;

    const result = await authService.authenticateWithGoogle(idToken);

    const message = result.isNewUser
      ? 'Account created successfully with Google'
      : 'Authentication successful with Google';

    res.json({
      success: true,
      message,
      data: {
        user: result.user,
        tokens: result.tokens,
        isNewUser: result.isNewUser
      }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to authenticate with Google'
    });
  }
});

/**
 * @swagger
 * /api/auth/firebase:
 *   post:
 *     summary: Authenticate with Firebase
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firebaseToken]
 *             properties:
 *               firebaseToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentication successful
 *       400:
 *         description: Invalid Firebase token
 */
router.post('/firebase', validateRequest(validationSchemas.firebaseAuth), async (req, res, next) => {
  try {
    const { firebaseToken } = req.body;

    const result = await authService.authenticateWithFirebase(firebaseToken);

    const message = result.isNewUser
      ? 'Account created successfully with Firebase'
      : 'Authentication successful with Firebase';

    res.json({
      success: true,
      message,
      data: {
        user: result.user,
        tokens: result.tokens,
        isNewUser: result.isNewUser
      }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to authenticate with Firebase'
    });
  }
});

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify email address
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post('/verify-email', validateRequest(validationSchemas.verifyEmail), async (req, res, next) => {
  try {
    const { token } = req.body;

    await authService.verifyEmail(token);

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to verify email'
    });
  }
});

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset email sent
 *       404:
 *         description: Email not found
 */
router.post('/forgot-password', validateRequest(validationSchemas.forgotPassword), async (req, res, next) => {
  try {
    const { email } = req.body;

    const message = await authService.requestPasswordReset(email);

    res.json({
      success: true,
      message
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid token or validation error
 */
router.post('/reset-password', validateRequest(validationSchemas.resetPassword), async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    await authService.resetPassword(token, newPassword);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to reset password'
    });
  }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *       400:
 *         description: Invalid refresh token
 */
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    const tokens = await authService.refreshTokens(refreshToken);

    res.json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: { tokens }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to refresh tokens'
    });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticateToken, async (req: any, res, next) => {
  try {
    // The user is already attached to req by the authenticateToken middleware
    res.json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          fullName: req.user.fullName,
          dateOfBirth: req.user.dateOfBirth,
          phone: req.user.phone,
          profilePicture: req.user.profilePicture,
          emailVerified: req.user.emailVerified,
          role: req.user.role,
          preferences: req.user.preferences,
          createdAt: req.user.createdAt
        }
      }
    });
  } catch (error: any) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', authenticateToken, async (req, res) => {
  // In a real implementation, you might want to:
  // 1. Add the token to a blacklist
  // 2. Remove the token from device tokens
  // 3. Clear any session data

  res.json({
    success: true,
    message: 'Logout successful'
  });
});

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid current password
 */
router.post('/change-password', authenticateToken, async (req: any, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters long'
      });
    }

    // Get user with password
    const User = (await import('../models/User.js')).default;
    const user = await (User as any).findById(req.user._id).select('+password');

    if (!user || !user.password) {
      return res.status(400).json({
        success: false,
        error: 'User not found or no password set'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await authService.comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await authService.hashPassword(newPassword);
    user.password = hashedNewPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;