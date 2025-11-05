'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('warranties', {
      warranty_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'product_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      purchase_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      expiry_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      serial_number: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      invoice_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      registration_type: {
        type: Sequelize.ENUM('auto', 'manual'),
        defaultValue: 'manual',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('warranties', ['user_id']);
    await queryInterface.addIndex('warranties', ['product_id']);
    await queryInterface.addIndex('warranties', ['expiry_date']);
    await queryInterface.addIndex('warranties', ['serial_number'], { unique: true });
    await queryInterface.addIndex('warranties', ['registration_type']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('warranties');
  }
};
