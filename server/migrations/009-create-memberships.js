'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('memberships', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      full_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      dob: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      mobile_primary: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      membership_start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      expiry_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      payment_mode: {
        type: Sequelize.ENUM('Cash', 'GPay'),
        allowNull: false,
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      unique_membership_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      phone_brand_model: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      imei_number: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('memberships', ['imei_number'], { unique: true });
    await queryInterface.addIndex('memberships', ['unique_membership_id'], { unique: true });
    await queryInterface.addIndex('memberships', ['mobile_primary']);
    await queryInterface.addIndex('memberships', ['expiry_date']);
    await queryInterface.addIndex('memberships', ['full_name']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('memberships');
  }
};

