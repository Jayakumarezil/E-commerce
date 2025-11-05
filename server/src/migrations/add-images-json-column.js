/**
 * Migration: Add images_json column to products table
 * Run this with: node server/src/migrations/add-images-json-column.js
 */

const { Sequelize } = require('sequelize');
require('dotenv').config({ path: './server/.env' });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'commerce_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
  }
);

async function addImagesJsonColumn() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connection established successfully.');

    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='products' AND column_name='images_json'
    `);

    if (results.length > 0) {
      console.log('Column images_json already exists. Skipping migration.');
      process.exit(0);
    }

    // Add images_json column
    await sequelize.query(`
      ALTER TABLE products 
      ADD COLUMN images_json JSONB
    `);

    console.log('✓ Added images_json column to products table');
    
    await sequelize.close();
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

addImagesJsonColumn();

