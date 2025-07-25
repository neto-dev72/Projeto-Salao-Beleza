require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',  // trocar para postgres
    logging: false,
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false  // necessário para conexão com Render
      }
    }
  }
);

module.exports = sequelize;
