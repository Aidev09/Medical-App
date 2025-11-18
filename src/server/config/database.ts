import { Sequelize } from 'sequelize';
import { config } from 'dotenv';

config(); // Load environment variables

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'medical_app',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10, // Maximum number of connection in pool
    min: 0, // Minimum number of connection in pool
    acquire: 30000, // Maximum time, in milliseconds, that a connection can be idle before being released
    idle: 10000 // Maximum time, in milliseconds, that a connection can be idle before being released
  },
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log(`✅ PostgreSQL connected successfully`);
    console.log(`📊 Database: ${sequelize.config.database}`);
    console.log(`🌐 Host: ${sequelize.config.host}:${sequelize.config.port}`);

    // Sync all models (in production, you might want to use migrations instead)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('🔄 Database synchronized');
    }

    // Handle connection events
    sequelize.addHook('beforeConnect', () => {
      console.log('🟢 Attempting to connect to PostgreSQL...');
    });

    sequelize.addHook('afterConnect', () => {
      console.log('🟢 PostgreSQL connection established');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('🔴 Closing PostgreSQL connection...');
      await sequelize.close();
      console.log('🔴 PostgreSQL connection closed');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('🔴 Closing PostgreSQL connection...');
      await sequelize.close();
      console.log('🔴 PostgreSQL connection closed');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    process.exit(1);
  }
};

// Test connection function
export const testConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

// Get database info
export const getDatabaseInfo = () => {
  return {
    dialect: sequelize.getDialect(),
    database: sequelize.config.database,
    host: sequelize.config.host,
    port: sequelize.config.port
  };
};

export { sequelize, connectDB };