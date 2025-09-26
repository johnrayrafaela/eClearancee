'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Subjects', 'teacher_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Teachers',
        key: 'teacher_id'
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Subjects', 'teacher_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Teachers',
        key: 'teacher_id'
      }
    });
  }
};
