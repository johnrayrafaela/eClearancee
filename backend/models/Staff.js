const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Staff = sequelize.define('Staff', {
  staff_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
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
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  signature: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Electronic signature image (base64 or file path)'
  },
});


module.exports = Staff;