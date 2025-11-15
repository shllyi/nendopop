// routes/dashboard.js
const express = require("express");
const {
  getDashboardStats,
  getMostOrderedProducts,
  getCategoryDistribution,
  getOrderStatusDistribution,
  getRevenueByCategory,
  getDailySales,
  getLowStockProducts,
  getAllDashboardData,
  getMonthlySales, // ADD THIS LINE - it was missing!
} = require("../controllers/dashboard");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

const router = express.Router();

// All dashboard routes require admin authentication
router.get("/stats", isAuthenticated, isAdmin, getDashboardStats);
router.get("/most-ordered-products", isAuthenticated, isAdmin, getMostOrderedProducts);
router.get("/category-distribution", isAuthenticated, isAdmin, getCategoryDistribution);
router.get("/order-status-distribution", isAuthenticated, isAdmin, getOrderStatusDistribution);
router.get("/revenue-by-category", isAuthenticated, isAdmin, getRevenueByCategory);
router.get("/daily-sales", isAuthenticated, isAdmin, getDailySales);
router.get("/low-stock-products", isAuthenticated, isAdmin, getLowStockProducts);
router.get("/monthly-sales", isAuthenticated, isAdmin, getMonthlySales); // ADD THIS LINE
router.get("/all", isAuthenticated, isAdmin, getAllDashboardData);

module.exports = router;