import express from "express";
import { dbConnection } from "./database/dbConnection.js";
 import { config } from "dotenv";
 import cookieParser from "cookie-parser";
 import cors from "cors";
  import fileUpload from "express-fileupload";
import { errorMiddleware } from "./middlewares/error.js";
 import messageRouter from "./router/messageRouter.js";
 import userRouter from "./router/userRouter.js";
import appointmentRouter from "./router/appointmentRouter.js";
import serverless from 'serverless-http'; 


 config({ path: "./config/config.env" });
const app = express();

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, process.env.DASHBOARD_URL],
    method: ["GET", "POST", "PUT", "DELETE" , "OPTIONS"],
    credentials: true,
       allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);

 app.use(cookieParser());
 app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(
  fileUpload({
    useTempFiles: true, 
    tempFileDir: "/tmp/",
    limits: { fileSize: 50 * 1024 * 1024 } 
  })
);
 app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);
 app.use("/api/v1/appointment", appointmentRouter);
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Database connection with retry logic
const connectWithRetry = async () => {
  try {
    await dbConnection();
    console.log('Database connected successfully');
  } catch (err) {
    console.error('Database connection failed, retrying in 5 seconds...', err);
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();



 app.use(errorMiddleware);
export const handler = serverless(app);
export default app;
