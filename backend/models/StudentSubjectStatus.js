const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const StudentSubjectStatus = sequelize.define('StudentSubjectStatus', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  subject_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'Pending' }, // Pending, Requested, Approved, Rejected
  // Optionally: request_date, response_date, remarks, etc.
});

module.exports = StudentSubjectStatus;