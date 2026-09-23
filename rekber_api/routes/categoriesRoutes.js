const express = require("express");
const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");
const {
  getAllCategoriesController,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
} = require("../controllers/categoriesController");

const router = express.Router();

router.get("/", getAllCategoriesController);
router.post("/", adminAuthMiddleware, createCategoryController);
router.put("/:id", adminAuthMiddleware, updateCategoryController);
router.delete("/:id", adminAuthMiddleware, deleteCategoryController);

module.exports = router;
