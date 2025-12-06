import dotenv from "dotenv";
// Load env vars FIRST
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboard.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import dishRoutes from "./routes/dishRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";

const app = express();

// Middleware
// Restrict CORS in production; allow all in development for convenience
const corsOptions = process.env.NODE_ENV === 'production'
  ? { origin: process.env.FRONTEND_ORIGIN || 'https://your-production-domain.com' }
  : {};
app.use(cors(corsOptions));
app.use(helmet());
app.use(compression()); // PERFORMANCE: Compress all responses (70% smaller)
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/api/categories", categoryRoutes);

app.use("/menu", dishRoutes);
app.use("/api/menu", menuRoutes);

// Test Route
app.get("/", (req, res) => {
  res.json("API is running...");
});

// Global error handler to surface unexpected errors during request processing
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: err && err.message ? err.message : 'Internal Server Error', error: {} });
});

// Server Start - IMPROVED: Ensure DB connects before starting server
const startServer = async () => {
  try {
    await connectDB();
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
