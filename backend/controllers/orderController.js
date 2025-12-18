import { v4 as uuidv4 } from 'uuid';
import Order from '../models/Order.js';
import { sendWhatsAppOrderNotification } from './whatsappController.js';

// Create new order
export const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      items,
      deliveryAddress,
      deliveryType,
      subtotal,
      tax,
      deliveryCharge,
      discount,
      totalAmount,
      specialNotes
    } = req.body;

    // Validate required fields
    if (!customerName || !customerPhone || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Generate unique order ID
    const orderId = `ORD-${Date.now()}-${uuidv4().split('-')[0].toUpperCase()}`;

    // Create order
    const order = new Order({
      orderId,
      customerName,
      customerPhone,
      customerEmail,
      items,
      deliveryAddress,
      deliveryType,
      subtotal,
      tax,
      deliveryCharge,
      discount,
      totalAmount,
      specialNotes,
      status: 'PENDING',
      paymentStatus: 'COMPLETED' // Direct to COD (no payment processing)
    });

    // Save order to database
    const savedOrder = await order.save();

    // Send WhatsApp notification
    try {
      await sendWhatsAppOrderNotification(customerPhone, orderId, {
        _id: savedOrder._id,
        customerName,
        items,
        deliveryType,
        totalAmount
      });
    } catch (whatsappError) {
      console.error('WhatsApp notification failed:', whatsappError.message);
      // Don't fail the order creation if WhatsApp fails
    }

    // Emit real-time event to kitchen staff via WebSocket
    if (global.io) {
      global.io.to('kitchen_staff').emit('new_order', {
        orderId,
        customerName,
        items,
        deliveryType,
        deliveryAddress,
        specialNotes,
        timestamp: new Date()
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      orderId: orderId,
      data: savedOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

// Get all orders (for admin)
export const getAllOrders = async (req, res) => {
  try {
    const { status, limit = 50, skip = 0 } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Order.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: orders,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findOneAndUpdate(
      { orderId },
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Emit real-time update via WebSocket
    if (global.io) {
      global.io.to('admin_dashboard').emit('order_status_updated', {
        orderId,
        status,
        timestamp: new Date()
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Order status updated',
      data: order
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: error.message
    });
  }
};

// Get order stats (for admin dashboard)
export const getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        statusBreakdown: stats
      }
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order stats',
      error: error.message
    });
  }
};
