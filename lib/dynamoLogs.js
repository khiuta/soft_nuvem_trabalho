import { randomUUID } from "crypto";

class DynamoLogs {
  get_all_books(results){
    return {
      logId: randomUUID(),
      timestamp: new Date().toISOString(),
      actionType: "GET ALL BOOKS",
      resultCount: results
    }
  }
}

export default new DynamoLogs();