import { SQSClient } from "@aws-sdk/client-sqs";
import 'dotenv/config';

export const sqsClient = new SQSClient({
  region: 'us-east-1', 
  credentials: { 
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, 
    sessionToken: process.env.AWS_SESSION_TOKEN 
  }
});