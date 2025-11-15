const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getAllProductsAdmin,
  getProductById,
  updateProduct,
  toggleArchiveProduct,
  deleteProduct,
  getProductDetailsWithExtras,
} = require("../controllers/product");
const { createOrUpdateReview, getProductReviews } = require("../controllers/reviews");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

router.post("/", isAuthenticated, isAdmin, createProduct);
// Public - list non-archived products (used by home/shop pages)
router.get("/", getAllProducts);
// Admin - list all products including archived
router.get("/all", isAuthenticated, isAdmin, getAllProductsAdmin);
router.get("/:id", getProductById);
router.get("/:id/details", getProductDetailsWithExtras);
router.put("/:id", isAuthenticated, isAdmin, updateProduct);
router.put("/:id/archive", isAuthenticated, isAdmin, toggleArchiveProduct);
router.delete("/:id", isAuthenticated, isAdmin, deleteProduct);

// Reviews
router.get("/:id/reviews", getProductReviews);
router.post("/:id/reviews", isAuthenticated, createOrUpdateReview);

module.exports = router;
