const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db');

const Booking = sequelize.define('Booking', {
  seats_booked: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = Booking;
