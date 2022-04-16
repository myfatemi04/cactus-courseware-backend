import express, { Express, Request, Response } from 'express';
import router from './routes/router'
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8000;

app.use(router)

const main = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_URI!)
    console.log('⚡️ Connected to database.')
  } catch {
    console.log(`❌ Failed to connect to database. Aborted`)
    return;
  }

  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
}

main();

