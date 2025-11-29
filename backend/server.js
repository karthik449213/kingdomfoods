import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import menuRoutes from "./routes/menu.js";
import dishRoutes from "./routes/dishRoutes.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/api/menu",menuRoutes);
app.use("/api",dishRoutes);

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
