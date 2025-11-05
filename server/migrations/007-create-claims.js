'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('claims', {
      claim_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      warranty_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'warranties',
          key: 'warranty_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      issue_description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'resolved'),
        defaultValue: 'pending',
      },
      admin_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    await queryInterface.addIndex('claims', ['warranty_id']);
    await queryInterface.addIndex('claims', ['status']);
    await queryInterface.addIndex('claims', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('claims');
  }
};
