const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrders,
  getOrderById,
  payOrder,
  deliverOrder,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect, authorize, optionalAuth } = require("../middlewares/authMiddleware");

// 1. Đặt hàng (khách vãng lai hoặc thành viên đã đăng nhập)
router.post("/", optionalAuth, createOrder);

// 2. Lấy đơn hàng của cá nhân (Rubric 1.2: /myorders)
router.get("/myorders", protect, getMyOrders);

// 3. Quản trị viên duyệt và quản lý toàn bộ đơn hàng (Rubric 3.2)
router.get("/", protect, authorize("admin"), getOrders);
router.get("/:id", protect, getOrderById);

// 4. Thao tác trực tiếp duyệt thanh toán & giao hàng (Rubric 1.2 & 3.2)
router.put("/:id/pay", protect, authorize("admin"), payOrder);
router.put("/:id/deliver", protect, authorize("admin"), deliverOrder);
router.put("/:id/status", protect, authorize("admin"), updateOrderStatus);

module.exports = router;
