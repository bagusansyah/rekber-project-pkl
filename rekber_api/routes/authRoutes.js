// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { register, login, googleLogin, activateAccount, changePassword } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post('/activate', activateAccount);
router.put("/change-password", authMiddleware, changePassword);

module.exports = router;