'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.changeColumn('Users', 'student_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      });
    } catch (e) {
      console.log('Skipping duplicate make-student-id-primary migration:', e.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.changeColumn('Users', 'student_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: false,
        primaryKey: false,
      });
    } catch (e) {
      console.log('Skipping revert duplicate make-student-id-primary migration:', e.message);
    }
  }
};