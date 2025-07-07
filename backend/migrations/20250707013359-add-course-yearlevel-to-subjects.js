'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Subjects', 'course', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'BSIT', // or any default for existing rows
    });
    await queryInterface.addColumn('Subjects', 'year_level', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '1st Year', // or any default for existing rows
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Subjects', 'course');
    await queryInterface.removeColumn('Subjects', 'year_level');
  }
};