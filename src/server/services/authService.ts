import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import admin from 'firebase-admin';
import User from '../models/User.js';

// Interfaces
export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export interface FirebaseUserInfo {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
}

export interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  private googleClient: OAuth2Client;

  constructor() {
    // Initialize Google OAuth client
    this.googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    // Initialize Firebase Admin if credentials are provided
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          })
        });
        console.log('✅ Firebase Admin initialized');
      } catch (error) {
        console.warn('⚠️ Firebase Admin initialization failed:', error);
      }
    }
  }

  // Password hashing and comparison
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // JWT token management
  generateTokens(userId: string, email: string): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): { userId: string; email: string } {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return { userId: decoded.userId, email: decoded.email };
  }

  verifyRefreshToken(token: string): { userId: string } {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any;
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid refresh token');
    }
    return { userId: decoded.userId };
  }

  // User registration
  async register(userData: RegistrationData): Promise<{ user: any; tokens: any }> {
    const { email, password, firstName, lastName, dateOfBirth, phone } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Generate email verification token
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      dateOfBirth,
      phone,
      emailVerified: false
    });

    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // TODO: Send verification email
    // await this.sendVerificationEmail(email, verificationToken);

    // Generate tokens
    const tokens = this.generateTokens(user._id.toString(), user.email);

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified
      },
      tokens
    };
  }

  // User login
  async login(loginData: LoginData): Promise<{ user: any; tokens: any }> {
    const { email, password } = loginData;

    // Find user with password
    const user = await (User as any).findByEmailWithPassword(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if account is locked
    if (user.isLocked()) {
      throw new Error('Account is temporarily locked due to too many failed attempts');
    }

    // Verify password
    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      await user.incrementLoginAttempts();
      throw new Error('Invalid credentials');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new Error('Please verify your email before logging in');
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const tokens = this.generateTokens(user._id.toString(), user.email);

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
        role: user.role
      },
      tokens
    };
  }

  // Google OAuth authentication
  async authenticateWithGoogle(idToken: string): Promise<{ user: any; tokens: any; isNewUser: boolean }> {
    try {
      // Verify Google ID token
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload() as any;
      if (!payload) {
        throw new Error('Invalid Google token');
      }

      const { sub: googleId, email, name, picture, given_name, family_name } = payload;

      // Find or create user
      let user = await User.findOne({ $or: [{ email }, { googleId }] });

      const isNewUser = !user;

      if (!user) {
        // Create new user from Google data
        const names = name ? name.split(' ') : ['User', ''];
        user = new User({
          email,
          firstName: given_name || names[0],
          lastName: family_name || names[1] || '',
          profilePicture: picture,
          googleId,
          emailVerified: email.includes('@gmail.com'), // Assume Gmail accounts are verified
          dateOfBirth: new Date(1990, 0, 1) // Default date, user should update
        });
      } else if (!user.googleId) {
        // Link Google account to existing user
        user.googleId = googleId;
        user.profilePicture = user.profilePicture || picture;
      }

      await user.save();

      // Generate tokens
      const tokens = this.generateTokens(user._id.toString(), user.email);

      return {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
          emailVerified: user.emailVerified,
          role: user.role
        },
        tokens,
        isNewUser
      };
    } catch (error) {
      console.error('Google authentication error:', error);
      throw new Error('Failed to authenticate with Google');
    }
  }

  // Firebase authentication
  async authenticateWithFirebase(firebaseToken: string): Promise<{ user: any; tokens: any; isNewUser: boolean }> {
    try {
      if (!admin.apps.length) {
        throw new Error('Firebase Admin not initialized');
      }

      // Verify Firebase token
      const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
      const { uid, email, name, picture, email_verified } = decodedToken;

      if (!email) {
        throw new Error('Email is required from Firebase authentication');
      }

      // Find or create user
      let user = await User.findOne({ $or: [{ email }, { firebaseUid: uid }] });

      const isNewUser = !user;

      if (!user) {
        // Create new user from Firebase data
        const names = name ? name.split(' ') : ['User', ''];
        user = new User({
          email,
          firstName: names[0],
          lastName: names[1] || '',
          profilePicture: picture,
          firebaseUid: uid,
          emailVerified: email_verified || false,
          dateOfBirth: new Date(1990, 0, 1) // Default date, user should update
        });
      } else if (!user.firebaseUid) {
        // Link Firebase account to existing user
        user.firebaseUid = uid;
        user.emailVerified = user.emailVerified || email_verified;
        user.profilePicture = user.profilePicture || picture;
      }

      await user.save();

      // Generate tokens
      const tokens = this.generateTokens(user._id.toString(), user.email);

      return {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
          emailVerified: user.emailVerified,
          role: user.role
        },
        tokens,
        isNewUser
      };
    } catch (error) {
      console.error('Firebase authentication error:', error);
      throw new Error('Failed to authenticate with Firebase');
    }
  }

  // Email verification
  async verifyEmail(token: string): Promise<void> {
    const user = await (User as any).findByVerificationToken(token);
    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
  }

  // Password reset
  async requestPasswordReset(email: string): Promise<string> {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether user exists
      return 'If an account with this email exists, a reset link has been sent';
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // TODO: Send password reset email
    // await this.sendPasswordResetEmail(email, resetToken);

    return 'If an account with this email exists, a reset link has been sent';
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await (User as any).findByPasswordResetToken(token);
    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    const hashedPassword = await this.hashPassword(newPassword);
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
  }

  // Token refresh
  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const { userId } = this.verifyRefreshToken(refreshToken);

    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    return this.generateTokens(user._id.toString(), user.email);
  }

  // TODO: Email sending methods (to be implemented)
  private async sendVerificationEmail(email: string, token: string): Promise<void> {
    // Implement email sending logic
    console.log(`TODO: Send verification email to ${email} with token ${token}`);
  }

  private async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    // Implement email sending logic
    console.log(`TODO: Send password reset email to ${email} with token ${token}`);
  }
}

export default new AuthService();