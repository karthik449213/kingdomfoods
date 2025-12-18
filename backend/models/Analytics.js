import mongoose from "mongoose";

const AnalyticsSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, unique: true },
    totalOrders: { type: Number, default: 0 },
    successfulOrders: { type: Number, default: 0 },
    cancelledOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    
    // Payment methods breakdown
    paymentMethods: {
      phonepe: { count: { type: Number, default: 0 }, amount: { type: Number, default: 0 } },
      cod: { count: { type: Number, default: 0 }, amount: { type: Number, default: 0 } }
    },
    
    // Order type breakdown
    orderTypes: {
      delivery: { count: { type: Number, default: 0 }, amount: { type: Number, default: 0 } },
      dineIn: { count: { type: Number, default: 0 }, amount: { type: Number, default: 0 } }
    },
    
    // Hourly breakdown for peak times
    peakHours: {
      type: [
        {
          hour: Number,
          orders: Number,
          revenue: Number
        }
      ],
      default: []
    },
    
    // Top dishes
    topDishes: [
      {
        dishName: String,
        count: Number,
        revenue: Number
      }
    ],
    
    // Repeat customers
    repeatCustomers: { type: Number, default: 0 }
  },
  { timestamps: true }
);

AnalyticsSchema.index({ date: -1 });

const Analytics = mongoose.model("Analytics", AnalyticsSchema);
export default Analytics;
