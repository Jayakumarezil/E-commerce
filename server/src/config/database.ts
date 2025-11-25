import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Support Railway's DATABASE_URL or individual connection parameters
let sequelize: Sequelize;

// Railway provides multiple possible database URL variables
const databaseUrl = process.env.DATABASE_URL || 
                    process.env.POSTGRES_URL || 
                    process.env.PGDATABASE_URL ||
                    process.env.RAILWAY_DATABASE_URL;

// Railway also provides PostgreSQL-specific environment variables (PGHOST, PGPORT, etc.)
const pgHost = process.env.PGHOST || process.env.DB_HOST;
const pgPort = process.env.PGPORT || process.env.DB_PORT;
const pgDatabase = process.env.PGDATABASE || process.env.DB_NAME;
const pgUser = process.env.PGUSER || process.env.DB_USER;
const pgPassword = process.env.PGPASSWORD || process.env.DB_PASSWORD;

// Check if we have all PostgreSQL connection parameters
const hasPgParams = pgHost && pgPort && pgDatabase && pgUser && pgPassword;

if (databaseUrl) {
  // Parse the database URL
  let url = databaseUrl;
  
  // Log which URL we're using (without password)
  const urlForLogging = url.replace(/:([^:@]+)@/, ':****@');
  console.log('📊 Database URL detected:', urlForLogging);
  // Railway sometimes uses postgres.railway.internal for internal connections
  // This should work if services are in the same Railway project
  if (url.includes('postgres.railway.internal')) {
    console.log('ℹ️  Using Railway internal hostname (postgres.railway.internal)');
    console.log('ℹ️  Ensure PostgreSQL service is in the same Railway project');
    console.log('⚠️  If connection fails, check:');
    console.log('   1. PostgreSQL service is deployed and running');
    console.log('   2. Both services are in the same Railway project');
    console.log('   3. Services are properly linked (DATABASE_URL should be auto-set)');
  }
  
  // Railway provides DATABASE_URL in format: postgresql://user:password@host:port/database
  sequelize = new Sequelize(url, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '10'),
      min: parseInt(process.env.DB_POOL_MIN || '0'),
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
    },
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false,
      connectTimeout: 10000, // 10 second connection timeout
    }
  });
} else if (hasPgParams) {
  // Use Railway's PostgreSQL-specific environment variables
  const dbConfig = {
    host: pgHost!,
    port: parseInt(pgPort!),
    database: pgDatabase!,
    username: pgUser!,
    password: pgPassword!,
  };
  
  console.log('📊 Database configured from PG* environment variables:', {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    username: dbConfig.username,
  });
  
  sequelize = new Sequelize({
    dialect: 'postgres',
    ...dbConfig,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '10'),
      min: parseInt(process.env.DB_POOL_MIN || '0'),
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
    },
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false,
      connectTimeout: 10000,
    },
  });
} else {
  // Fallback to individual connection parameters
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'ecommerce_db',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  };
  
  console.log('📊 Database configured from individual parameters:', {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    username: dbConfig.username,
  });
  
  sequelize = new Sequelize({
    dialect: 'postgres',
    ...dbConfig,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '10'),
      min: parseInt(process.env.DB_POOL_MIN || '0'),
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
    },
  });
}

export default sequelize;
