require('dotenv').config();

module.exports = {
  development: {
    username: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    host: process.env.HOST,
    port: process.env.PORT,
    dialect: 'postgres',
    define: {
      timestamps: true,
      underscored: true,
      underscoredAll: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    dialectOptions: {
      timezone: 'America/Sao_Paulo',
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    timezone: 'America/Sao_Paulo'
  }
};