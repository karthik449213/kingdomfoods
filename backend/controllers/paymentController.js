import Order from "../models/Order.js";
import { v4 as uuidv4 } from "uuid";
import {
  initiatePhonePePayment,
  verifyPhonePePayment,
  validatePhonePeWebhook
} from "../services/phonePeService.js";
import {
  sendOrderConfirmationToCustomer,
  sendOrderToKitchen,
  sendDeliveryAssignment,
  sendOrderStatusUpdate
} from "../services/whatsAppService.js";
import { updateDailyAnalytics } from "../services/analyticsService.js";

/**
 * Create order and initiate payment
 */
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
      specialNotes,
      paymentMethod = "COD"
    } = req.body;

    // Validate required fields
    if (!customerName || !customerPhone || !items?.length || !deliveryAddress || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Create order object
    const orderId = `ORD_${Date.now()}_${uuidv4().substring(0, 8)}`;
    const orderData = {
      orderId,
      customerName,
      customerPhone,
      customerEmail,
      items,
      deliveryAddress,
      deliveryType: deliveryType || "DELIVERY",
      subtotal,
      tax: tax || 0,
      deliveryCharge: deliveryCharge || 0,
      discount: discount || 0,
      totalAmount,
      specialNotes,
      status: "PENDING",
      payment: {
        method: paymentMethod,
        status: "PENDING",
        amount: totalAmount,
        currency: "INR"
      }
    };

    // Save order to database
    const order = new Order(orderData);
    await order.save();

    // If payment method is PhonePe, initiate payment
    if (paymentMethod === "PHONEPE") {
      const phonePeResponse = await initiatePhonePePayment(order);
      
      if (!phonePeResponse.success) {
        return res.status(400).json({
          success: false,
          message: phonePeResponse.message
        });
      }

      // Store PhonePe request ID in order
      order.payment.requestId = phonePeResponse.requestId;
      order.payment.transactionId = phonePeResponse.transactionId;
      await order.save();

      return res.status(200).json({
        success: true,
        orderId: order._id,
        orderNumber: order.orderId,
        paymentUrl: phonePeResponse.redirectUrl,
        message: "Proceed to payment"
      });
    }

    // For COD or other methods
    return res.status(201).json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderId,
      message: "Order created successfully. Proceed with payment."
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Handle PhonePe payment callback
 */
export const handlePhonePeCallback = async (req, res) => {
  try {
    const { merchantTransactionId, status } = req.query;

    if (!merchantTransactionId) {
      return res.status(400).json({
        success: false,
        message: "Missing transaction ID"
      });
    }

    // Verify payment status with PhonePe
    const verification = await verifyPhonePePayment(merchantTransactionId);

    if (!verification.success) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/checkout?status=failed&message=Payment verification failed`
      );
    }

    // Find order by request ID
    const order = await Order.findOne({
      "payment.requestId": merchantTransactionId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Update payment status
    const paymentStatus = verification.data?.state === "COMPLETED" ? "SUCCESS" : "FAILED";
    order.payment.status = paymentStatus;
    order.payment.transactionId = verification.data?.transactionId;

    if (paymentStatus === "SUCCESS") {
      // Order confirmed
      order.status = "CONFIRMED";
      order.statusHistory.push({
        status: "CONFIRMED",
        timestamp: new Date(),
        notes: "Payment confirmed via PhonePe"
      });

      await order.save();

      // Send WhatsApp notifications
      const kitchenPhones = process.env.KITCHEN_STAFF_PHONES?.split(",") || [];
      if (kitchenPhones.length > 0) {
        await sendOrderToKitchen(order, kitchenPhones);
        order.notifications.whatsappSentToKitchen = true;
      }

      await sendOrderConfirmationToCustomer(order);
      order.notifications.whatsappSentToCustomer = true;

      // Update analytics
      await updateDailyAnalytics(order._id);

      await order.save();

      // Emit real-time event via Socket.io (will be implemented)
      if (global.io) {
        global.io.emit("new_order", {
          orderId: order.orderId,
          customerName: order.customerName,
          items: order.items,
          totalAmount: order.totalAmount,
          status: order.status
        });
      }
    } else {
      order.status = "CANCELLED";
    }

    await order.save();

    // Redirect to success/failure page
    const redirectUrl = paymentStatus === "SUCCESS"
      ? `${process.env.FRONTEND_URL}/checkout?status=success&orderId=${order.orderId}`
      : `${process.env.FRONTEND_URL}/checkout?status=failed&message=Payment failed`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error("PhonePe callback error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/checkout?status=error&message=${encodeURIComponent(error.message)}`);
  }
};

/**
 * Handle PhonePe webhook
 */
export const handlePhonePeWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-verify"];
    
    // Validate webhook signature
    if (!validatePhonePeWebhook(req.body, signature)) {
      console.warn("Invalid webhook signature");
      return res.status(401).json({
        success: false,
        message: "Invalid signature"
      });
    }

    const { data } = req.body;
    if (!data) {
      return res.status(400).json({
        success: false,
        message: "Missing data"
      });
    }

    const merchantTransactionId = data.merchantTransactionId;
    const paymentState = data.state;

    // Find order
    const order = await Order.findOne({
      "payment.requestId": merchantTransactionId
    });

    if (!order) {
      console.warn(`Order not found for transaction: ${merchantTransactionId}`);
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Update payment status
    if (paymentState === "COMPLETED") {
      order.payment.status = "SUCCESS";
      order.status = "CONFIRMED";
      order.statusHistory.push({
        status: "CONFIRMED",
        timestamp: new Date(),
        notes: "Payment confirmed via webhook"
      });
    } else {
      order.payment.status = "FAILED";
      order.status = "CANCELLED";
    }

    await order.save();

    // Send notifications if successful
    if (paymentState === "COMPLETED") {
      const kitchenPhones = process.env.KITCHEN_STAFF_PHONES?.split(",") || [];
      if (kitchenPhones.length > 0) {
        await sendOrderToKitchen(order, kitchenPhones);
      }
      await sendOrderConfirmationToCustomer(order);
      await updateDailyAnalytics(order._id);

      // Emit real-time event
      if (global.io) {
        global.io.emit("new_order", {
          orderId: order.orderId,
          customerName: order.customerName,
          items: order.items,
          totalAmount: order.totalAmount,
          status: order.status
        });
      }
    }

    res.json({
      success: true,
      message: "Webhook processed"
    });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get order details
 */
export const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate("items.dishId");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status,
        $push: {
          "statusHistory": {
            status,
            timestamp: new Date(),
            notes
          }
        }
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Send status update notification
    await sendOrderStatusUpdate(order.customerPhone, order.orderId, status);

    // Emit real-time event
    if (global.io) {
      global.io.emit("order_status_updated", {
        orderId: order.orderId,
        status: order.status,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get orders for admin dashboard
 */
export const getOrders = async (req, res) => {
  try {
    const { status, limit = 50, skip = 0 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate("items.dishId");

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  createOrder,
  handlePhonePeCallback,
  handlePhonePeWebhook,
  getOrder,
  updateOrderStatus,
  getOrders
};
