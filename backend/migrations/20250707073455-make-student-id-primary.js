'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove existing primary key if any (usually 'id')
    // await queryInterface.removeColumn('Users', 'id'); // Uncomment if you have an 'id' column

    // Change student_id to be primary key and autoIncrement
    await queryInterface.changeColumn('Users', 'student_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert student_id to not be primary key (if needed)
    await queryInterface.changeColumn('Users', 'student_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: false,
      primaryKey: false,
    });
  }
};