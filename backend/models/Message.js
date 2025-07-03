const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Message = sequelize.define('Message', {
  userMessage: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  botResponse: {
    type: DataTypes.TEXT,
    allowNull: false
  }
});

module.exports = Message;
