'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    static associate(models) {
      this.hasMany(models.Loan, { foreignKey: 'book_id' });
    }
  }

  Book.init({
    title: DataTypes.TEXT,
    author: DataTypes.STRING,
    publisher: DataTypes.STRING,
    edition: DataTypes.STRING,
    release_year: DataTypes.INTEGER,
    image_path: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    available: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Book',
    tableName: 'books'
  });

  return Book;
};