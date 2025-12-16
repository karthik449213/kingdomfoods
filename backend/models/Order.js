import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    transactionId: { type: String, unique: true, sparse: true },
    method: { type: String, enum: ["PHONEPE", "COD"], default: "COD" },
    status: { 
      type: String, 
      enum: ["PENDING", "SUCCESS", "FAILED"], 
      default: "PENDING" 
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    requestId: { type: String }, // PhonePe request ID for webhook matching
    merchantId: { type: String },
    timestamp: { type: Date, default: Date.now }
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    // Order basic info
    orderId: { type: String, unique: true, required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String, default: null },
    
    // Order items
    items: [
      {
        dishId: { type: mongoose.Schema.Types.ObjectId, ref: "Dish" },
        dishName: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        specialInstructions: { type: String, default: "" }
      }
    ],
    
    // Delivery info
    deliveryAddress: { type: String, required: true },
    deliveryType: { 
      type: String, 
      enum: ["DELIVERY", "DINE_IN"], 
      default: "DELIVERY" 
    },
    deliveryStaffId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
    
    // Pricing
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    
    // Payment
    payment: PaymentSchema,
    
    // Order status tracking
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
      default: "PENDING"
    },
    
    // Status history for tracking
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        notes: String
      }
    ],
    
    // Notifications tracking
    notifications: {
      whatsappSentToCustomer: { type: Boolean, default: false },
      whatsappSentToKitchen: { type: Boolean, default: false },
      whatsappSentToDelivery: { type: Boolean, default: false },
      soundAlertTriggered: { type: Boolean, default: false },
      lastNotificationTime: { type: Date }
    },
    
    // Additional info
    specialNotes: { type: String, default: "" },
    estimatedDeliveryTime: { type: Date },
    actualDeliveryTime: { type: Date },
    rating: { type: Number, min: 1, max: 5, default: null },
    feedback: { type: String, default: "" }
  },
  { 
    timestamps: true,
    indexes: [
      { orderId: 1 },
      { customerPhone: 1, createdAt: -1 },
      { status: 1, createdAt: -1 },
      { "payment.transactionId": 1 },
      { createdAt: -1 }
    ]
  }
);

// Add index for payment transaction ID
OrderSchema.index({ "payment.transactionId": 1 });

// Middleware to add status history
OrderSchema.pre("save", function(next) {
  if (this.isModified("status")) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  next();
});

const Order = mongoose.model("Order", OrderSchema);
export default Order;
