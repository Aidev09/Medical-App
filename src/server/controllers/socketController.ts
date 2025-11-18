import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export interface AuthenticatedSocket extends Socket {
  userId?: number;
  userEmail?: string;
}

interface NotificationData {
  type: 'medication_reminder' | 'health_alert' | 'system_notification';
  title: string;
  message: string;
  data?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
}

class SocketController {
  private io: SocketIOServer;
  private connectedUsers: Map<number, Set<string>> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware(): void {
    // Authentication middleware
    this.io.use(async (socket: any, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const user = await User.findByPk(decoded.userId, {
          attributes: ['id', 'email', 'firstName', 'lastName']
        });

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user.id;
        socket.userEmail = user.email;
        next();
      } catch (error) {
        next(new Error('Invalid authentication token'));
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`✅ User ${socket.userEmail} connected with socket ${socket.id}`);

      // Add user to connected users map
      if (socket.userId) {
        if (!this.connectedUsers.has(socket.userId)) {
          this.connectedUsers.set(socket.userId, new Set());
        }
        this.connectedUsers.get(socket.userId)!.add(socket.id);
      }

      // Join user to their personal room
      if (socket.userId) {
        socket.join(`user:${socket.userId}`);
      }

      // Handle custom events
      socket.on('join_room', (roomId: string) => {
        socket.join(roomId);
        console.log(`User ${socket.userEmail} joined room: ${roomId}`);
      });

      socket.on('leave_room', (roomId: string) => {
        socket.leave(roomId);
        console.log(`User ${socket.userEmail} left room: ${roomId}`);
      });

      socket.on('mark_notification_read', (notificationId: string) => {
        // This would typically update the database
        socket.emit('notification_marked_read', { notificationId });
      });

      socket.on('get_connected_status', () => {
        const userCount = this.connectedUsers.size;
        socket.emit('connection_status', {
          connected: true,
          userCount,
          timestamp: new Date().toISOString()
        });
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log(`❌ User ${socket.userEmail} disconnected: ${reason}`);

        // Remove user from connected users map
        if (socket.userId) {
          const userSockets = this.connectedUsers.get(socket.userId);
          if (userSockets) {
            userSockets.delete(socket.id);
            if (userSockets.size === 0) {
              this.connectedUsers.delete(socket.userId);
            }
          }
        }
      });

      // Send welcome notification
      socket.emit('connected', {
        message: 'Successfully connected to Medical App notifications',
        userId: socket.userId,
        timestamp: new Date().toISOString()
      });
    });
  }

  // Send notification to specific user
  public sendToUser(userId: number, data: NotificationData): boolean {
    const userSockets = this.connectedUsers.get(userId);

    if (!userSockets || userSockets.size === 0) {
      console.log(`⚠️ User ${userId} is not connected`);
      return false;
    }

    this.io.to(`user:${userId}`).emit('notification', {
      id: this.generateNotificationId(),
      timestamp: new Date().toISOString(),
      ...data
    });

    console.log(`📢 Notification sent to user ${userId}: ${data.title}`);
    return true;
  }

  // Send medication reminder
  public sendMedicationReminder(userId: number, medicationName: string, time: string): boolean {
    return this.sendToUser(userId, {
      type: 'medication_reminder',
      title: 'Medication Reminder',
      message: `It's time to take your ${medicationName} at ${time}`,
      data: {
        medicationName,
        time,
        actionRequired: true
      },
      priority: 'high'
    });
  }

  // Send health alert
  public sendHealthAlert(userId: number, alertType: string, message: string): boolean {
    return this.sendToUser(userId, {
      type: 'health_alert',
      title: `Health Alert: ${alertType}`,
      message,
      data: {
        alertType,
        severity: 'high'
      },
      priority: 'high'
    });
  }

  // Send system notification
  public sendSystemNotification(userId: number, title: string, message: string): boolean {
    return this.sendToUser(userId, {
      type: 'system_notification',
      title,
      message,
      data: {
        source: 'system'
      },
      priority: 'normal'
    });
  }

  // Broadcast to all connected users
  public broadcast(data: Omit<NotificationData, 'type'> & { type?: string }): void {
    this.io.emit('broadcast', {
      id: this.generateNotificationId(),
      timestamp: new Date().toISOString(),
      type: data.type || 'system_notification',
      ...data
    });

    console.log(`📡 Broadcast sent to all users: ${data.title}`);
  }

  // Send to specific room
  public sendToRoom(roomId: string, data: NotificationData): void {
    this.io.to(roomId).emit('notification', {
      id: this.generateNotificationId(),
      timestamp: new Date().toISOString(),
      ...data
    });

    console.log(`📢 Notification sent to room ${roomId}: ${data.title}`);
  }

  // Get connected users count
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Check if user is connected
  public isUserConnected(userId: number): boolean {
    const userSockets = this.connectedUsers.get(userId);
    return userSockets ? userSockets.size > 0 : false;
  }

  // Get user's socket connections
  public getUserSockets(userId: number): string[] {
    const userSockets = this.connectedUsers.get(userId);
    return userSockets ? Array.from(userSockets) : [];
  }

  // Force disconnect user
  public disconnectUser(userId: number): void {
    const userSockets = this.connectedUsers.get(userId);
    if (userSockets) {
      userSockets.forEach(socketId => {
        this.io.sockets.sockets.get(socketId)?.disconnect(true);
      });
      this.connectedUsers.delete(userId);
      console.log(`🔌 Force disconnected user ${userId}`);
    }
  }

  // Send heartbeat to keep connections alive
  public startHeartbeat(): void {
    setInterval(() => {
      this.io.emit('heartbeat', {
        timestamp: new Date().toISOString(),
        connectedUsers: this.getConnectedUsersCount()
      });
    }, 30000); // Every 30 seconds
  }

  // Generate unique notification ID
  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get server instance
  public getIO(): SocketIOServer {
    return this.io;
  }

  // Graceful shutdown
  public shutdown(): void {
    console.log('🔄 Shutting down Socket.IO server...');

    // Notify all connected users about shutdown
    this.broadcast({
      title: 'Server Maintenance',
      message: 'Server is restarting. You may be temporarily disconnected.',
      priority: 'normal'
    });

    // Close all connections
    this.io.close(() => {
      console.log('✅ Socket.IO server shut down complete');
    });
  }
}

// Singleton pattern
let socketController: SocketController | null = null;

export const initializeSocket = (server: HTTPServer): SocketController => {
  if (socketController) {
    return socketController;
  }

  socketController = new SocketController(server);
  socketController.startHeartbeat();

  console.log('🚀 Socket.IO controller initialized');
  return socketController;
};

export const getSocketController = (): SocketController | null => {
  return socketController;
};

export default SocketController;