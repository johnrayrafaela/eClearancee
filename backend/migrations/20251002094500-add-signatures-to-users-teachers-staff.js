'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Users
    const userTable = await queryInterface.describeTable('Users');
    if (!userTable.signature) {
      await queryInterface.addColumn('Users', 'signature', { type: Sequelize.TEXT, allowNull: true });
    }
    // Teachers
    const teacherTable = await queryInterface.describeTable('Teachers');
    if (!teacherTable.signature) {
      await queryInterface.addColumn('Teachers', 'signature', { type: Sequelize.TEXT, allowNull: true });
    }
    // Staff
    const staffTable = await queryInterface.describeTable('Staff');
    if (!staffTable.signature) {
      await queryInterface.addColumn('Staff', 'signature', { type: Sequelize.TEXT, allowNull: true });
    }
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('Users', 'signature');
    await queryInterface.removeColumn('Teachers', 'signature');
    await queryInterface.removeColumn('Staff', 'signature');
  }
};
