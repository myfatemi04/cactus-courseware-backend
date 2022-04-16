import express, { Express, Request, Response } from "express";
import router from "./routes/router";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(router);

const main = async () => {
  console.log("Connecting...");
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_URI!);
    console.log("⚡️ Connected to database.");
  } catch (e) {
    console.log(`❌ Failed to connect to database. Aborted`);
    console.log(e);
    return;
  }

  app.listen(port, () => {
    console.log(`⚡️ [server]: Server is running at http://localhost:${port}`);
  });
};

main();
