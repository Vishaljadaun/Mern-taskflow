// ------------------------------
// server.js (Entry Point of Backend)
// ------------------------------

// Importing Express (like ASP.NET controllers routing)
const express = require("express");

// To read environment variables from .env file
const dotenv = require("dotenv");

// To allow frontend (React) to call backend (API)
const cors = require("cors");

// MongoDB connection function (we will create next)
const connectDB = require("./src/config/db");

// Create Express app
const app = express();

// Load environment variables
dotenv.config();

// Middleware to parse JSON body (like app.UseJson in .NET)
app.use(express.json());

// Enable CORS for frontend
app.use(cors());

const authRoutes = require("./src/routes/authRoutes");
app.use("/api/auth", authRoutes);

const protectedRoutes = require("./src/routes/protectedRoutes");
app.use("/api/protected", protectedRoutes);
// ------------------------------
// Connect MongoDB
// ------------------------------
connectDB();  // This will call our db.js file soon

// ------------------------------
// Basic Test Route
// ------------------------------
app.get("/", (req, res) => {
    res.send("MERN TaskFlow API is running 🚀");
});

// ------------------------------
// Start the Server
// ------------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
