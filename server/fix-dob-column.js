// Quick fix script to alter dob column to allow NULL
// Run this with: node fix-dob-column.js (from server directory)

const { Sequelize } = require('sequelize');
require('dotenv').config();

// Get database config from environment variables
const dbConfig = {
  database: process.env.DB_NAME || 'ecommerce',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: console.log,
};

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  logging: false, // Set to true for debug
});

async function fixDobColumn() {
  try {
    console.log('🔧 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected to database');
    
    console.log('🔧 Fixing dob column to allow NULL...');
    
    await sequelize.query(`
      ALTER TABLE memberships 
      ALTER COLUMN dob DROP NOT NULL;
    `);
    
    console.log('✅ Successfully updated dob column to allow NULL values');
    console.log('✅ You can now create memberships without DOB');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing dob column:', error.message);
    if (error.original) {
      console.error('Original error:', error.original.message);
    }
    await sequelize.close();
    process.exit(1);
  }
}

fixDobColumn();
