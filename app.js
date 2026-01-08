import express from "express";
import cors from "cors";
import { s3Client } from "./lib/s3Client.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import bookRoutes from "./routes/management/bookRoutes.js";
import studentRoutes from "./routes/student/studentRoutes.js";
import managerRoutes from "./routes/management/managerRoutes.js";
import loanRoutes from "./routes/management/loanRoutes.js";

const allowedOrigins = ["http://localhost:3000"];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests without origin (like mobile and Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        "A política de CORS para este site não permite acesso da Origem especificada.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
};

class App {
  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(cors(corsOptions));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use(express.static("public"));
  }

  routes() {
    this.app.get("/health", (req, res) => {
      return res.status(200).send("OK");
    });
    this.app.use("/book", bookRoutes);
    this.app.use("/student", studentRoutes);
    this.app.use("/manager", managerRoutes);
    this.app.use("/loan", loanRoutes);
    this.app.use("/minio", async (req, res) => {
      await s3Client
        .send(
          new PutObjectCommand({
            Bucket: "bibliotech-minio-storage",
            Key: "minio_test.txt",
            Body: "minio is working! :)",
            ContentType: "text/plain",
          }),
        )
        .then(res.status(200).json({ message: "file uploaded" }));
    });
  }
}

export default new App().app;
