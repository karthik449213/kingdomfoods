import axios from 'axios';
import Order from '../models/Order.js';

// Send WhatsApp template message via Twilio
export const sendWhatsAppOrderNotification = async (phone, orderId, orderData) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM; // e.g., whatsapp:+14155552671
    
    if (!accountSid || !authToken || !whatsappFrom) {
      console.warn('⚠ WhatsApp credentials not configured');
      return false;
    }

    // Format phone number for WhatsApp (ensure it starts with whatsapp:+)
    const phoneFormatted = `whatsapp:+${phone.replace(/\D/g, '')}`;

    // Prepare message content
    const itemsList = orderData.items
      .map(item => `• ${item.dishName} x${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}`)
      .join('\n');

    const messageBody = `🎉 *Order Confirmation*\n\n` +
      `Order ID: ${orderId}\n` +
      `Customer: ${orderData.customerName}\n\n` +
      `📦 Items:\n${itemsList}\n\n` +
      `💰 Total: ₹${orderData.totalAmount.toFixed(2)}\n` +
      `📍 Type: ${orderData.deliveryType === 'DELIVERY' ? 'Delivery' : 'Dine In'}\n\n` +
      `Thank you for your order! We'll start preparing it shortly.`;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const response = await axios.post(
      url,
      new URLSearchParams({
        From: whatsappFrom,
        To: phoneFormatted,
        Body: messageBody
      }),
      {
        auth: {
          username: accountSid,
          password: authToken
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('✓ WhatsApp notification sent:', response.data.sid);
    
    // Update order with notification status
    await Order.findByIdAndUpdate(
      orderData._id,
      {
        whatsappNotificationSent: true,
        whatsappNotificationTimestamp: new Date()
      }
    );

    return true;
  } catch (error) {
    console.error('✗ WhatsApp notification error:', error.response?.data || error.message);
    return false;
  }
};

// Alternative: Send via Twilio API using messaging service
export const sendWhatsAppUsingTemplate = async (phone, orderId, orderData) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;
    const templateName = process.env.WHATSAPP_TEMPLATE_ORDER_CONFIRMATION || 'order_confirmation';

    if (!accountSid || !authToken || !whatsappFrom) {
      console.warn('⚠ WhatsApp credentials not configured');
      return false;
    }

    const phoneFormatted = `whatsapp:+${phone.replace(/\D/g, '')}`;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    // Prepare template variables
    const itemsList = orderData.items
      .map(item => `${item.dishName} (x${item.quantity})`)
      .join(', ');

    const response = await axios.post(
      url,
      new URLSearchParams({
        From: whatsappFrom,
        To: phoneFormatted,
        ContentSid: templateName, // Use pre-approved template
        ContentVariables: JSON.stringify({
          1: orderId,
          2: orderData.customerName,
          3: itemsList,
          4: `₹${orderData.totalAmount.toFixed(2)}`
        })
      }),
      {
        auth: {
          username: accountSid,
          password: authToken
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('✓ WhatsApp template sent:', response.data.sid);

    // Update order
    if (orderData._id) {
      await Order.findByIdAndUpdate(
        orderData._id,
        {
          whatsappNotificationSent: true,
          whatsappNotificationTimestamp: new Date()
        }
      );
    }

    return true;
  } catch (error) {
    console.error('✗ WhatsApp template error:', error.response?.data || error.message);
    return false;
  }
};
