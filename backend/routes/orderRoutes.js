import express from 'express';
import {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getOrderStats
} from '../controllers/orderController.js';

const router = express.Router();

// POST /api/orders - Create new order
router.post('/', createOrder);

// GET /api/orders/:orderId - Get order details
router.get('/:orderId', getOrderById);

// GET /api/orders - Get all orders (admin)
router.get('/', getAllOrders);

// PATCH /api/orders/:orderId/status - Update order status
router.patch('/:orderId/status', updateOrderStatus);

// GET /api/orders/stats/dashboard - Get order statistics
router.get('/stats/dashboard', getOrderStats);

export default router;
