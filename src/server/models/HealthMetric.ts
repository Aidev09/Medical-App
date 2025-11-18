import { DataTypes, Model, Sequelize, Op } from 'sequelize';

export interface IHealthMetricAttributes {
  id: number;
  userId: number;
  type: 'bloodPressure' | 'weight' | 'heartRate' | 'bloodSugar' | 'temperature';
  value: number;
  unit: string;
  timestamp: Date;
  notes?: string;
  source: 'manual' | 'device' | 'automatic';
  metadata?: {
    systolic?: number; // For blood pressure
    diastolic?: number; // For blood pressure
    position?: 'sitting' | 'standing' | 'lying'; // For blood pressure
    device?: string; // Device used for measurement
    location?: string; // Body location for measurement
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IHealthMetricCreationAttributes extends Omit<IHealthMetricAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class HealthMetric extends Model<IHealthMetricAttributes, IHealthMetricCreationAttributes> implements IHealthMetricAttributes {
  public id!: number;
  public userId!: number;
  public type!: 'bloodPressure' | 'weight' | 'heartRate' | 'bloodSugar' | 'temperature';
  public value!: number;
  public unit!: string;
  public timestamp!: Date;
  public notes?: string;
  public source!: 'manual' | 'device' | 'automatic';
  public metadata?: {
    systolic?: number;
    diastolic?: number;
    position?: 'sitting' | 'standing' | 'lying';
    device?: string;
    location?: string;
  };
  public createdAt!: Date;
  public updatedAt!: Date;

  // Instance methods
  public isWithinRange(): boolean {
    return this.getCategory() === 'normal';
  }

  public getCategory(): 'low' | 'normal' | 'high' | 'critical' {
    switch (this.type) {
      case 'bloodPressure':
        if (this.metadata?.systolic && this.metadata?.diastolic) {
          const systolic = this.metadata.systolic;
          const diastolic = this.metadata.diastolic;

          if (systolic < 90 || diastolic < 60) return 'low';
          if (systolic >= 180 || diastolic >= 120) return 'critical';
          if (systolic >= 140 || diastolic >= 90) return 'high';
          return 'normal';
        }
        return 'normal';

      case 'weight':
        // Weight categories depend on height, so we'll return normal by default
        return 'normal';

      case 'heartRate':
        if (this.value < 60) return 'low';
        if (this.value >= 120) return 'critical';
        if (this.value >= 100) return 'high';
        return 'normal';

      case 'bloodSugar':
        if (this.unit === 'mg/dL') {
          if (this.value < 70) return 'low';
          if (this.value >= 250) return 'critical';
          if (this.value >= 126) return 'high';
          return 'normal';
        } else { // mmol/L
          if (this.value < 3.9) return 'low';
          if (this.value >= 13.9) return 'critical';
          if (this.value >= 7.0) return 'high';
          return 'normal';
        }

      case 'temperature':
        if (this.unit === 'celsius') {
          if (this.value < 35.0) return 'low';
          if (this.value >= 40.0) return 'critical';
          if (this.value >= 38.0) return 'high';
          return 'normal';
        } else { // fahrenheit
          if (this.value < 95.0) return 'low';
          if (this.value >= 104.0) return 'critical';
          if (this.value >= 100.4) return 'high';
          return 'normal';
        }

      default:
        return 'normal';
    }
  }

  public getDisplayValue(): string {
    switch (this.type) {
      case 'bloodPressure':
        if (this.metadata?.systolic && this.metadata?.diastolic) {
          return `${this.metadata.systolic}/${this.metadata.diastolic} ${this.unit}`;
        }
        return `${this.value} ${this.unit}`;

      default:
        return `${this.value} ${this.unit}`;
    }
  }

  // Static methods will be added after model initialization
}

export const initHealthMetricModel = (sequelize: Sequelize) => {
  HealthMetric.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    type: {
      type: DataTypes.ENUM('bloodPressure', 'weight', 'heartRate', 'bloodSugar', 'temperature'),
      allowNull: false
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Value must be positive'
        }
      }
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isValidUnit(value: string) {
          const validUnits = {
            bloodPressure: ['mmHg'],
            weight: ['kg', 'lbs'],
            heartRate: ['bpm'],
            bloodSugar: ['mg/dL', 'mmol/L'],
            temperature: ['celsius', 'fahrenheit']
          };
          if (!validUnits[this.type]?.includes(value)) {
            throw new Error('Invalid unit for this metric type');
          }
        }
      }
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isNotInFuture(value: Date) {
          if (value > new Date()) {
            throw new Error('Timestamp cannot be in the future');
          }
        }
      }
    },
    notes: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    source: {
      type: DataTypes.ENUM('manual', 'device', 'automatic'),
      allowNull: false,
      defaultValue: 'manual'
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null
    }
  }, {
    sequelize,
    modelName: 'HealthMetric',
    tableName: 'health_metrics',
    timestamps: true,
    indexes: [
      {
        fields: ['userId', 'type', 'timestamp']
      },
      {
        fields: ['userId', 'timestamp']
      },
      {
        fields: ['type', 'timestamp']
      }
    ],
    hooks: {
      beforeValidate: (metric: HealthMetric) => {
        // Validation for blood pressure
        if (metric.type === 'bloodPressure') {
          const metadata = metric.metadata || {};
          if (!metadata.systolic || !metadata.diastolic) {
            throw new Error('Blood pressure requires both systolic and diastolic values');
          }
          // Set value to average of systolic and diastolic for sorting purposes
          metric.value = (metadata.systolic + metadata.diastolic) / 2;
        }
      }
    }
  });

  // Static methods
  HealthMetric.findByUserAndType = function(
    userId: number,
    type: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const whereClause: any = { userId, type };

    if (startDate || endDate) {
      whereClause.timestamp = {};
      if (startDate) whereClause.timestamp[Op.gte] = startDate;
      if (endDate) whereClause.timestamp[Op.lte] = endDate;
    }

    return this.findAll({
      where: whereClause,
      order: [['timestamp', 'DESC']]
    });
  };

  HealthMetric.getLatestMetrics = function(userId: number) {
    return this.findAll({
      where: { userId },
      order: [['timestamp', 'DESC']],
      group: ['type'],
      attributes: [
        'type',
        [Sequelize.fn('MAX', Sequelize.col('id')), 'latestId']
      ],
      include: [{
        model: HealthMetric,
        as: 'latestMetric',
        required: false,
        where: {
          id: Sequelize.where(
            Sequelize.col('latestMetric.id'),
            '=',
            Sequelize.literal(`(
              SELECT "id" FROM "health_metrics"
              WHERE "userId" = ${userId} AND "type" = "HealthMetric"."type"
              ORDER BY "timestamp" DESC LIMIT 1
            )`)
          )
        }
      }]
    });
  };

  HealthMetric.calculateStats = async function(
    userId: number,
    type: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const whereClause: any = { userId, type };

    if (startDate || endDate) {
      whereClause.timestamp = {};
      if (startDate) whereClause.timestamp[Op.gte] = startDate;
      if (endDate) whereClause.timestamp[Op.lte] = endDate;
    }

    const stats = await this.findOne({
      where: whereClause,
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.fn('AVG', Sequelize.col('value')), 'average'],
        [Sequelize.fn('MIN', Sequelize.col('value')), 'min'],
        [Sequelize.fn('MAX', Sequelize.col('value')), 'max'],
        [Sequelize.fn('MAX', Sequelize.col('timestamp')), 'latestTimestamp'],
        [Sequelize.fn('MIN', Sequelize.col('timestamp')), 'earliestTimestamp']
      ],
      raw: true
    });

    return stats;
  };

  HealthMetric.getTrends = async function(
    userId: number,
    type: string,
    days: number = 30
  ) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.findAll({
      where: {
        userId,
        type,
        timestamp: {
          [Op.gte]: startDate
        }
      },
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('timestamp')), 'date'],
        [Sequelize.fn('AVG', Sequelize.col('value')), 'value'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: [Sequelize.fn('DATE', Sequelize.col('timestamp'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('timestamp')), 'ASC']],
      raw: true
    });
  };

  return HealthMetric;
};

export default HealthMetric;