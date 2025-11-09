import db from '../../models'

const { Student } = db;

class StudentController{
  async store(req, res){
    const { matricula, full_name, course, period, can_borrow } = req.body;

    try {
      const newStudent = await Student.create({
        matricula, full_name, course, period, can_borrow
      });

      return res.status(200).json(newStudent);
    } catch(error) {
      console.error(error);
      return res.status(500).json({
        error: 'Ocorreu um erro no servidor.',
        details: error.message
      });
    }
  }

  async index(req, res) {
    try {
      const students = await Student.findAll();

      if(students.length > 0){
        return res.status(200).json(students);
      } else {
        return res.status(404).json({ message: "Nenhum aluno cadastrado." });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Ocorreu um erro no servidor.",
        details: error.message
      });
    }
  }

  async show(req, res) {
    const { matricula } = req.params;

    try {
      const student = await Student.findOne({
        where: {
          matricula,
        }
      });

      if(student){
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