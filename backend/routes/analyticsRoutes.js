import express from "express";
import {
  getTodayAnalytics,
  getWeekAnalytics,
  getMonthAnalytics,
  getGrowthMetrics
} from "../services/analyticsService.js";
import verifyAdmin from "../middleware/adminAuth.js";

const router = express.Router();

/**
 * Get today's analytics
 */
router.get("/today", verifyAdmin, async (req, res) => {
  try {
    const analytics = await getTodayAnalytics();
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error("Error fetching today's analytics:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Get week analytics
 */
router.get("/week", verifyAdmin, async (req, res) => {
  try {
    const analytics = await getWeekAnalytics();
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error("Error fetching week analytics:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Get month analytics
 */
router.get("/month", verifyAdmin, async (req, res) => {
  try {
    const analytics = await getMonthAnalytics();
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error("Error fetching month analytics:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Get growth metrics
 */
router.get("/growth", verifyAdmin, async (req, res) => {
  try {
    const metrics = await getGrowthMetrics();
    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    console.error("Error fetching growth metrics:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
