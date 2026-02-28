import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./libs/db.js";
import authRoute from "./routes/authRoute.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

//middleware
app.use(express.json());

//public route
app.use("/api/auth", authRoute);

// primary route

// connect to database and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
