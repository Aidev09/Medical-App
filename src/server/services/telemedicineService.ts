import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Op, Sequelize } from 'sequelize';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';

export interface TelemedicineSession {
  id: string;
  appointmentId: number;
  doctorId: number;
  patientId: number;
  platform: 'zoom' | 'teams' | 'google_meet' | 'custom' | 'phone';
  meetingLink?: string;
  meetingId?: string;
  meetingPassword?: string;
  dialInNumber?: string;
  accessCode?: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
  recordingEnabled: boolean;
  recordingUrl?: string;
  chatEnabled: boolean;
  screenSharingEnabled: boolean;
  technicalRequirements: string[];
  instructions: string;
  testLink?: string;
  participants: Array<{
    id: number;
    name: string;
    role: 'doctor' | 'patient';
    joinedAt?: Date;
    leftAt?: Date;
    device?: string;
    networkQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  }>;
  qualityMetrics?: {
    averageLatency?: number;
    packetLoss?: number;
    connectionStability?: number;
    videoQuality?: 'high' | 'medium' | 'low';
    audioQuality?: 'high' | 'medium' | 'low';
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoCallSettings {
  platform: 'zoom' | 'teams' | 'google_meet' | 'custom';
  duration: number;
  allowRecording: boolean;
  requirePassword: boolean;
  waitingRoom: boolean;
  chatEnabled: boolean;
  screenShareEnabled: boolean;
  virtualBackground: boolean;
  breakoutRooms: boolean;
  annotations: boolean;
  polling: boolean;
  whiteboard: boolean;
  fileSharing: boolean;
}

export interface ConsultationRoom {
  id: string;
  name: string;
  type: 'waiting_room' | 'consultation_room' | 'breakout_room';
  capacity: number;
  isActive: boolean;
  settings: any;
  createdAt: Date;
}

export interface TelemedicineDiagnostic {
  sessionId: string;
  vitals: {
    heartRate?: number;
    bloodPressure?: {
      systolic: number;
      diastolic: number;
    };
    temperature?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
  };
  symptoms: string[];
  observations: string[];
  assessment: string;
  recommendations: string[];
  prescriptions?: Array<{
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  followUpRequired: boolean;
  followUpInstructions?: string;
  emergencyLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

class TelemedicineService {
  private zoomApiKey: string;
  private zoomApiSecret: string;
  private teamsApiKey: string;
  private googleMeetApiKey: string;
  private activeSessions: Map<string, TelemedicineSession> = new Map();

  constructor() {
    this.zoomApiKey = process.env.ZOOM_API_KEY || '';
    this.zoomApiSecret = process.env.ZOOM_API_SECRET || '';
    this.teamsApiKey = process.env.TEAMS_API_KEY || '';
    this.googleMeetApiKey = process.env.GOOGLE_MEET_API_KEY || '';
  }

  async createTelemedicineSession(
    appointmentId: number,
    settings: VideoCallSettings
  ): Promise<TelemedicineSession> {
    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        { model: Doctor, as: 'doctor' },
        { model: User, as: 'patient' }
      ]
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (!['video', 'phone'].includes(appointment.appointmentType)) {
      throw new Error('Appointment type does not support telemedicine');
    }

    let meetingDetails;

    switch (settings.platform) {
      case 'zoom':
        meetingDetails = await this.createZoomMeeting(appointment, settings);
        break;
      case 'teams':
        meetingDetails = await this.createTeamsMeeting(appointment, settings);
        break;
      case 'google_meet':
        meetingDetails = await this.createGoogleMeetMeeting(appointment, settings);
        break;
      case 'custom':
        meetingDetails = await this.createCustomMeeting(appointment, settings);
        break;
      default:
        throw new Error('Unsupported telemedicine platform');
    }

    const session: TelemedicineSession = {
      id: uuidv4(),
      appointmentId,
      doctorId: appointment.doctorId,
      patientId: appointment.patientId,
      platform: settings.platform,
      meetingLink: meetingDetails.meetingLink,
      meetingId: meetingDetails.meetingId,
      meetingPassword: meetingDetails.password,
      dialInNumber: meetingDetails.dialInNumber,
      accessCode: meetingDetails.accessCode,
      startTime: appointment.scheduledDateTime,
      endTime: new Date(appointment.scheduledDateTime.getTime() + settings.duration * 60000),
      status: 'scheduled',
      recordingEnabled: settings.allowRecording,
      chatEnabled: settings.chatEnabled,
      screenSharingEnabled: settings.screenShareEnabled,
      technicalRequirements: this.getTechnicalRequirements(settings.platform),
      instructions: this.getConsultationInstructions(settings.platform),
      testLink: this.getTestLink(settings.platform),
      participants: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store session
    this.activeSessions.set(session.id, session);

    // Update appointment with telehealth details
    await appointment.update({
      telehealth: {
        platform: settings.platform,
        meetingLink: session.meetingLink,
        meetingId: session.meetingId,
        meetingPassword: session.meetingPassword,
        dialInNumber: session.dialInNumber,
        accessCode: session.accessCode,
        instructions: session.instructions,
        testLink: session.testLink,
        technicalRequirements: session.technicalRequirements
      }
    });

    // Send session details to participants
    await this.sendTelemedicineInvitations(session, appointment);

    return session;
  }

  async createZoomMeeting(appointment: any, settings: VideoCallSettings): Promise<any> {
    try {
      const jwt = await this.generateZoomJWT();
      const meetingData = {
        topic: `Consultation with Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
        type: 2, // Scheduled meeting
        start_time: appointment.scheduledDateTime.toISOString(),
        duration: settings.duration,
        password: settings.requirePassword ? this.generatePassword() : undefined,
        settings: {
          host_video: true,
          participant_video: true,
          cn_meeting: false,
          in_meeting: false,
          join_before_host: false,
          mute_upon_entry: true,
          watermark: false,
          use_pmi: false,
          approval_type: 0,
          audio: 'both',
          auto_recording: settings.allowRecording ? 'cloud' : 'none',
          enforce_login: false,
          waiting_room: settings.waitingRoom,
          break_out_room: {
            enable: settings.breakoutRooms
          }
        }
      };

      const response = await axios.post(
        'https://api.zoom.us/v2/users/me/meetings',
        meetingData,
        {
          headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        meetingLink: response.data.join_url,
        meetingId: response.data.id.toString(),
        password: response.data.password,
        dialInNumber: response.data.dial_in?.[0]?.number
      };
    } catch (error: any) {
      console.error('Error creating Zoom meeting:', error.response?.data);
      throw new Error('Failed to create Zoom meeting');
    }
  }

  async createTeamsMeeting(appointment: any, settings: VideoCallSettings): Promise<any> {
    // Microsoft Teams integration
    try {
      const meetingData = {
        subject: `Consultation with Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
        start: {
          dateTime: appointment.scheduledDateTime.toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: new Date(appointment.scheduledDateTime.getTime() + settings.duration * 60000).toISOString(),
          timeZone: 'UTC'
        },
        isOnlineMeeting: true,
        onlineMeetingProvider: 'teamsForBusiness'
      };

      // This would require Microsoft Graph API integration
      // For now, return a mock response
      const meetingId = uuidv4();
      return {
        meetingLink: `https://teams.microsoft.com/l/meetup-join/${meetingId}`,
        meetingId,
        dialInNumber: '+1 (555) 123-4567'
      };
    } catch (error) {
      console.error('Error creating Teams meeting:', error);
      throw new Error('Failed to create Teams meeting');
    }
  }

  async createGoogleMeetMeeting(appointment: any, settings: VideoCallSettings): Promise<any> {
    try {
      const meetingData = {
        summary: `Consultation with Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
        start: {
          dateTime: appointment.scheduledDateTime.toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: new Date(appointment.scheduledDateTime.getTime() + settings.duration * 60000).toISOString(),
          timeZone: 'UTC'
        },
        conferenceData: {
          createRequest: {
            requestId: uuidv4(),
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        }
      };

      // This would require Google Calendar API integration
      // For now, return a mock response
      const meetingId = uuidv4();
      return {
        meetingLink: `https://meet.google.com/${meetingId}`,
        meetingId
      };
    } catch (error) {
      console.error('Error creating Google Meet meeting:', error);
      throw new Error('Failed to create Google Meet meeting');
    }
  }

  async createCustomMeeting(appointment: any, settings: VideoCallSettings): Promise<any> {
    // Custom WebRTC-based meeting
    const sessionId = uuidv4();
    return {
      meetingLink: `${process.env.FRONTEND_URL}/consultation/${sessionId}`,
      meetingId: sessionId,
      password: settings.requirePassword ? this.generatePassword() : undefined
    };
  }

  async startSession(sessionId: string, userId: number, role: 'doctor' | 'patient'): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Validate user is part of the session
    if (userId !== session.doctorId && userId !== session.patientId) {
      throw new Error('Unauthorized access to session');
    }

    // Check if it's time to start the session
    const now = new Date();
    const startTime = new Date(session.startTime);
    const fiveMinutesBefore = new Date(startTime.getTime() - 5 * 60000);

    if (now < fiveMinutesBefore) {
      throw new Error('Session is not ready to start yet');
    }

    // Add participant to session
    const user = await User.findByPk(userId);
    if (user) {
      const participant = {
        id: userId,
        name: `${user.firstName} ${user.lastName}`,
        role,
        joinedAt: new Date()
      };

      const existingParticipantIndex = session.participants.findIndex(p => p.id === userId);
      if (existingParticipantIndex >= 0) {
        session.participants[existingParticipantIndex] = participant;
      } else {
        session.participants.push(participant);
      }

      session.status = 'active';
      session.updatedAt = new Date();

      this.activeSessions.set(sessionId, session);

      // Notify other participants
      await this.notifySessionParticipants(sessionId, 'participant_joined', participant);
    }
  }

  async endSession(sessionId: string, userId: number): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Only doctor can end the session
    if (userId !== session.doctorId) {
      throw new Error('Only doctor can end the session');
    }

    session.status = 'ended';
    session.endTime = new Date();
    session.updatedAt = new Date();

    // Update participant leave time
    session.participants.forEach(participant => {
      if (!participant.leftAt) {
        participant.leftAt = new Date();
      }
    });

    // Stop recording if enabled
    if (session.recordingEnabled && session.platform === 'zoom') {
      await this.stopZoomRecording(session.meetingId!);
    }

    // Generate session report
    await this.generateSessionReport(session);

    this.activeSessions.set(sessionId, session);
  }

  async getSessionDetails(sessionId: string, userId: number): Promise<TelemedicineSession> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Check if user has access to this session
    if (userId !== session.doctorId && userId !== session.patientId) {
      throw new Error('Unauthorized access to session');
    }

    return session;
  }

  async joinWaitingRoom(sessionId: string, userId: number): Promise<ConsultationRoom> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Create or get waiting room
    const waitingRoom: ConsultationRoom = {
      id: `${sessionId}_waiting`,
      name: 'Waiting Room',
      type: 'waiting_room',
      capacity: 10,
      isActive: true,
      settings: {
        allowChat: true,
        allowVideo: true,
        allowAudio: true
      },
      createdAt: new Date()
    };

    return waitingRoom;
  }

