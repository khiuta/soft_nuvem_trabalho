import db from '../../models'

import { DateTime, Settings } from 'luxon';
import { logAction } from '../../services/LoggerService.js';

const { Loan } = db;

class LoanController {
  // essa função é chamada depois de verificar se o aluno já existe no banco de dados
  async store(req, res){
    const { book_id, student_id } = req.body;

    try {
      Settings.defaultLocale = 'pt-BR';
      const loan_date = DateTime.now();
      const return_date = loan_date.plus({ days: 30 });

      const newLoan = await Loan.create({ loan_date, return_date, book_id, student_id, returned: false, pendent: false });

      await logAction('CREATE_LOAN', { id: newLoan.id, book_id: newLoan.book_id, student_id: newLoan.student_id });
      return res.status(200).json(newLoan);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: 'Ocorreu um erro no servidor',
        details: error.message
      });
    }
  }

  async index(req, res){
    try {
      const loans = await Loan.findAll();

      await logAction('READ_ALL_LOANS', { count: loans.length });
      return res.status(200).json(loans);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: 'Ocorreu um erro no servidor.',
        details: error.message
      });
    }
  }

  async update(req, res){
    const { id, loan_date, return_date, book_id, student_id } = req.body;

    try {
      const loanToUpdate = await Loan.findOne({
        where: {
          id,
        }
      });

      if(loanToUpdate) {
        // verifica se o dado foi enviado, se sim, atualiza, se não, continua o dado antigo
        loanToUpdate.loan_date = loan_date ? loan_date : loanToUpdate.loan_date;
        loanToUpdate.return_date = return_date ? return_date : loanToUpdate.return_date;
        loanToUpdate.book_id = book_id ? book_id : loanToUpdate.book_id;
        loanToUpdate.student_id = student_id ? student_id : loanToUpdate.student_id;

        const updatedLoan = await loanToUpdate.save();

        await logAction('UPDATE_LOAN', { id: updatedLoan.id });
        return res.status(200).json(updatedLoan);
      } else {
        return res.status(404).json({ message: 'Esse empréstimo não existe.' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: 'Ocorreu um erro no servidor.',
        details: error.message
      });
    }
  }
}

export default new LoanController();