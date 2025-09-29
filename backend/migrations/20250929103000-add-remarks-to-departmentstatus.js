module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('DepartmentStatuses', 'remarks', { type: Sequelize.TEXT, allowNull: true });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('DepartmentStatuses', 'remarks');
  }
};