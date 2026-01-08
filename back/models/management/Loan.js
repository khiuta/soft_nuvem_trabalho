'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Loan extends Model {
    static associate(models) {
      this.belongsTo(models.Book, { foreignKey: 'book_id' });
      this.belongsTo(models.Student, { foreignKey: 'student_matricula' });
    }
  }

  Loan.init({
    loan_date: DataTypes.DATE,
    return_date: DataTypes.DATE,
    returned: DataTypes.BOOLEAN,
    pendent: DataTypes.BOOLEAN,
    book_name: DataTypes.STRING,
    student_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Loan',
    tableName: 'loans'
  });

  return Loan;
};