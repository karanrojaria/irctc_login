const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('train_booking', 'username', 'password', {
  host: 'localhost',
  dialect: 'postgres'
});

module.exports = sequelize;
