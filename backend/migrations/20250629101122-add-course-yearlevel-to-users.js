module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Users');
    if (!table.course) {
      await queryInterface.addColumn('Users', 'course', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!table.year_level) {
      await queryInterface.addColumn('Users', 'year_level', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'course');
    await queryInterface.removeColumn('Users', 'year_level');
  },
};
