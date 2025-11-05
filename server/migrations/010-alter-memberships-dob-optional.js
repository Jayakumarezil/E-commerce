'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('memberships', 'dob', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('memberships', 'dob', {
      type: Sequelize.DATEONLY,
      allowNull: false,
    });
  }
};

