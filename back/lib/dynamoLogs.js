import { randomInt, randomUUID } from "crypto";

class DynamoLogs {
  get_all_books(results, status){
    return {
      logId: randomUUID(),
      timestamp: new Date().toISOString(),
      actionType: "GET_ALL_BOOKS",
      resultCount: results,
      status: status ? "FOUND" : "NOT_FOUND"
    }
  }

  get_book(id, status){
    return {
      logId: randomUUID(),
      timestamp: new Date().toISOString(),
      actionType: "GET_BOOK",
      bookId: id,
      status: status ? "FOUND" : "NOT_FOUND"
    }
  }

  create_book(book, status){
    return {
      logId: randomUUID(),
      timestamp: new Date().toISOString(),
      actionType: "CREATE_BOOK",
      dataHandled: book,
      status: status ? "BOOK_CREATED" : "NOT_CREATED"
    }
  }

  update_book(id, status){
    return {
      logId: randomUUID(),
      timestamp: new Date().toISOString(),
      actionType: "UPDATE_BOOK",
      bookId: id,
      status: status ? "BOOK_UPDATED" : "NOT_UPDATED"
    }
  }

  create_loan(loan, status) {
    return {
      logId: randomUUID(),
      timestamp: new Date().toISOString(),
      actionType: "CREATE_LOAN",
      dataHandled: loan,
      status: status ? "LOAN_CREATED" : "NOT_CREATED"
    }
  }

  get_all_loans(results, status) {
    return {
      logId: randomUUID(),
      timestamp: new Date().toISOString(),
      actionType: "GET_ALL_LOANS",
      resultCount: results,
      status: status ? "FOUND" : "NOT_FOUND"
    }
  }

  get_loan(id, status) {
    return {
      logId: randomUUID(),
      timestamp: new Date().toISOString(),
      actionType: "GET_LOAN",
      loanId: id,
      status: status ? "FOUND" : "NOT_FOUND"
    }
  }

  update_loan(id, status) {
    return {
      logId: randomUUID(),
      timestamp: new Date().toISOString(),
      actionType: "UPDATE_LOAN",
      loanId: id,
      status: status ? "LOAN_UPDATED" : "NOT_UPDATED"
    }
  }
}

export default new DynamoLogs();