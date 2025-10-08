const { DataTypes } = require('sequelize');
// Use the centralized sequelize instance (previous path was wrong and prevented table creation)
const sequelize = require('../config/config');

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
