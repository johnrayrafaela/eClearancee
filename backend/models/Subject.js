const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Subject = sequelize.define('Subject', {
  subject_id: {
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
  course: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  year_level: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  semester: { // <-- Add this
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['1st', '2nd']]
    }
  },
  teacher_id: {
  type: DataTypes.INTEGER,
  allowNull: false,
  references: {
    model: 'teachers', // table name in lowercase
    key: 'teacher_id'
  }
}
});

module.exports = Subject;
