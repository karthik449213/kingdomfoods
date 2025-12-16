import dotenv from "dotenv";
// Load env vars FIRST
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboard.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import dishRoutes from "./routes/dishRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

const app = express();
const httpServer = createServer(app);

// WebSocket Configuration
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Make io globally accessible for event emissions
global.io = io;

// WebSocket event handlers
io.on("connection", (socket) => {
  console.log("✓ Client connected:", socket.id);

  // Join kitchen staff room
  socket.on("join_kitchen", (data) => {
    socket.join("kitchen_staff");
    console.log("Kitchen staff joined:", socket.id);
  });

  // Join delivery staff room
  socket.on("join_delivery", (staffId) => {
    socket.join(`delivery_${staffId}`);
    console.log("Delivery staff joined:", socket.id);
  });

  // Join admin dashboard room
  socket.on("join_dashboard", (adminId) => {
    socket.join("admin_dashboard");
    console.log("Admin joined dashboard:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

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
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

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
    httpServer.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ WebSocket server running on ws://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
