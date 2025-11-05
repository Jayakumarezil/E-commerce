const { execSync } = require('child_process');
const path = require('path');

// Database Reset Script
console.log('🔄 Resetting E-commerce Database...');

// Get database connection details from environment
const DB_NAME = process.env.DB_NAME || 'ecommerce_db';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '5432';

console.log(`📊 Database: ${DB_NAME}`);
console.log(`👤 User: ${DB_USER}`);
console.log(`🌐 Host: ${DB_HOST}:${DB_PORT}`);

try {
  // Drop and recreate database
  console.log('🗑️ Dropping existing database...');
  try {
    execSync(`psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};"`, { stdio: 'pipe' });
  } catch (error) {
    console.log('Database didn\'t exist or couldn\'t be dropped');
  }

  console.log('🆕 Creating fresh database...');
  execSync(`psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d postgres -c "CREATE DATABASE ${DB_NAME};"`, { stdio: 'inherit' });

  console.log('✅ Database created successfully!');
  
  // Run the database setup
  console.log('🔧 Setting up database schema and data...');
  execSync('node src/utils/setupDatabase.js', { stdio: 'inherit' });

  console.log('🎉 Database reset completed successfully!');
  console.log('🚀 You can now start the server with: npm run dev');

} catch (error) {
  console.error('❌ Database reset failed:', error.message);
  console.log('\n🔧 Manual steps:');
  console.log('1. Make sure PostgreSQL is running');
  console.log('2. Check your database credentials in .env file');
  console.log('3. Try running: node src/utils/setupDatabase.js');
  process.exit(1);
}
