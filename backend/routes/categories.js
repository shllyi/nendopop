const express = require("express");
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  getArchivedCategories,
  toggleArchiveCategory,
} = require("../controllers/category");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

router.post("/", isAuthenticated, isAdmin, createCategory);
router.get("/", getAllCategories);
router.get("/archived", isAuthenticated, isAdmin, getArchivedCategories);
router.put("/:id", isAuthenticated, isAdmin, updateCategory);
router.put("/:id/archive", isAuthenticated, isAdmin, toggleArchiveCategory);
router.delete("/:id", isAuthenticated, isAdmin, deleteCategory); // does archive

module.exports = router;
