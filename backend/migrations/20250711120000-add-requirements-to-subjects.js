// Migration to add requirements field to Subjects table
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Subjects');
    if (!table.requirements) {
      await queryInterface.addColumn('Subjects', 'requirements', {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: ''
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Subjects', 'requirements');
  }
};
