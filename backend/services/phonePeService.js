import axios from "axios";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

const PHONEPE_HOST_URL = process.env.PHONEPE_ENV === "production"
  ? "https://api.phonepe.com/apis/hermes"
  : "https://mercury-uat.phonepe.com/apis/hermes";

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const SALT_KEY = process.env.PHONEPE_SALT_KEY;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";

/**
 * Generate PhonePe API checksum
 */
const generateChecksum = (payload) => {
  const payloadString = JSON.stringify(payload);
  const payloadBase64 = Buffer.from(payloadString).toString("base64");
  
  const hashString = payloadBase64 + "/pg/v1/pay" + SALT_KEY;
  const hash = crypto.createHash("sha256").update(hashString).digest("hex");
  
  return {
    payload: payloadBase64,
    checksum: `${hash}###${SALT_INDEX}`
  };
};

/**
 * Verify PhonePe webhook signature
 */
const verifyWebhookSignature = (response, signature) => {
  const hashString = response + SALT_KEY;
  const hash = crypto.createHash("sha256").update(hashString).digest("hex");
  const expectedSignature = `${hash}###${SALT_INDEX}`;
  
  return signature === expectedSignature;
};

/**
 * Initiate PhonePe payment
 */
export const initiatePhonePePayment = async (order) => {
  try {
    const requestId = `ORDER_${order._id}_${Date.now()}`;
    const redirectUrl = `${process.env.BACKEND_URL}/api/payments/phonepe/callback`;
    
    const payload = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: requestId,
      merchantUserId: order.customerPhone,
      amount: Math.round(order.totalAmount * 100), // Convert to paise
      redirectUrl: redirectUrl,
      callbackUrl: `${process.env.BACKEND_URL}/api/payments/phonepe/webhook`,
      mobileNumber: order.customerPhone,
      paymentInstrument: {
        type: "NETBANKING" // Can be extended to support other methods
      }
    };

    const { payload: encodedPayload, checksum } = generateChecksum(payload);

    const response = await axios.post(
      `${PHONEPE_HOST_URL}/pg/v1/pay`,
      {
        request: encodedPayload
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum
        }
      }
    );

    if (response.data?.success) {
      return {
        success: true,
        requestId,
        transactionId: response.data?.data?.transactionId,
        redirectUrl: response.data?.data?.redirectUrl || 
                     `${PHONEPE_HOST_URL}${response.data?.data?.instrumentResponse?.redirectInfo?.url}`,
        message: "Payment initiated successfully"
      };
    } else {
      return {
        success: false,
        message: response.data?.message || "Failed to initiate payment"
      };
    }
  } catch (error) {
    console.error("PhonePe initiation error:", error);
    return {
      success: false,
      message: error.message || "Payment initiation failed"
    };
  }
};

/**
 * Verify payment status with PhonePe
 */
export const verifyPhonePePayment = async (merchantTransactionId) => {
  try {
    const hashString = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}${SALT_KEY}`;
    const hash = crypto.createHash("sha256").update(hashString).digest("hex");
    const checksum = `${hash}###${SALT_INDEX}`;

    const response = await axios.get(
      `${PHONEPE_HOST_URL}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          "X-MERCHANT-ID": MERCHANT_ID
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error("PhonePe verification error:", error);
    return {
      success: false,
      message: error.message || "Payment verification failed"
    };
  }
};

/**
 * Validate incoming webhook
 */
export const validatePhonePeWebhook = (body, signature) => {
  try {
    const responseString = JSON.stringify(body);
    return verifyWebhookSignature(responseString, signature);
  } catch (error) {
    console.error("Webhook validation error:", error);
    return false;
  }
};

export default {
  initiatePhonePePayment,
  verifyPhonePePayment,
  validatePhonePeWebhook,
  generateChecksum,
  verifyWebhookSignature
};
