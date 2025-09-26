'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Subjects');
    if (!table.course) {
      await queryInterface.addColumn('Subjects', 'course', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'BSIT',
      });
    }
    if (!table.year_level) {
      await queryInterface.addColumn('Subjects', 'year_level', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '1st Year',
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Subjects', 'course');
    await queryInterface.removeColumn('Subjects', 'year_level');
  }
};