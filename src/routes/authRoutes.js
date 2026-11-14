const express = require("express");
const router = express.Router();
const { register, login, getMe, updatePassword } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const { authLimiter } = require("../middlewares/securityMiddleware");

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", protect, getMe);
router.put("/update-password", protect, authLimiter, updatePassword);

module.exports = router;
