import db from '../../models/index.js'

import { DateTime, Settings } from 'luxon';

import { dynamoClient } from '../../lib/dynamoClient.js';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import dynamoLogs from '../../lib/dynamoLogs.js';

const { Loan, Book } = db;

class LoanController {
  // essa função é chamada depois de verificar se o aluno já existe no banco de dados
  async store(req, res){
    const { book_name, book_author, book_publisher, student_matricula, student_name } = req.body;

    try {
      Settings.defaultLocale = 'pt-BR';
      const loan_date = DateTime.now();
      const return_date = loan_date.plus({ days: 30 });

      const book = await Book.findOne({
        where: {
          title: book_name,
          author: book_author,
          publisher: book_publisher
        }
      })

      const book_id = book.id;
      const newLoan = await Loan.create({ loan_date, return_date, book_id, student_matricula, returned: false, pendent: false, book_name, student_name });

      const logData = { book_id, student_matricula, loan_date: loan_date.toISO(), return_date: return_date.toISO(), returned: false, pendent: false, book_name, student_name }

      const item = dynamoLogs.create_loan(logData, true);

      const command = new PutItemCommand({
        TableName: "api-logs",
        Item: marshall(item, { removeUndefinedValues: true })
      });

      await dynamoClient.send(command);
      console.log("Log saved to DynamoDB.");

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

      if(loans.length > 0){
        const item = dynamoLogs.get_all_loans(loans.length, true);

        const command = new PutItemCommand({
          TableName: "api-logs",
          Item: marshall(item, { removeUndefinedValues: true })
        });

        await dynamoClient.send(command);
        console.log("Log saved to DynamoDB.");

        return res.status(200).json(loans);
      } else {
        const item = dynamoLogs.get_all_loans(0, false);

        const command = new PutItemCommand({
          TableName: "api-logs",
          Item: marshall(item, { removeUndefinedValues: true })
        });

        await dynamoClient.send(command);
        console.log("Log saved to DynamoDB.");

        return res.status(200).json("Nenhum empréstimo cadastrado.");
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: 'Ocorreu um erro no servidor.',
        details: error.message
      });
    }
  }

  async update(req, res){
    const { id, loan_date, return_date, book_id, student_matricula } = req.body;

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
        loanToUpdate.student_matricula = student_matricula ? student_matricula : loanToUpdate.student_matricula;

        const updatedLoan = await loanToUpdate.save();

        const item = dynamoLogs.update_loan(id, true);

        const command = new PutItemCommand({
          TableName: "api-logs",
          Item: marshall(item, { removeUndefinedValues: true })
        });

        await dynamoClient.send(command);
        console.log("Log saved to DynamoDB.");

        return res.status(200).json(updatedLoan);
      } else {
        const item = dynamoLogs.update_loan(id, false);

        const command = new PutItemCommand({
          TableName: "api-logs",
          Item: marshall(item, { removeUndefinedValues: true })
        });

        await dynamoClient.send(command);
        console.log("Log saved to DynamoDB.");

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

  async devolution(req, res){
    const { id } = req.params;

    try {
      const loanToReturn = await Loan.findOne({
        where: {
          id,
        }
      });

      if(loanToReturn.returned == false) loanToReturn.returned = true;
      else return res.status(400).json({ message: 'Esse empréstimo já foi retornado.' });

      const loanUpdated = await loanToReturn.save();

      return res.status(200).json({ loanUpdated });
    } catch (error){
      console.error(error);
      return res.status(500).json({
        error: 'Ocorreu um erro no servidor.',
        details: error.message
      });
    }
  }
}

export default new LoanController();