  async recordDiagnosticData(
    sessionId: string,
    userId: number,
    data: TelemedicineDiagnostic
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Only doctor can record diagnostic data
    if (userId !== session.doctorId) {
      throw new Error('Only doctor can record diagnostic data');
    }

    // Store diagnostic data (would typically save to database)
    console.log(`Recording diagnostic data for session ${sessionId}:`, data);

    // If emergency level is critical, trigger alerts
    if (data.emergencyLevel === 'critical') {
      await this.triggerEmergencyAlert(session, data);
    }
  }

  async getTechnicalSupport(sessionId: string, issue: string, userId: number): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Create support ticket
    const supportTicket = {
      sessionId,
      userId,
      issue,
      timestamp: new Date(),
      status: 'open'
    };

    console.log('Technical support ticket created:', supportTicket);

    // Send notification to support team
    await this.notifySupportTeam(supportTicket);
  }

  private getTechnicalRequirements(platform: string): string[] {
    const requirements = {
      zoom: [
        'Zoom app or web browser',
        'Stable internet connection (minimum 1 Mbps)',
        'Camera and microphone',
        'Chrome, Firefox, Safari, or Edge browser',
        'Updated browser version'
      ],
      teams: [
        'Microsoft Teams app or web browser',
        'Microsoft account',
        'Stable internet connection (minimum 1 Mbps)',
        'Camera and microphone',
        'Chrome, Firefox, Safari, or Edge browser'
      ],
      google_meet: [
        'Google account',
        'Stable internet connection (minimum 1 Mbps)',
        'Camera and microphone',
        'Chrome, Firefox, Safari, or Edge browser',
        'Updated browser version'
      ],
      custom: [
        'Web browser with WebRTC support',
        'Stable internet connection (minimum 1 Mbps)',
        'Camera and microphone',
        'Chrome, Firefox, Safari, or Edge browser'
      ]
    };

    return requirements[platform as keyof typeof requirements] || requirements.custom;
  }

  private getConsultationInstructions(platform: string): string {
    const instructions = {
      zoom: `
        1. Click the meeting link 5 minutes before your appointment time
        2. Test your audio and video when prompted
        3. Wait in the waiting room until the doctor admits you
        4. Ensure you're in a quiet, private space
        5. Have good lighting and position your camera at eye level
      `,
      teams: `
        1. Join the Teams meeting using the provided link
        2. Sign in with your Microsoft account if prompted
        3. Test your microphone and camera
        4. Wait in the lobby until admitted by the doctor
        5. Find a quiet, well-lit space for the consultation
      `,
      google_meet: `
        1. Click the Google Meet link before your appointment time
        2. Sign in to your Google account
        3. Allow camera and microphone access
        4. Wait for the doctor to join the meeting
        5. Position yourself in a quiet, private environment
      `,
      custom: `
        1. Click the consultation link to enter the virtual room
        2. Allow browser permissions for camera and microphone
        3. Run the automated technical check
        4. Wait for the doctor to start the consultation
        5. Ensure you have a stable internet connection
      `
    };

    return instructions[platform as keyof typeof instructions] || instructions.custom;
  }

  private getTestLink(platform: string): string {
    const testLinks = {
      zoom: 'https://zoom.us/test',
      teams: 'https://www.microsoft.com/en-us/microsoft-365/microsoft-teams/group-chat-software',
      google_meet: 'https://meet.google.com/new',
      custom: `${process.env.FRONTEND_URL}/technical-test`
    };

    return testLinks[platform as keyof typeof testLinks] || testLinks.custom;
  }

  private async sendTelemedicineInvitations(session: TelemedicineSession, appointment: any): Promise<void> {
    // Send email invitations with meeting details
    const doctorEmail = appointment.doctor.email;
    const patientEmail = appointment.patient.email;

    const invitationData = {
      session,
      appointment,
      instructions: session.instructions,
      technicalRequirements: session.technicalRequirements,
      testLink: session.testLink
    };

    // Send invitations (implementation depends on your email service)
    console.log(`Sending telemedicine invitation to doctor: ${doctorEmail}`);
    console.log(`Sending telemedicine invitation to patient: ${patientEmail}`);
  }

  private async notifySessionParticipants(sessionId: string, event: string, data: any): Promise<void> {
    // Send real-time notifications to participants via WebSocket
    console.log(`Notifying session participants of ${event}:`, data);
  }

  private async notifySupportTeam(ticket: any): Promise<void> {
    // Send notification to support team
    console.log('Notifying support team of technical issue:', ticket);
  }

  private async triggerEmergencyAlert(session: TelemedicineSession, data: TelemedicineDiagnostic): Promise<void> {
    // Trigger emergency alert system
    console.error('EMERGENCY ALERT - Critical diagnostic data:', {
      sessionId: session.id,
      patientId: session.patientId,
      doctorId: session.doctorId,
      data
    });

    // Send emergency notifications
    // This could include calling emergency services, notifying hospital, etc.
  }

  private async generateSessionReport(session: TelemedicineSession): Promise<void> {
    // Generate detailed session report
    const report = {
      sessionId: session.id,
      duration: session.endTime.getTime() - session.startTime.getTime(),
      participants: session.participants,
      qualityMetrics: session.qualityMetrics,
      recordingUrl: session.recordingUrl
    };

    console.log('Generated session report:', report);
  }

  private async stopZoomRecording(meetingId: string): Promise<void> {
    try {
      const jwt = await this.generateZoomJWT();
      await axios.patch(
        `https://api.zoom.us/v2/meetings/${meetingId}/recordings`,
        { action: 'stop' },
        {
          headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('Error stopping Zoom recording:', error);
    }
  }

  private async generateZoomJWT(): Promise<string> {
    const jwt = require('jsonwebtoken');
    const payload = {
      iss: this.zoomApiKey,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 // 1 hour expiration
    };

    return jwt.sign(payload, this.zoomApiSecret);
  }

  private generatePassword(): string {
    const length = 10;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  async getActiveSessions(doctorId?: number): Promise<TelemedicineSession[]> {
    const sessions = Array.from(this.activeSessions.values());

    if (doctorId) {
      return sessions.filter(session => session.doctorId === doctorId);
    }

    return sessions.filter(session => session.status === 'active');
  }

  async getSessionStatistics(doctorId?: number, dateRange?: { start: Date; end: Date }): Promise<any> {
    const sessions = Array.from(this.activeSessions.values());

    let filteredSessions = sessions;

    if (doctorId) {
      filteredSessions = filteredSessions.filter(session => session.doctorId === doctorId);
    }

    if (dateRange) {
      filteredSessions = filteredSessions.filter(session =>
        session.startTime >= dateRange.start && session.startTime <= dateRange.end
      );
    }

    const totalSessions = filteredSessions.length;
    const averageDuration = filteredSessions.length > 0
      ? filteredSessions.reduce((sum, session) => sum + (session.endTime.getTime() - session.startTime.getTime()), 0) / totalSessions
      : 0;

    const platformUsage = filteredSessions.reduce((acc, session) => {
      acc[session.platform] = (acc[session.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSessions,
      averageDuration: Math.round(averageDuration / 60000), // Convert to minutes
      platformUsage,
      successRate: filteredSessions.filter(s => s.status === 'ended').length / totalSessions * 100
    };
  }
}

export default new TelemedicineService();