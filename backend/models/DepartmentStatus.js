const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const Department = require('./Department');
const User = require('./User');

const DepartmentStatus = sequelize.define('DepartmentStatus', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'student_id',
    },
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Departments',
      key: 'department_id',
    },
  },
  semester: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Pending', // Pending, Requested, Approved, Rejected
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  requirements: {
    type: DataTypes.STRING,
    allowNull: true,
    // You can store a comma-separated string, or use TEXT if requirements are long
  },
});






module.exports = DepartmentStatus;
