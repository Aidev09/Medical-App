import { DataTypes, Model, Sequelize, Op } from 'sequelize';

export interface IAppointmentAttributes {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentType: 'in-person' | 'video' | 'phone' | 'chat';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduledDateTime: Date;
  duration: number; // minutes
  timezone: string;
  reason: string;
  symptoms?: string;
  medicalHistory?: string;
  medications?: string[];
  allergies?: string[];
  notes?: string;
  consultation: {
    fee: number;
    currency: string;
    paymentStatus: 'pending' | 'paid' | 'refunded' | 'partially_refunded';
    paymentMethod?: string;
    paymentId?: string;
    insuranceUsed: boolean;
    insuranceDetails?: {
      provider: string;
      policyNumber: string;
      authorizationNumber?: string;
      coverageAmount: number;
      patientResponsibility: number;
    };
  };
  location?: {
    type: 'clinic' | 'hospital' | 'home' | 'other';
    name: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    };
    phone?: string;
    directions?: string;
    parkingInfo?: string;
  };
  telehealth?: {
    platform: 'zoom' | 'teams' | 'google_meet' | 'custom' | 'phone';
    meetingLink?: string;
    meetingId?: string;
    meetingPassword?: string;
    dialInNumber?: string;
    accessCode?: string;
    instructions?: string;
    testLink?: string;
    technicalRequirements?: string[];
  };
  reminders: {
    email: boolean;
    sms: boolean;
    push: boolean;
    times: number[]; // minutes before appointment
  };
  documents: Array<{
    type: 'medical_record' | 'prescription' | 'lab_result' | 'imaging' | 'insurance' | 'other';
    name: string;
    url: string;
    uploadedAt: Date;
    uploadedBy: 'patient' | 'doctor' | 'staff';
  }>;
  rescheduleHistory: Array<{
    fromDateTime: Date;
    toDateTime: Date;
    reason: string;
    requestedBy: 'patient' | 'doctor' | 'staff';
    rescheduledAt: Date;
  }>;
  cancellationReason?: string;
  cancelledBy?: 'patient' | 'doctor' | 'staff';
  cancellationDate?: Date;
  cancellationPolicy: {
    refundable: boolean;
    refundDeadline?: Date;
    cancellationFee?: number;
    cancellationFeeType: 'fixed' | 'percentage';
    noticePeriodHours: number;
  };
  followUp?: {
    recommended: boolean;
    suggestedTimeframe?: string;
    nextAppointmentType?: string;
    notes?: string;
  };
  reviews: Array<{
    rating: number;
    comment?: string;
    reviewedAt: Date;
    reviewedBy: 'patient';
    response?: {
      comment: string;
      respondedAt: Date;
      respondedBy: 'doctor';
    };
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAppointmentCreationAttributes extends Omit<IAppointmentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Appointment extends Model<IAppointmentAttributes, IAppointmentCreationAttributes> implements IAppointmentAttributes {
  public id!: number;
  public patientId!: number;
  public doctorId!: number;
  public appointmentType!: 'in-person' | 'video' | 'phone' | 'chat';
  public status!: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled';
  public priority!: 'low' | 'normal' | 'high' | 'urgent';
  public scheduledDateTime!: Date;
  public duration!: number;
  public timezone!: string;
  public reason!: string;
  public symptoms?: string;
  public medicalHistory?: string;
  public medications?: string[];
  public allergies?: string[];
  public notes?: string;
  public consultation!: {
    fee: number;
    currency: string;
    paymentStatus: 'pending' | 'paid' | 'refunded' | 'partially_refunded';
    paymentMethod?: string;
    paymentId?: string;
    insuranceUsed: boolean;
    insuranceDetails?: {
      provider: string;
      policyNumber: string;
      authorizationNumber?: string;
      coverageAmount: number;
      patientResponsibility: number;
    };
  };
  public location?: {
    type: 'clinic' | 'hospital' | 'home' | 'other';
    name: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    };
    phone?: string;
    directions?: string;
    parkingInfo?: string;
  };
  public telehealth?: {
    platform: 'zoom' | 'teams' | 'google_meet' | 'custom' | 'phone';
    meetingLink?: string;
    meetingId?: string;
    meetingPassword?: string;
    dialInNumber?: string;
    accessCode?: string;
    instructions?: string;
    testLink?: string;
    technicalRequirements?: string[];
  };
  public reminders!: {
    email: boolean;
    sms: boolean;
    push: boolean;
    times: number[];
  };
  public documents!: Array<{
    type: 'medical_record' | 'prescription' | 'lab_result' | 'imaging' | 'insurance' | 'other';
    name: string;
    url: string;
    uploadedAt: Date;
    uploadedBy: 'patient' | 'doctor' | 'staff';
  }>;
  public rescheduleHistory!: Array<{
    fromDateTime: Date;
    toDateTime: Date;
    reason: string;
    requestedBy: 'patient' | 'doctor' | 'staff';
    rescheduledAt: Date;
  }>;
  public cancellationReason?: string;
  public cancelledBy?: 'patient' | 'doctor' | 'staff';
  public cancellationDate?: Date;
  public cancellationPolicy!: {
    refundable: boolean;
    refundDeadline?: Date;
    cancellationFee?: number;
    cancellationFeeType: 'fixed' | 'percentage';
    noticePeriodHours: number;
  };
  public followUp?: {
    recommended: boolean;
    suggestedTimeframe?: string;
    nextAppointmentType?: string;
    notes?: string;
  };
  public reviews!: Array<{
    rating: number;
    comment?: string;
    reviewedAt: Date;
    reviewedBy: 'patient';
    response?: {
      comment: string;
      respondedAt: Date;
      respondedBy: 'doctor';
    };
  }>;
  public createdAt!: Date;
  public updatedAt!: Date;

  // Instance methods
  public isUpcoming(): boolean {
    return ['scheduled', 'confirmed'].includes(this.status) && this.scheduledDateTime > new Date();
  }

  public isPast(): boolean {
    return this.scheduledDateTime < new Date();
  }

  public canBeCancelled(): boolean {
    const now = new Date();
    const appointmentTime = new Date(this.scheduledDateTime);
    const noticePeriod = this.cancellationPolicy.noticePeriodHours * 60 * 60 * 1000;

    return ['scheduled', 'confirmed'].includes(this.status) &&
           (appointmentTime.getTime() - now.getTime()) > noticePeriod;
  }

  public canBeRescheduled(): boolean {
    return this.canBeCancelled();
  }

  public getCancellationFee(): number {
    if (!this.cancellationPolicy.refundable || !this.cancellationPolicy.cancellationFee) {
      return 0;
    }

    if (this.cancellationPolicy.cancellationFeeType === 'fixed') {
      return this.cancellationPolicy.cancellationFee;
    } else {
      return Math.round(this.consultation.fee * (this.cancellationPolicy.cancellationFee / 100));
    }
  }

  public getRefundAmount(): number {
    return Math.max(0, this.consultation.fee - this.getCancellationFee());
  }

  public getEndTime(): Date {
    const endTime = new Date(this.scheduledDateTime);
    endTime.setMinutes(endTime.getMinutes() + this.duration);
    return endTime;
  }

  public getFormattedDateTime(): string {
    return this.scheduledDateTime.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: this.timezone
    });
  }

  public addReview(rating: number, comment?: string): void {
    const review = {
      rating,
      comment,
      reviewedAt: new Date(),
      reviewedBy: 'patient' as const
    };

    this.reviews.push(review);
  }

  public addDocument(document: any): void {
    this.documents.push({
      ...document,
      uploadedAt: new Date()
    });
  }

  public addToRescheduleHistory(fromDateTime: Date, toDateTime: Date, reason: string, requestedBy: string): void {
    this.rescheduleHistory.push({
      fromDateTime,
      toDateTime,
      reason,
      requestedBy: requestedBy as any,
      rescheduledAt: new Date()
    });
  }

  // Static methods will be added after model initialization
}

