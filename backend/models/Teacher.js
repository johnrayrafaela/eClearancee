const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Teacher = sequelize.define('Teacher', {
  teacher_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  firstname: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  lastname: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  signature: {
    // Store a base64 data URL or a file path reference
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Electronic signature image (base64 or file path)'
  },
  
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'teachers',
  timestamps: false,
});

module.exports = Teacher;
