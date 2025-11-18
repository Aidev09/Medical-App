import { DataTypes, Model, Sequelize } from 'sequelize';

export interface IDoctorAttributes {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialization: string;
  subspecialties: string[];
  credentials: {
    degree: string;
    institution: string;
    year: number;
    licenseNumber: string;
    npiNumber?: string;
  };
  experience: number; // years of experience
  languages: string[];
  biography: string;
  education: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  certifications: Array<{
    name: string;
    issuedBy: string;
    validUntil?: Date;
    certificateNumber: string;
  }>;
  practiceInfo: {
    hospital?: string;
    clinicName: string;
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
    phone: string;
    website?: string;
    email: string;
  };
  consultation: {
    inPerson: boolean;
    telehealth: boolean;
    homeVisit: boolean;
    consultationFee: number;
    consultationDuration: number; // minutes
  };
  availability: {
    workingHours: {
      day: string;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }[];
    timezone: string;
    bookingWindowDays: number;
    minAdvanceBookingHours: number;
    maxAdvanceBookingDays: number;
  };
  specialties: string[];
  acceptsInsurance: boolean;
  insuranceProviders: string[];
  averageRating: number;
  totalReviews: number;
  isActive: boolean;
  isVerified: boolean;
  profileImage?: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  consultationTypes: Array<{
    type: 'in-person' | 'video' | 'phone' | 'chat';
    duration: number;
    fee: number;
    description: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDoctorCreationAttributes extends Omit<IDoctorAttributes, 'id' | 'createdAt' | 'updatedAt' | 'averageRating' | 'totalReviews'> {}

class Doctor extends Model<IDoctorAttributes, IDoctorCreationAttributes> implements IDoctorAttributes {
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public phone?: string;
  public specialization!: string;
  public subspecialties!: string[];
  public credentials!: {
    degree: string;
    institution: string;
    year: number;
    licenseNumber: string;
    npiNumber?: string;
  };
  public experience!: number;
  public languages!: string[];
  public biography!: string;
  public education!: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  public certifications!: Array<{
    name: string;
    issuedBy: string;
    validUntil?: Date;
    certificateNumber: string;
  }>;
  public practiceInfo!: {
    hospital?: string;
    clinicName: string;
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
    phone: string;
    website?: string;
    email: string;
  };
  public consultation!: {
    inPerson: boolean;
    telehealth: boolean;
    homeVisit: boolean;
    consultationFee: number;
    consultationDuration: number;
  };
  public availability!: {
    workingHours: {
      day: string;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }[];
    timezone: string;
    bookingWindowDays: number;
    minAdvanceBookingHours: number;
    maxAdvanceBookingDays: number;
  };
  public specialties!: string[];
  public acceptsInsurance!: boolean;
  public insuranceProviders!: string[];
  public averageRating!: number;
  public totalReviews!: number;
  public isActive!: boolean;
  public isVerified!: boolean;
  public profileImage?: string;
  public socialMedia?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  public consultationTypes!: Array<{
    type: 'in-person' | 'video' | 'phone' | 'chat';
    duration: number;
    fee: number;
    description: string;
  }>;
  public createdAt!: Date;
  public updatedAt!: Date;

  // Instance methods
  public getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public isAvailableAtDate(date: Date): boolean {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const workingDay = this.availability.workingHours.find(
      day => day.day.toLowerCase() === dayName.toLowerCase()
    );

    return workingDay ? workingDay.isAvailable : false;
  }

  public getAvailableTimeSlots(date: Date): string[] {
    if (!this.isAvailableAtDate(date)) {
      return [];
    }

    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const workingDay = this.availability.workingHours.find(
      day => day.day.toLowerCase() === dayName.toLowerCase()
    );

    if (!workingDay) {
      return [];
    }

    // Generate time slots based on consultation duration
    const slots: string[] = [];
    const startTime = this.timeStringToMinutes(workingDay.startTime);
    const endTime = this.timeStringToMinutes(workingDay.endTime);
    const duration = this.consultation.consultationDuration;

    for (let time = startTime; time + duration <= endTime; time += duration) {
      slots.push(this.minutesToTimeString(time));
    }

    return slots;
  }

  public getNextAvailableDate(): Date {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + this.availability.bookingWindowDays);

    for (let date = new Date(today); date <= maxDate; date.setDate(date.getDate() + 1)) {
      if (this.isAvailableAtDate(date)) {
        return new Date(date);
      }
    }

    return maxDate;
  }

  private timeStringToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTimeString(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // Static methods will be added after model initialization
}

export const initDoctorModel = (sequelize: Sequelize) => {
  Doctor.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: /^[+]?[\d\s\-\(\)]+$/
      }
    },
    specialization: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    subspecialties: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    credentials: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        isCredentialsValid(value: any) {
          if (!value.degree || !value.institution || !value.year || !value.licenseNumber) {
            throw new Error('All credential fields are required');
          }
        }
      }
    },
    experience: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 80
      }
    },
    languages: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: ['English']
    },
    biography: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [10, 5000]
      }
    },
    education: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    certifications: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    practiceInfo: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        isPracticeInfoValid(value: any) {
          if (!value.clinicName || !value.address || !value.phone || !value.email) {
            throw new Error('Practice information is incomplete');
          }
        }
      }
    },
    consultation: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        inPerson: true,
        telehealth: false,
        homeVisit: false,
        consultationFee: 100,
        consultationDuration: 30
      }
    },
    availability: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        workingHours: [],
        timezone: 'UTC',
        bookingWindowDays: 30,
        minAdvanceBookingHours: 24,
        maxAdvanceBookingDays: 90
      }
    },
    specialties: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    acceptsInsurance: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    insuranceProviders: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    averageRating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5
      }
    },
    totalReviews: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    profileImage: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    socialMedia: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null
    },
    consultationTypes: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [
        {
          type: 'in-person',
          duration: 30,
          fee: 100,
          description: 'In-person consultation'
        }
      ]
    }
  }, {
    sequelize,
    modelName: 'Doctor',
    tableName: 'doctors',
    timestamps: true,
    indexes: [
      {
        fields: ['specialization']
      },
      {
        fields: ['isActive', 'isVerified']
      },
      {
        fields: ['averageRating']
      },
      {
        fields: ['experience']
      }
    ],
    hooks: {
      beforeValidate: (doctor: Doctor) => {
        // Additional validation can be added here
      }
    }
  });

  // Static methods
  Doctor.findBySpecialization = function(specialization: string, limit: number = 10) {
    return this.findAll({
      where: {
        specialization: {
          [Op.iLike]: `%${specialization}%`
        },
        isActive: true
      },
      order: [['averageRating', 'DESC']],
      limit
    });
  };

  Doctor.findByLocation = function(city: string, state: string, radius: number = 50) {
    // This would typically use a geospatial query
    // For now, return all active doctors (geospatial queries would require PostGIS)
    return this.findAll({
      where: {
        isActive: true
      },
      order: [['averageRating', 'DESC']]
    });
  };

  Doctor.findTopRated = function(limit: number = 10) {
    return this.findAll({
      where: {
        isActive: true,
        isVerified: true,
        totalReviews: {
          [Op.gte]: 5
        }
      },
      order: [['averageRating', 'DESC'], ['totalReviews', 'DESC']],
      limit
    });
  };

  Doctor.search = function(query: string, filters: any = {}) {
    const whereClause: any = {
      [Op.and]: [
        { isActive: true },
        {
          [Op.or]: [
            {
              firstName: {
                [Op.iLike]: `%${query}%`
              }
            },
            {
              lastName: {
                [Op.iLike]: `%${query}%`
              }
            },
            {
              specialization: {
                [Op.iLike]: `%${query}%`
              }
            },
            {
              specialties: {
                [Op.contains]: [query]
              }
            }
          ]
        }
      ]
    };

    if (filters.specialization) {
      whereClause[Op.and].push({
        specialization: {
          [Op.iLike]: `%${filters.specialization}%`
        }
      });
    }

    if (filters.city) {
      whereClause[Op.and].push({
        'practiceInfo.address.city': {
          [Op.iLike]: `%${filters.city}%`
        }
      });
    }

    if (filters.acceptsInsurance !== undefined) {
      whereClause[Op.and].push({
        acceptsInsurance: filters.acceptsInsurance
      });
    }

    return this.findAll({
      where: whereClause,
      order: [['averageRating', 'DESC']]
    });
  };

  return Doctor;
};

export default Doctor;