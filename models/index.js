'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
// if (config.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
//   sequelize = new Sequelize(config.database, config.username, config.password, config);
// }
sequelize = new Sequelize(config.database, config.username, config.password, config);

/**
 * Percorre um diretório e subdiretórios em busca de arquivos de models.
 * @param {string} dir O diretório a ser percorrido.
 * @param {Array<string>} files Array para acumular os caminhos dos arquivos encontrados.
 * @returns {Array<string>} Array contendo o caminho completo de todos os arquivos de models (.js).
 */
const getAllFiles = (dir, files = []) => {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllFiles(filePath, files);
    } else if (
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    ) {
      files.push(filePath);
    }
  });

  return files;
};

const modelFiles = getAllFiles(__dirname);

modelFiles.forEach(file => {
  console.log(file);
  const model = require(file)(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
});

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;