'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Best-effort: only attempt if describeTable shows not primary (cannot easily detect in generic way)
    try {
      await queryInterface.changeColumn('Users', 'student_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      });
    } catch (e) {
      // Ignore if already primary / changed
      console.log('Skipping make-student-id-primary (already applied):', e.message);
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
      console.log('Skipping revert make-student-id-primary:', e.message);
    }
  }
};