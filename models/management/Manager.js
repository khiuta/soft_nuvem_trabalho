'use strict';
const { Model } = require('sequelize');
const bcryptjs = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class Manager extends Model {
    static associate(models) {
    }
  }

  Manager.init({
    full_name: DataTypes.TEXT,
    username: DataTypes.STRING,
    password: DataTypes.VIRTUAL,
    password_hash: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Manager',
    tableName: 'managers',
  });

  Manager.addHook('beforeSave', async (user) => {
    if (user.password) {
      user.password_hash = await bcryptjs.hash(user.password, 8);
    }
  });

  return Manager;
};