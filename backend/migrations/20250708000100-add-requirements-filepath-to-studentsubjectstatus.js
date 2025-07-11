'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('StudentSubjectStatuses', 'requirements', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('StudentSubjectStatuses', 'file_path', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('StudentSubjectStatuses', 'requirements');
    await queryInterface.removeColumn('StudentSubjectStatuses', 'file_path');
  }
};
