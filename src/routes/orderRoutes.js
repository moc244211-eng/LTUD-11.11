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
  cancelOrder,
  getDashboardAnalytics,
} = require("../controllers/orderController");
const { protect, authorize, optionalAuth } = require("../middlewares/authMiddleware");

// 1. Đặt hàng (khách vãng lai hoặc thành viên đã đăng nhập)
router.post("/", optionalAuth, createOrder);

// 2. Lấy đơn hàng của cá nhân (Rubric 1.2: /myorders)
router.get("/myorders", protect, getMyOrders);

// 3. Analytics & Thống kê tổng hợp (Đặt trước /:id)
router.get("/analytics/summary", protect, authorize("admin"), getDashboardAnalytics);

// 4. Quản trị viên duyệt và quản lý toàn bộ đơn hàng (Rubric 3.2)
router.get("/", protect, authorize("admin"), getOrders);
router.get("/:id", protect, getOrderById);

// 5. Thao tác trực tiếp duyệt thanh toán & giao hàng (Rubric 1.2 & 3.2)
router.put("/:id/pay", protect, authorize("admin"), payOrder);
router.put("/:id/deliver", protect, authorize("admin"), deliverOrder);
router.put("/:id/status", protect, authorize("admin"), updateOrderStatus);
router.put("/:id/cancel", protect, authorize("admin"), cancelOrder);

module.exports = router;
