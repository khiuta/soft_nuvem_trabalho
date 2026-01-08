import { S3Client } from "@aws-sdk/client-s3";
import 'dotenv/config'; 

const s3Config = {
  region: 'us-east-1',
};

// if S3 ENDPOINT exists, then it uses minio
if (process.env.S3_ENDPOINT) {
  console.log("--> Using MinIO for Object Storage");
  
  s3Config.endpoint = process.env.S3_ENDPOINT;
  s3Config.forcePathStyle = true; // required for minio (uses http://host/bucket style)
  
  s3Config.credentials = {
    accessKeyId: process.env.MINIO_ACCESS_KEY, 
    secretAccessKey: process.env.MINIO_SECRET_KEY
  };
} else {
  console.log("--> Using AWS S3 for Object Storage");
  
  if (process.env.AWS_SESSION_TOKEN) {
    s3Config.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN
    }
  }
}

export const s3Client = new S3Client(s3Config);