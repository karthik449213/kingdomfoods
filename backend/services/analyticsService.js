import Analytics from "../models/Analytics.js";
import Order from "../models/Order.js";

/**
 * Update daily analytics
 */
export const updateDailyAnalytics = async (orderId) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let analytics = await Analytics.findOne({ date: today });
    if (!analytics) {
      analytics = new Analytics({ date: today });
    }

    // Update basic metrics
    analytics.totalOrders += 1;
    if (order.payment?.status === "SUCCESS") {
      analytics.successfulOrders += 1;
      analytics.totalRevenue += order.totalAmount;
    }

    // Update payment method breakdown
    if (order.payment?.method === "PHONEPE" && order.payment?.status === "SUCCESS") {
      analytics.paymentMethods.phonepe.count += 1;
      analytics.paymentMethods.phonepe.amount += order.totalAmount;
    } else if (!order.payment?.method || order.payment?.method === "COD") {
      analytics.paymentMethods.cod.count += 1;
      if (order.payment?.status !== "FAILED") {
        analytics.paymentMethods.cod.amount += order.totalAmount;
      }
    }

    // Update order type breakdown
    if (order.deliveryType === "DELIVERY") {
      analytics.orderTypes.delivery.count += 1;
      analytics.orderTypes.delivery.amount += order.totalAmount;
    } else {
      analytics.orderTypes.dineIn.count += 1;
      analytics.orderTypes.dineIn.amount += order.totalAmount;
    }

    // Update peak hours
    const hour = new Date().getHours();
    let hourlyData = analytics.peakHours.find(h => h.hour === hour);
    if (!hourlyData) {
      hourlyData = { hour, orders: 0, revenue: 0 };
      analytics.peakHours.push(hourlyData);
    }
    hourlyData.orders += 1;
    hourlyData.revenue += order.totalAmount;

    // Update top dishes
    for (const item of order.items) {
      let dishData = analytics.topDishes.find(d => d.dishName === item.dishName);
      if (!dishData) {
        dishData = { dishName: item.dishName, count: 0, revenue: 0 };
        analytics.topDishes.push(dishData);
      }
      dishData.count += item.quantity;
      dishData.revenue += item.price * item.quantity;
    }

    // Calculate average order value
    analytics.averageOrderValue = analytics.totalRevenue / Math.max(analytics.successfulOrders, 1);

    await analytics.save();
    return analytics;
  } catch (error) {
    console.error("Error updating daily analytics:", error);
    return null;
  }
};

/**
 * Get analytics for a date range
 */
export const getAnalytics = async (startDate, endDate) => {
  try {
    const analytics = await Analytics.find({
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });

    return analytics;
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return [];
  }
};

/**
 * Get today's analytics
 */
export const getTodayAnalytics = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const analytics = await Analytics.findOne({
      date: { $gte: today, $lt: tomorrow }
    });

    return analytics || {
      totalOrders: 0,
      successfulOrders: 0,
      cancelledOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      paymentMethods: { phonepe: { count: 0, amount: 0 }, cod: { count: 0, amount: 0 } },
      orderTypes: { delivery: { count: 0, amount: 0 }, dineIn: { count: 0, amount: 0 } }
    };
  } catch (error) {
    console.error("Error fetching today's analytics:", error);
    return null;
  }
};

/**
 * Get week analytics
 */
export const getWeekAnalytics = async () => {
  try {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const analytics = await Analytics.find({
      date: { $gte: weekAgo, $lt: today }
    }).sort({ date: -1 });

    const aggregated = {
      totalOrders: 0,
      successfulOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      daily: analytics
    };

    analytics.forEach(day => {
      aggregated.totalOrders += day.totalOrders;
      aggregated.successfulOrders += day.successfulOrders;
      aggregated.totalRevenue += day.totalRevenue;
    });

    aggregated.averageOrderValue = aggregated.totalRevenue / Math.max(aggregated.successfulOrders, 1);

    return aggregated;
  } catch (error) {
    console.error("Error fetching week analytics:", error);
    return null;
  }
};

/**
 * Get month analytics
 */
export const getMonthAnalytics = async () => {
  try {
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const analytics = await Analytics.find({
      date: { $gte: monthAgo, $lt: today }
    }).sort({ date: -1 });

    const aggregated = {
      totalOrders: 0,
      successfulOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      daily: analytics
    };

    analytics.forEach(day => {
      aggregated.totalOrders += day.totalOrders;
      aggregated.successfulOrders += day.successfulOrders;
      aggregated.totalRevenue += day.totalRevenue;
    });

    aggregated.averageOrderValue = aggregated.totalRevenue / Math.max(aggregated.successfulOrders, 1);

    return aggregated;
  } catch (error) {
    console.error("Error fetching month analytics:", error);
    return null;
  }
};

/**
 * Get repeat customers count
 */
export const getRepeatCustomers = async () => {
  try {
    const repeatCustomers = await Order.aggregate([
      { $match: { "payment.status": "SUCCESS" } },
      { $group: { _id: "$customerPhone", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $count: "total" }
    ]);

    return repeatCustomers[0]?.total || 0;
  } catch (error) {
    console.error("Error fetching repeat customers:", error);
    return 0;
  }
};

/**
 * Get growth metrics
 */
export const getGrowthMetrics = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const todayAnalytics = await Analytics.findOne({ date: { $gte: today } });
    const yesterdayAnalytics = await Analytics.findOne({ date: { $gte: yesterday, $lt: today } });
    const weekAnalytics = await Analytics.findOne({ date: { $gte: lastWeek } });
    const monthAnalytics = await Analytics.findOne({ date: { $gte: lastMonth } });

    const todayRevenue = todayAnalytics?.totalRevenue || 0;
    const yesterdayRevenue = yesterdayAnalytics?.totalRevenue || 0;
    const weekRevenue = weekAnalytics?.totalRevenue || 0;
    const monthRevenue = monthAnalytics?.totalRevenue || 0;

    return {
      dayWiseGrowth: yesterdayRevenue === 0 ? 0 : ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(2),
      weekGrowth: weekRevenue === 0 ? 0 : ((todayRevenue - weekRevenue) / weekRevenue * 100).toFixed(2),
      monthGrowth: monthRevenue === 0 ? 0 : ((todayRevenue - monthRevenue) / monthRevenue * 100).toFixed(2),
      repeatCustomers: await getRepeatCustomers()
    };
  } catch (error) {
    console.error("Error fetching growth metrics:", error);
    return null;
  }
};

export default {
  updateDailyAnalytics,
  getAnalytics,
  getTodayAnalytics,
  getWeekAnalytics,
  getMonthAnalytics,
  getRepeatCustomers,
  getGrowthMetrics
};
