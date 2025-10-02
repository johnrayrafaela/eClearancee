const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const User = sequelize.define('User', {
  student_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  firstname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },  
  course: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  year_level: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  block: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  signature: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Electronic signature image (base64 or file path)'
  },
}, {
  timestamps: false
});

module.exports = User;
