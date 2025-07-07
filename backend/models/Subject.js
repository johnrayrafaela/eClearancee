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
});

module.exports = Subject;