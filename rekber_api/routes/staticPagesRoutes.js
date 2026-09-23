const express = require("express");
const router = express.Router();
const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");
const {
  getPageBySlugController,
  getAllPagesAdminController,
  updatePageController,
} = require("../controllers/staticPagesController");

// =======================
// ADMIN ROUTES
// =======================
router.get("/admin/all", adminAuthMiddleware, getAllPagesAdminController);
router.put("/admin/:slug", adminAuthMiddleware, updatePageController);

// =======================
// PUBLIC ROUTES
// =======================
router.get("/:slug", getPageBySlugController);

module.exports = router;
