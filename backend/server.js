import dotenv from "dotenv";
// Load env vars FIRST
dotenv.config();


import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboard.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import dishRoutes from "./routes/dishRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/api/categories", categoryRoutes);

app.use("/menu", dishRoutes);
app.use("/api/menu", menuRoutes);

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
