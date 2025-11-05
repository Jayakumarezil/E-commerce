'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await queryInterface.bulkInsert('users', [
      {
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Admin User',
        email: 'admin@ecommerce.com',
        password_hash: hashedPassword,
        phone: '+1234567890',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'John Doe',
        email: 'john.doe@example.com',
        password_hash: await bcrypt.hash('password123', 12),
        phone: '+1234567891',
        role: 'customer',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password_hash: await bcrypt.hash('password123', 12),
        phone: '+1234567892',
        role: 'customer',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};
