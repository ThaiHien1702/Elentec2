require('dotenv').config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const app = express();

// Middleware to handle CORS
app.use(
    cors({
        origin: "*", // Allow all origins (you can specify your frontend URL here)
        methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
        allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    })
);
// connect to database
connectDB();

// Middleware 
app.use(express.json());

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {console.log(`Server is running on port ${PORT}`)});