const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Clearance = sequelize.define('Clearance', {
  clearance_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'Pending' },
  // Add more fields as needed (date, remarks, etc.)
});

module.exports = Clearance;