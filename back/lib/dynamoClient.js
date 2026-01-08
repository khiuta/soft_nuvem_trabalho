import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import 'dotenv/config';

export const dynamoClient = new DynamoDBClient({
  region: 'us-east-1', 
  credentials: { 
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, 
    sessionToken: process.env.AWS_SESSION_TOKEN 
  }
});


