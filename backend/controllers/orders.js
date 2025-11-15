const Order = require("../models/orders");
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } = require("../utils/sendEmail");

// Create new order (checkout)
exports.createOrder = async (req, res) => {
  try {
    const { userId, items, totalAmount, address, phone, shipping, shippingFee } = req.body;

    if (!userId || !items || items.length === 0 || !shipping || !address || !phone) {
      return res.status(400).json({ success: false, message: "Missing order data" });
    }

    const order = await Order.create({
      userId,
      items,
      totalAmount,
      address,
      phone,
      shipping,
      shippingFee,
    });

    // Populate userId for email
    const populatedOrder = await Order.findById(order._id).populate('userId', 'username email');

    // Send confirmation email with PDF receipt
    try {
      await sendOrderConfirmationEmail(populatedOrder);
    } catch (emailError) {
      console.error("❌ Email sending failed (order still created):", emailError);
    }

    res.status(201).json({ success: true, message: "Order placed successfully", order });
  } catch (error) {
    console.error("❌ Order creation failed:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("userId", "username email");
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load orders" });
  }
};

// Get orders by user
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    // Ensure requester is the same user or an admin
    const requesterId = req.user?.id;
    const requesterIsAdmin = req.user?.isAdmin;
    if (!requesterId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (String(requesterId) !== String(userId) && !requesterIsAdmin) {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load user orders" });
  }
};

// Update order status (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Pending", "Shipped", "Delivered", "Cancelled", "Completed"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate('userId', 'username email');

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Send status update email (Shipped and Delivered)
    if (status === "Shipped" || status === "Delivered") {
      try {
        await sendOrderStatusUpdateEmail(order, status);
      } catch (emailError) {
        console.error("❌ Status update email failed:", emailError);
      }
    }

    return res.json({ success: true, message: "Order status updated", order });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update order" });
  }
};

// User: Cancel own order only if Pending
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (String(order.userId) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    if (order.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Only pending orders can be cancelled' });
    }

    // Store cancellation reason
    order.status = 'Cancelled';
    order.cancellationReason = reason || 'Cancelled by user';
    order.cancelledAt = new Date();
    await order.save();

    return res.json({
      success: true,
      message: 'Order cancelled successfully',
      order,
      cancellationReason: order.cancellationReason
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to cancel order' });
  }
};

// User: Confirm receipt only if Delivered -> Completed
exports.confirmOrderReceived = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (String(order.userId) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    if (order.status !== 'Delivered') {
      return res.status(400).json({ success: false, message: 'Only delivered orders can be marked as completed' });
    }
    order.status = 'Completed';
    await order.save();
    return res.json({ success: true, message: 'Order marked as completed', order });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to confirm receipt' });
  }
};

// Get monthly sales data (admin)
exports.getMonthlySales = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const monthlySales = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, 0, 1), // Jan 1st of current year
            $lt: new Date(currentYear + 1, 0, 1), // Jan 1st of next year
          },
          status: { $in: ["Completed", "Delivered"] }, // Only count completed/delivered orders
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalSales: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: { "_id": 1 },
      },
    ]);

    // Create array for all 12 months, defaulting to 0 if no sales
    const salesData = Array.from({ length: 12 }, (_, i) => {
      const monthData = monthlySales.find((item) => item._id === i + 1);
      return {
        month: new Date(currentYear, i).toLocaleString("default", { month: "short" }),
        sales: monthData ? monthData.totalSales : 0,
      };
    });

    res.json({ success: true, salesData });
  } catch (error) {
    console.error("❌ Failed to get monthly sales:", error);
    res.status(500).json({ success: false, message: "Failed to load sales data" });
  }
};
