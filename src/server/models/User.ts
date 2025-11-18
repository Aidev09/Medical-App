import { DataTypes, Model, Optional, Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sequelize } from '../config/database.js';

export interface IUserPreferences {
  timezone?: string;
  units: {
    weight: 'kg' | 'lbs';
    height: 'cm' | 'ft';
    temperature: 'celsius' | 'fahrenheit';
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    medicationReminders: boolean;
    healthAlerts: boolean;
  };
  privacy: {
    shareHealthData: boolean;
    allowAnalytics: boolean;
  };
}

export interface IUserAttributes {
  id: number;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phone?: string;
  profilePicture?: string;
  googleId?: string;
  firebaseUid?: string;
  emailVerified: boolean;
  lastLogin?: Date;
  role: 'user' | 'provider' | 'admin';
  preferences: IUserPreferences;
  isActive: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserCreationAttributes extends Optional<IUserAttributes, 'id' | 'emailVerified' | 'role' | 'preferences' | 'isActive' | 'loginAttempts' | 'createdAt' | 'updatedAt'> {}

class User extends Model<IUserAttributes, IUserCreationAttributes> implements IUserAttributes {
  public id!: number;
  public email!: string;
  public password?: string;
  public firstName!: string;
  public lastName!: string;
  public dateOfBirth!: Date;
  public phone?: string;
  public profilePicture?: string;
  public googleId?: string;
  public firebaseUid?: string;
  public emailVerified!: boolean;
  public lastLogin?: Date;
  public role!: 'user' | 'provider' | 'admin';
  public preferences!: IUserPreferences;
  public isActive!: boolean;
  public emailVerificationToken?: string;
  public emailVerificationExpires?: Date;
  public passwordResetToken?: string;
  public passwordResetExpires?: Date;
  public loginAttempts!: number;
  public lockUntil?: Date;
  public createdAt!: Date;
  public updatedAt!: Date;

  // Virtual fields
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get age(): number {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  // Instance methods
  async comparePassword(candidatePassword: string): Promise<boolean> {
    if (!this.password) {
      return false;
    }
    return bcrypt.compare(candidatePassword, this.password);
  }

  generateEmailVerificationToken(): string {
    const token = crypto.randomBytes(32).toString('hex');

    this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
    this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    return token; // Return the unhashed token
  }

  generatePasswordResetToken(): string {
    const token = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    return token; // Return the unhashed token
  }

  isLocked(): boolean {
    return !!(this.lockUntil && this.lockUntil > new Date());
  }

  async incrementLoginAttempts(): Promise<void> {
    const maxAttempts = 5;
    const lockTime = 2 * 60 * 60 * 1000; // 2 hours

    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < new Date()) {
      this.loginAttempts = 1;
      this.lockUntil = undefined;
      await this.save();
      return;
    }

    this.loginAttempts += 1;

    // Lock account if reached max attempts and not already locked
    if (this.loginAttempts >= maxAttempts && !this.isLocked()) {
      this.lockUntil = new Date(Date.now() + lockTime);
    }

    await this.save();
  }

  async resetLoginAttempts(): Promise<void> {
    this.loginAttempts = 0;
    this.lockUntil = undefined;
    await this.save();
  }

  // Hooks
  static async hashPasswordHook(user: User) {
    if (user.password && user.changed('password')) {
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(user.password, salt);
    }
  }

  toJSON() {
    const values = Object.assign({}, this.get());

    // Remove sensitive fields
    delete values.password;
    delete values.passwordResetToken;
    delete values.passwordResetExpires;
    delete values.emailVerificationToken;
    delete values.emailVerificationExpires;
    delete values.loginAttempts;
    delete values.lockUntil;

    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      },
      set(value: string) {
        this.setDataValue('email', value.toLowerCase().trim());
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // OAuth users may not have password
      validate: {
        len: [8, 255]
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 50]
      },
      set(value: string) {
        this.setDataValue('firstName', value.trim());
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 50]
      },
      set(value: string) {
        this.setDataValue('lastName', value.trim());
      }
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isBefore: new Date().toISOString()
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^[+]?[\d\s\-\(\)]+$/
      }
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    firebaseUid: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('user', 'provider', 'admin'),
      allowNull: false,
      defaultValue: 'user'
    },
    preferences: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        timezone: 'UTC',
        units: {
          weight: 'kg',
          height: 'cm',
          temperature: 'celsius'
        },
        notifications: {
          email: true,
          push: true,
          sms: false,
          medicationReminders: true,
          healthAlerts: true
        },
        privacy: {
          shareHealthData: false,
          allowAnalytics: true
        }
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    emailVerificationExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    loginAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    lockUntil: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    hooks: {
      beforeCreate: User.hashPasswordHook,
      beforeUpdate: User.hashPasswordHook
    },
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        unique: true,
        fields: ['googleId'],
        where: {
          googleId: {
            [Op.ne]: null
          }
        }
      },
      {
        unique: true,
        fields: ['firebaseUid'],
        where: {
          firebaseUid: {
            [Op.ne]: null
          }
        }
      },
      {
        fields: ['emailVerifiedToken']
      },
      {
        fields: ['passwordResetToken']
      },
      {
        fields: ['isActive']
      },
      {
        fields: ['createdAt']
      }
    ]
  }
);

// Static methods
User.findByEmailWithPassword = async function(email: string): Promise<User | null> {
  return User.findOne({
    where: { email: email.toLowerCase() },
    attributes: { include: ['password', 'loginAttempts', 'lockUntil'] }
  });
};

User.findByVerificationToken = async function(token: string): Promise<User | null> {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  return User.findOne({
    where: {
      emailVerificationToken: hashedToken,
      emailVerificationExpires: {
        [Op.gt]: new Date()
      }
    }
  });
};

User.findByPasswordResetToken = async function(token: string): Promise<User | null> {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  return User.findOne({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        [Op.gt]: new Date()
      }
    }
  });
};

export default User;