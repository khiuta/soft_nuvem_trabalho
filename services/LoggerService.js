import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';

// Inicializa o cliente, usando as credenciais do .env 
const client = new DynamoDBClient({
  region: process.env.AWS_REGION, 
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const docClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.AWS_DYNAMODB_LOG_TABLE;

//Salva um log de ação no DynamoDB.
export const logAction = async (actionType, data) => {
  try {
    const command = new PutCommand({
      TableName: tableName,
      Item: {
        log_id: uuidv4(), 
        timestamp: new Date().toISOString(), 
        action_type: actionType, 
        data_manipulated: JSON.stringify(data) 
      }
    });

    await docClient.send(command);

  } catch (error) {
    console.error("ERRO AO GRAVAR LOG NO DYNAMODB:", error);
  }
};