export const initAppointmentModel = (sequelize: Sequelize) => {
  Appointment.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'doctors',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    appointmentType: {
      type: DataTypes.ENUM('in-person', 'video', 'phone', 'chat'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled'),
      allowNull: false,
      defaultValue: 'scheduled'
    },
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'normal'
    },
    scheduledDateTime: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isFutureDate(value: Date) {
          if (value <= new Date()) {
            throw new Error('Appointment must be scheduled for a future date');
          }
        }
      }
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 15,
        max: 480
      }
    },
    timezone: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'UTC'
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [10, 1000]
      }
    },
    symptoms: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    medicalHistory: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    medications: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    allergies: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    consultation: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        fee: 100,
        currency: 'USD',
        paymentStatus: 'pending',
        insuranceUsed: false
      }
    },
    location: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    telehealth: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    reminders: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        email: true,
        sms: true,
        push: true,
        times: [1440, 60, 15] // 24 hours, 1 hour, 15 minutes before
      }
    },
    documents: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    rescheduleHistory: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    cancellationReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cancelledBy: {
      type: DataTypes.ENUM('patient', 'doctor', 'staff'),
      allowNull: true
    },
    cancellationDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancellationPolicy: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        refundable: true,
        noticePeriodHours: 24,
        cancellationFee: 0,
        cancellationFeeType: 'fixed'
      }
    },
    followUp: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    reviews: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    }
  }, {
    sequelize,
    modelName: 'Appointment',
    tableName: 'appointments',
    timestamps: true,
    indexes: [
      {
        fields: ['patientId']
      },
      {
        fields: ['doctorId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['scheduledDateTime']
      },
      {
        fields: ['appointmentType']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['doctorId', 'scheduledDateTime', 'status']
      }
    ],
    hooks: {
      beforeValidate: (appointment: Appointment) => {
        // Validate telehealth requirements for video/phone appointments
        if (['video', 'phone'].includes(appointment.appointmentType) && !appointment.telehealth) {
          throw new Error('Telehealth details are required for video/phone appointments');
        }

        // Validate location requirements for in-person appointments
        if (appointment.appointmentType === 'in-person' && !appointment.location) {
          throw new Error('Location details are required for in-person appointments');
        }
      }
    }
  });

  // Static methods
  Appointment.findByPatient = function(patientId: number, status?: string) {
    const whereClause: any = { patientId };
    if (status) {
      whereClause.status = status;
    }

    return this.findAll({
      where: whereClause,
      order: [['scheduledDateTime', 'DESC']]
    });
  };

  Appointment.findByDoctor = function(doctorId: number, dateRange?: { start: Date; end: Date }) {
    const whereClause: any = { doctorId };

    if (dateRange) {
      whereClause.scheduledDateTime = {
        [Op.between]: [dateRange.start, dateRange.end]
      };
    }

    return this.findAll({
      where: whereClause,
      order: [['scheduledDateTime', 'ASC']]
    });
  };

  Appointment.findUpcoming = function(patientId?: number, doctorId?: number) {
    const whereClause: any = {
      status: ['scheduled', 'confirmed'],
      scheduledDateTime: {
        [Op.gt]: new Date()
      }
    };

    if (patientId) whereClause.patientId = patientId;
    if (doctorId) whereClause.doctorId = doctorId;

    return this.findAll({
      where: whereClause,
      order: [['scheduledDateTime', 'ASC']]
    });
  };

  Appointment.findConflicts = function(doctorId: number, dateTime: Date, duration: number, excludeId?: number) {
    const appointmentEnd = new Date(dateTime);
    appointmentEnd.setMinutes(appointmentEnd.getMinutes() + duration);

    const whereClause: any = {
      doctorId,
      status: ['scheduled', 'confirmed'],
      [Op.or]: [
        {
          scheduledDateTime: {
            [Op.between]: [dateTime, appointmentEnd]
          }
        },
        {
          [Op.and]: [
            { scheduledDateTime: { [Op.lt]: dateTime } },
            {
              [Op.where]: {
                [Op.col]: 'duration',
                [Op.gt]: sequelize.literal(`EXTRACT(EPOCH FROM INTERVAL '${dateTime.getTime() - new Date(0).getTime()} milliseconds' - "scheduledDateTime") / 60`)
              }
            }
          ]
        }
      ]
    };

    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    return this.findOne({ where: whereClause });
  };

  Appointment.getStatistics = function(dateRange?: { start: Date; end: Date }) {
    const whereClause: any = {};

    if (dateRange) {
      whereClause.scheduledDateTime = {
        [Op.between]: [dateRange.start, dateRange.end]
      };
    }

    return this.findAll({
      where: whereClause,
      attributes: [
        'status',
        'appointmentType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status', 'appointmentType'],
      raw: true
    });
  };

  Appointment.findPendingReviews = function(patientId: number) {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    return this.findAll({
      where: {
        patientId,
        status: 'completed',
        scheduledDateTime: {
          [Op.lt]: new Date()
        },
        reviews: {
          [Op.isEmpty]: true
        }
      },
      order: [['scheduledDateTime', 'DESC']]
    });
  };

  return Appointment;
};

export default Appointment;