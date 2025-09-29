const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const StudentSubjectStatus = sequelize.define('StudentSubjectStatus', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  subject_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'Pending' }, // Pending, Requested, Approved, Rejected
  requirements: { type: DataTypes.TEXT },
  file_path: { type: DataTypes.STRING },
  file_paths: { type: DataTypes.TEXT }, // Comma-separated list of files for multiple upload
  checklist: { type: DataTypes.TEXT, allowNull: true }, // JSON stringified array of booleans
  semester: { type: DataTypes.STRING, allowNull: true },
  link: { type: DataTypes.TEXT, allowNull: true },
  remarks: { type: DataTypes.TEXT, allowNull: true }, // teacher feedback on rejection
  // Optionally: request_date, response_date, remarks, etc.
});

module.exports = StudentSubjectStatus;