import axios from "axios";

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || "https://graph.instagram.com/v18.0";
const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;

/**
 * Send WhatsApp template message
 */
export const sendWhatsAppMessage = async (toPhoneNumber, templateName, parameters = []) => {
  try {
    if (!WHATSAPP_API_TOKEN || !WHATSAPP_BUSINESS_ACCOUNT_ID) {
      console.warn("WhatsApp credentials not configured");
      return { success: false, message: "WhatsApp not configured" };
    }

    // Normalize phone number (remove +, add country code if needed)
    let phone = toPhoneNumber.replace(/\D/g, "");
    if (!phone.startsWith("91")) {
      phone = "91" + phone;
    }

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${WHATSAPP_BUSINESS_ACCOUNT_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: "en_US"
          },
          ...(parameters.length > 0 && {
            components: [
              {
                type: "body",
                parameters: parameters.map(param => ({
                  type: "text",
                  text: String(param)
                }))
              }
            ]
          })
        }
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    return {
      success: true,
      messageId: response.data?.messages?.[0]?.id,
      timestamp: new Date()
    };
  } catch (error) {
    console.error("WhatsApp message error:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.error?.message || error.message
    };
  }
};

/**
 * Send order confirmation to customer
 */
export const sendOrderConfirmationToCustomer = async (order) => {
  try {
    const itemsList = order.items
      .map(item => `${item.dishName} x${item.quantity}`)
      .join(", ");

    return await sendWhatsAppMessage(
      order.customerPhone,
      "order_confirmation",
      [
        order.orderId,
        itemsList,
        order.totalAmount.toString(),
        order.deliveryType
      ]
    );
  } catch (error) {
    console.error("Error sending customer notification:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Send order notification to kitchen staff
 */
export const sendOrderToKitchen = async (order, kitchenStaffPhones) => {
  try {
    const itemsList = order.items
      .map(item => `${item.dishName} (x${item.quantity})${item.specialInstructions ? ` - ${item.specialInstructions}` : ""}`)
      .join("\n");

    const results = [];
    for (const phone of kitchenStaffPhones) {
      const result = await sendWhatsAppMessage(
        phone,
        "new_order_kitchen",
        [
          order.orderId,
          itemsList,
          order.deliveryType
        ]
      );
      results.push(result);
    }

    return {
      success: results.every(r => r.success),
      results
    };
  } catch (error) {
    console.error("Error sending kitchen notification:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Send delivery assignment to delivery staff
 */
export const sendDeliveryAssignment = async (order, deliveryStaffPhone) => {
  try {
    return await sendWhatsAppMessage(
      deliveryStaffPhone,
      "delivery_assignment",
      [
        order.orderId,
        order.customerName,
        order.customerPhone,
        order.deliveryAddress
      ]
    );
  } catch (error) {
    console.error("Error sending delivery notification:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Send delivery completed message to customer
 */
export const sendDeliveryCompletedNotification = async (order) => {
  try {
    return await sendWhatsAppMessage(
      order.customerPhone,
      "delivery_completed",
      [
        order.orderId,
        order.totalAmount.toString()
      ]
    );
  } catch (error) {
    console.error("Error sending delivery notification:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Send order status update
 */
export const sendOrderStatusUpdate = async (customerPhone, orderId, status) => {
  try {
    const statusMessages = {
      CONFIRMED: "Order confirmed! Your food is being prepared.",
      PREPARING: "Your food is being prepared in our kitchen.",
      READY: "Your food is ready! Delivery staff is on the way.",
      OUT_FOR_DELIVERY: "Your order is out for delivery.",
      DELIVERED: "Your order has been delivered. Enjoy!",
      CANCELLED: "Your order has been cancelled. Contact support for details."
    };

    return await sendWhatsAppMessage(
      customerPhone,
      "order_status_update",
      [
        orderId,
        statusMessages[status] || status
      ]
    );
  } catch (error) {
    console.error("Error sending status update:", error);
    return { success: false, message: error.message };
  }
};

export default {
  sendWhatsAppMessage,
  sendOrderConfirmationToCustomer,
  sendOrderToKitchen,
  sendDeliveryAssignment,
  sendDeliveryCompletedNotification,
  sendOrderStatusUpdate
};
