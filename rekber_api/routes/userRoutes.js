// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { 
  getDistricts,
  getProfile, 
  getProfileDetail, 
  updateProfileDetail,
  getProvinces,
  getRegencies,
  searchUserByEmailOrPhoneController
} = require("../controllers/userController");

router.get("/usersearch", authMiddleware, searchUserByEmailOrPhoneController);
router.get("/profile", authMiddleware, getProfile);
router.get("/profile-detail", authMiddleware, getProfileDetail);
router.put("/profile-detail", authMiddleware, updateProfileDetail);

// Wilayah endpoints
router.get("/provinces", getProvinces);
router.get("/regencies/:province_id", getRegencies);
router.get("/districts/:regency_id", getDistricts);

module.exports = router;