import nodemailer from 'nodemailer';
import admin from 'firebase-admin';
import axios from 'axios';

export interface NotificationOptions {
  to: string | string[];
  subject: string;
  message: string;
  type: 'email' | 'push' | 'sms';
  priority?: 'low' | 'normal' | 'high';
  metadata?: Record<string, any>;
}

export interface PushNotificationPayload {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  priority?: 'normal' | 'high';
}

export interface SMSPayload {
  to: string;
  message: string;
  from?: string;
}

class NotificationService {
  private emailTransporter: nodemailer.Transporter;
  private isFirebaseInitialized: boolean;

  constructor() {
    this.isFirebaseInitialized = false;
    this.initializeEmailService();
    this.initializeFirebase();
  }

  private initializeEmailService(): void {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('Email service not configured');
      return;
    }

    this.emailTransporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private initializeFirebase(): void {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          })
        });
        this.isFirebaseInitialized = true;
        console.log('✅ Firebase Admin initialized for notifications');
      } catch (error) {
        console.warn('❌ Firebase Admin initialization failed:', error);
      }
    }
  }

  // Send email notification
  async sendEmail(options: NotificationOptions): Promise<boolean> {
    if (!this.emailTransporter) {
      console.warn('Email service not available');
      return false;
    }

    try {
      const mailOptions = {
        from: `"Medical App" <${process.env.SMTP_USER}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: this.generateEmailTemplate(options.message, options.type),
        priority: options.priority === 'high' ? 'high' : 'normal'
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      console.log('✅ Email sent:', result.messageId);
      return true;
    } catch (error: any) {
      console.error('❌ Email send failed:', error.message);
      return false;
    }
  }

  // Send push notification via Firebase Cloud Messaging
  async sendPushNotification(payload: PushNotificationPayload): Promise<boolean> {
    if (!this.isFirebaseInitialized) {
      console.warn('Firebase not initialized for push notifications');
      return false;
    }

    try {
      const message = {
        token: payload.token,
        notification: {
          title: payload.title,
          body: payload.body,
          priority: payload.priority || 'normal'
        },
        data: payload.data || {},
        android: {
          priority: payload.priority || 'normal',
          notification: {
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await admin.messaging().send(message);
      console.log('✅ Push notification sent:', response);
      return true;
    } catch (error: any) {
      console.error('❌ Push notification failed:', error.message);
      return false;
    }
  }

  // Send SMS notification via Twilio
  async sendSMS(payload: SMSPayload): Promise<boolean> {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.warn('Twilio not configured for SMS');
      return false;
    }

    try {
      const auth = Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
      ).toString('base64');

      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        new URLSearchParams({
          To: payload.to,
          From: payload.from || process.env.TWILIO_PHONE_NUMBER || '',
          Body: payload.message
        }),
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      console.log('✅ SMS sent:', response.data.sid);
      return true;
    } catch (error: any) {
      console.error('❌ SMS send failed:', error.message);
      return false;
    }
  }

  // Send medication reminder notification
  async sendMedicationReminder(
    userEmail: string,
    userPhone: string | null,
    pushToken: string | null,
    medicationName: string,
    time: string
  ): Promise<void> {
    const subject = `Medication Reminder: ${medicationName}`;
    const message = `It's time to take your ${medicationName} at ${time}`;

    // Send email notification
    if (userEmail) {
      await this.sendEmail({
        to: userEmail,
        subject,
        message,
        type: 'email',
        priority: 'high'
      });
    }

    // Send push notification
    if (pushToken) {
      await this.sendPushNotification({
        token: pushToken,
        title: 'Medication Reminder',
        body: message,
        priority: 'high',
        data: {
          type: 'medication_reminder',
          medication: medicationName,
          time: time
        }
      });
    }

    // Send SMS notification (optional)
    if (userPhone && process.env.TWILIO_ACCOUNT_SID) {
      await this.sendSMS({
        to: userPhone,
        message: `Medical App: ${message}`
      });
    }
  }

  // Send health alert notification
  async sendHealthAlert(
    userEmail: string,
    userPhone: string | null,
    pushToken: string | null,
    alertType: string,
    message: string
  ): Promise<void> {
    const subject = `Health Alert: ${alertType}`;

    // Send email notification
    if (userEmail) {
      await this.sendEmail({
        to: userEmail,
        subject,
        message,
        type: 'email',
        priority: 'high'
      });
    }

    // Send push notification
    if (pushToken) {
      await this.sendPushNotification({
        token: pushToken,
        title: 'Health Alert',
        body: message,
        priority: 'high',
        data: {
          type: 'health_alert',
          alertType,
          message
        }
      });
    }
  }

  // Send email verification
  async sendEmailVerification(email: string, token: string): Promise<boolean> {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    return await this.sendEmail({
      to: email,
      subject: 'Verify Your Email Address',
      message: `
        <h2>Welcome to Medical App!</h2>
        <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
        <p><a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <p>This link will expire in 24 hours.</p>
      `,
      type: 'email'
    });
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    return await this.sendEmail({
      to: email,
      subject: 'Reset Your Password',
      message: `
        <h2>Reset Your Password</h2>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <p><a href="${resetLink}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>If you didn't request this password reset, you can safely ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `,
      type: 'email'
    });
  }

  private generateEmailTemplate(message: string, type: string): string {
    const templates: Record<string, string> = {
      email: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Medical App</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Medical App</h1>
            </div>
            <div class="content">
              ${message}
            </div>
            <div class="footer">
              <p>&copy; 2024 Medical App. All rights reserved.</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      push: message,
      sms: message
    };

    return templates[type] || templates.email;
  }
}

export default new NotificationService();