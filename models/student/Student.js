'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Student extends Model {
    static associate(models) {
      this.hasMany(models.Loan, { foreignKey: 'student_matricula' });
    }
  }

  Student.init({
    matricula: DataTypes.INTEGER,
    full_name: DataTypes.TEXT,
    course: DataTypes.STRING,
    period: DataTypes.INTEGER,
    can_borrow: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Student',
    tableName: 'students',
  });

  return Student;
};