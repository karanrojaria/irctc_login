const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db');

const Train = sequelize.define('Train', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  source: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false
  },
  total_seats: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = Train;
