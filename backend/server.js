const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const menuRoutes = require("./routes/menu");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/api/menu",menuRoutes);

// Connect Database
connectDB();

// Test Route
app.get("/", (req, res) => {
  res.json("API is running...");
});

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
