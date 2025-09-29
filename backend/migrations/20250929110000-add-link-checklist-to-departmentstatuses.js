'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('DepartmentStatuses', 'link', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('DepartmentStatuses', 'checklist', { type: Sequelize.TEXT, allowNull: true, comment: 'JSON array of boolean completion values' });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('DepartmentStatuses', 'link');
    await queryInterface.removeColumn('DepartmentStatuses', 'checklist');
  }
};
