"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('StudentSubjectStatuses', 'remarks', { type: Sequelize.TEXT, allowNull: true });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('StudentSubjectStatuses', 'remarks');
  }
};
