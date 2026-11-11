const express = require("express");
const router = express.Router();
const {
  getCoupons,
  createCoupon,
  deleteCoupon,
  toggleCouponStatus,
  validateCoupon,
} = require("../controllers/couponController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Kiểm tra mã giảm giá (áp dụng cho cả khách và admin)
router.post("/validate", validateCoupon);

// Các thao tác quản trị yêu cầu quyền Admin
router.get("/", protect, authorize("admin"), getCoupons);
router.post("/", protect, authorize("admin"), createCoupon);
router.delete("/:id", protect, authorize("admin"), deleteCoupon);
router.put("/:id/toggle", protect, authorize("admin"), toggleCouponStatus);

module.exports = router;
