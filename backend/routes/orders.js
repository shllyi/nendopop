const express = require("express");
const {
  createOrder,
  getAllOrders,
  getUserOrders,
  updateOrderStatus,
  cancelOrder,
  confirmOrderReceived,
  getMonthlySales,
} = require("../controllers/orders");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

const router = express.Router();

// Create Order (Checkout)
router.post("/", isAuthenticated, createOrder);

// Admin - Get all orders
router.get("/", isAuthenticated, isAdmin, getAllOrders);

// User - Get orders by user (protected: only the user or admin)
router.get("/user/:userId", isAuthenticated, getUserOrders);

// Admin - Update order status
router.put("/:orderId/status", isAuthenticated, isAdmin, updateOrderStatus);

// User - Cancel own order (only if Pending)
router.put('/:orderId/cancel', isAuthenticated, cancelOrder);

// User - Confirm receipt (Delivered -> Completed)
router.put('/:orderId/confirm', isAuthenticated, confirmOrderReceived);

// Admin - Get monthly sales data
router.get('/sales/monthly', isAuthenticated, isAdmin, getMonthlySales);

module.exports = router;
