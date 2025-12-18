import express from "express";
import {
  createOrder,
  handlePhonePeCallback,
  handlePhonePeWebhook,
  getOrder,
  updateOrderStatus,
  getOrders
} from "../controllers/paymentController.js";
import verifyAdmin from "../middleware/adminAuth.js";

const router = express.Router();

// Order creation and payment
router.post("/orders", createOrder);
router.get("/orders/:orderId", getOrder);

// Admin routes
router.get("/orders", verifyAdmin, getOrders);
router.put("/orders/:orderId/status", verifyAdmin, updateOrderStatus);

// PhonePe payment callback and webhook
router.get("/phonepe/callback", handlePhonePeCallback);
router.post("/phonepe/webhook", handlePhonePeWebhook);

export default router;
