const Order = require("../models/orders");
const Product = require("../models/product");
const User = require("../models/user");
const Category = require("../models/category");

// Dashboard Stats (total sales, orders, users, products)
exports.getDashboardStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    // Total sales this year
    const totalSales = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1),
          },
          status: { $in: ["Completed", "Delivered"] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Total orders this year
    const totalOrders = await Order.countDocuments({
      createdAt: {
        $gte: new Date(currentYear, 0, 1),
        $lt: new Date(currentYear + 1, 0, 1),
      },
      status: { $in: ["Completed", "Delivered"] },
    });

    // Total users
    const totalUsers = await User.countDocuments({ isActive: true });

    // Total products
    const totalProducts = await Product.countDocuments({ isArchived: false });

    res.json({
      success: true,
      stats: {
        totalSales: totalSales[0]?.total || 0,
        totalOrders,
        totalUsers,
        totalProducts,
      },
    });
  } catch (error) {
    console.error("❌ Failed to get dashboard stats:", error);
    res.status(500).json({ success: false, message: "Failed to load dashboard stats" });
  }
};

// Monthly Sales
exports.getMonthlySales = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const monthlySales = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1),
          },
          status: { $in: ["Completed", "Delivered"] },
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

// Most Ordered Products
exports.getMostOrderedProducts = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const mostOrdered = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1),
          },
          status: { $in: ["Completed", "Delivered"] },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);

    res.json({ success: true, mostOrderedProducts: mostOrdered });
  } catch (error) {
    console.error("❌ Failed to get most ordered products:", error);
    res.status(500).json({ success: false, message: "Failed to load most ordered products" });
  }
};

// Category Distribution
exports.getCategoryDistribution = async (req, res) => {
  try {
    const categoryDistribution = await Product.aggregate([
      { $match: { isArchived: false } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({ success: true, categoryDistribution });
  } catch (error) {
    console.error("❌ Failed to get category distribution:", error);
    res.status(500).json({ success: false, message: "Failed to load category distribution" });
  }
};

// Order Status Distribution
exports.getOrderStatusDistribution = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const statusDistribution = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1),
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({ success: true, orderStatusDistribution: statusDistribution });
  } catch (error) {
    console.error("❌ Failed to get order status distribution:", error);
    res.status(500).json({ success: false, message: "Failed to load order status distribution" });
  }
};

// Revenue by Category
exports.getRevenueByCategory = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const revenueByCategory = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1),
          },
          status: { $in: ["Completed", "Delivered"] },
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$product.category",
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    res.json({ success: true, revenueByCategory });
  } catch (error) {
    console.error("❌ Failed to get revenue by category:", error);
    res.status(500).json({ success: false, message: "Failed to load revenue by category" });
  }
};

// Daily Sales (last 30 days)
exports.getDailySales = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: { $in: ["Completed", "Delivered"] },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          sales: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    res.json({ success: true, dailySales });
  } catch (error) {
    console.error("❌ Failed to get daily sales:", error);
    res.status(500).json({ success: false, message: "Failed to load daily sales" });
  }
};

// Low Stock Products
exports.getLowStockProducts = async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      isArchived: false,
      stock: { $lte: 10 },
    })
      .select("name stock category")
      .sort({ stock: 1 })
      .limit(20);

    res.json({ success: true, lowStockProducts });
  } catch (error) {
    console.error("❌ Failed to get low stock products:", error);
    res.status(500).json({ success: false, message: "Failed to load low stock products" });
  }
};

// All Dashboard Data (consolidated) - FIXED VERSION
exports.getAllDashboardData = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Execute all queries in parallel
    const [
      totalSalesResult,
      totalOrders,
      totalUsers,
      totalProducts,
      monthlySalesResult,
      mostOrdered,
      categoryDistribution,
      statusDistribution,
      revenueByCategory,
      dailySales,
      lowStockProducts,
    ] = await Promise.all([
      // Total sales
      Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(currentYear, 0, 1),
              $lt: new Date(currentYear + 1, 0, 1),
            },
            status: { $in: ["Completed", "Delivered"] },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
          },
        },
      ]),
      // Total orders
      Order.countDocuments({
        createdAt: {
          $gte: new Date(currentYear, 0, 1),
          $lt: new Date(currentYear + 1, 0, 1),
        },
        status: { $in: ["Completed", "Delivered"] },
      }),
      // Total users
      User.countDocuments({ isActive: true }),
      // Total products
      Product.countDocuments({ isArchived: false }),
      // Monthly sales
      Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(currentYear, 0, 1),
              $lt: new Date(currentYear + 1, 0, 1),
            },
            status: { $in: ["Completed", "Delivered"] },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            totalSales: { $sum: "$totalAmount" },
          },
        },
        { $sort: { "_id": 1 } },
      ]),
      // Most ordered products
      Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(currentYear, 0, 1),
              $lt: new Date(currentYear + 1, 0, 1),
            },
            status: { $in: ["Completed", "Delivered"] },
          },
        },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            name: { $first: "$items.name" },
            totalQuantity: { $sum: "$items.quantity" },
            totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 },
      ]),
      // Category distribution
      Product.aggregate([
        { $match: { isArchived: false } },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
      // Order status distribution
      Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(currentYear, 0, 1),
              $lt: new Date(currentYear + 1, 0, 1),
            },
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
      // Revenue by category
      Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(currentYear, 0, 1),
              $lt: new Date(currentYear + 1, 0, 1),
            },
            status: { $in: ["Completed", "Delivered"] },
          },
        },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.productId",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $group: {
            _id: "$product.category",
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          },
        },
        { $sort: { revenue: -1 } },
      ]),
      // Daily sales
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
            status: { $in: ["Completed", "Delivered"] },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            sales: { $sum: "$totalAmount" },
          },
        },
        { $sort: { "_id": 1 } },
      ]),
      // Low stock products
      Product.find({
        isArchived: false,
        stock: { $lte: 10 },
      })
        .select("name stock category")
        .sort({ stock: 1 })
        .limit(20),
    ]);

    // Format monthly sales data
    const monthlySales = Array.from({ length: 12 }, (_, i) => {
      const monthData = monthlySalesResult.find((item) => item._id === i + 1);
      return {
        month: new Date(currentYear, i).toLocaleString("default", { month: "short" }),
        sales: monthData ? monthData.totalSales : 0,
      };
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalSales: totalSalesResult[0]?.total || 0,
          totalOrders,
          totalUsers,
          totalProducts,
        },
        monthlySales,
        mostOrderedProducts: mostOrdered,
        categoryDistribution,
        orderStatusDistribution: statusDistribution,
        revenueByCategory,
        dailySales,
        lowStockProducts,
      },
    });
  } catch (error) {
    console.error("❌ Failed to get all dashboard data:", error);
    res.status(500).json({ success: false, message: "Failed to load dashboard data" });
  }
};