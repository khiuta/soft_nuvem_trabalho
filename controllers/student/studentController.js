import db from '../../models'
import { logAction } from '../../services/LoggerService.js';

const { Student } = db;

class StudentController{
  async store(req, res){
    const { matricula, full_name, course, period, can_borrow } = req.body;

    try {
      const newStudent = await Student.create({
        matricula, full_name, course, period, can_borrow
      });

      await logAction('CREATE_STUDENT', { id: newStudent.id, matricula: newStudent.matricula });
      return res.status(200).json(newStudent);
    } catch(error) {
      console.error(error);
      return res.status(500).json({
        error: 'Ocorreu um erro no servidor.',
        details: error.message
      });
    }
  }

  async indexOne(req, res) {
    const { id } = req.params;

    try {
      const student = await Student.findOne({
        where: {
          id,
        }
      });

      if(student){
        await logAction('READ_STUDENT', { id: student.id });
        return res.status(200).json(student);
      } else {
        return res.status(404).json({ message: 'Aluno não existe no banco de dados. '});
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: 'Ocorreu um erro no servidor.',
        details: error.message
      });
    }
  }

  async update(req, res) {
    const { id, matricula, full_name, course, period, can_borrow } = req.body;

    try {
      const studentToUpdate = await Student.findOne({
        where:{
          id,
        }
      });

      if(studentToUpdate){
        studentToUpdate.matricula = matricula ? matricula : studentToUpdate.matricula;
        studentToUpdate.full_name = full_name ? full_name : studentToUpdate.full_name;
        studentToUpdate.course = course ? course : studentToUpdate.course;
        studentToUpdate.period = period ? period : studentToUpdate.period;
        studentToUpdate.can_borrow = can_borrow ? can_borrow : studentToUpdate.can_borrow;

        const updatedStudent = await studentToUpdate.save();

        await logAction('UPDATE_STUDENT', { id: updatedStudent.id });
        return res.status(200).json(updatedStudent);
      } else {
        return res.status(404).json({ message: 'Aluno não encontrado.' });
      }
    } catch(error) {
      console.error(error);
      return res.status(500).json({
        error: 'Ocorreu um erro no servidor.',
        details: error.message
      });
    }
  }
}

export default new StudentController();