'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('StudentSubjectStatuses');
    if (!table.requirements) {
      await queryInterface.addColumn('StudentSubjectStatuses', 'requirements', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
    if (!table.file_path) {
      await queryInterface.addColumn('StudentSubjectStatuses', 'file_path', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('StudentSubjectStatuses', 'requirements');
    await queryInterface.removeColumn('StudentSubjectStatuses', 'file_path');
  }
};
