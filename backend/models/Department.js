const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Department = sequelize.define('Department', {
  department_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Pending', // Pending, Requested, Approved, Rejected
  },
  requirements: {
    type: DataTypes.STRING,
    allowNull: true,
    // You can use TEXT if requirements are long
  },
  staff_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Staffs', // Sequelize default pluralized table name
      key: 'staff_id',
    },
  },
});


module.exports = Department;

