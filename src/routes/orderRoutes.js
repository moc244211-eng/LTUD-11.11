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
  trackOrder,
} = require("../controllers/orderController");
const { protect, authorize, optionalAuth } = require("../middlewares/authMiddleware");

// 1. Đặt hàng (khách vãng lai hoặc thành viên đã đăng nhập)
router.post("/", optionalAuth, createOrder);

// 2. Tra cứu đơn hàng công khai theo mã đơn hàng hoặc số điện thoại (Guest Tracking)
router.get("/track/:query", trackOrder);

// 3. Lấy đơn hàng của cá nhân (Rubric 1.2: /myorders)
router.get("/myorders", protect, getMyOrders);

// 4. Analytics & Thống kê tổng hợp (Đặt trước /:id)
router.get("/analytics/summary", protect, authorize("admin"), getDashboardAnalytics);

// 5. Quản trị viên duyệt và quản lý toàn bộ đơn hàng (Rubric 3.2)
router.get("/", protect, authorize("admin"), getOrders);
router.get("/:id", protect, getOrderById);

// 6. Thao tác trực tiếp duyệt thanh toán & giao hàng (Rubric 1.2 & 3.2)
router.put("/:id/pay", protect, authorize("admin"), payOrder);
router.put("/:id/deliver", protect, authorize("admin"), deliverOrder);
router.put("/:id/status", protect, authorize("admin"), updateOrderStatus);
router.put("/:id/cancel", protect, authorize("admin"), cancelOrder);

module.exports = router;
