const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUserById,
  toggleBlockUser,
  deleteUser,
} = require("../controllers/userController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Toàn bộ API Quản lý khách hàng yêu cầu quyền Admin
router.use(protect, authorize("admin"));

router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id/toggle-block", toggleBlockUser);
router.delete("/:id", deleteUser);

module.exports = router;
