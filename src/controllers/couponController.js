const { sendServerError } = require("../utils/errorResponse");
const Coupon = require("../models/Coupon");

// [GET] /api/coupons - Danh sách mã giảm giá (Admin)
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: coupons.length, data: coupons });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// [POST] /api/coupons - Tạo mã giảm giá mới (Admin)
exports.createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxUsage, expiryDate } = req.body || {};

    if (!code || !discountValue || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ: Mã giảm giá, Giá trị giảm và Ngày hết hạn!",
      });
    }
    if (typeof code !== "string" || code.trim().length === 0 || code.length > 50) {
      return res.status(400).json({ success: false, message: "Mã giảm giá không hợp lệ (tối đa 50 ký tự)!" });
    }

    const val = Number(discountValue);
    if (!Number.isFinite(val)) {
      return res.status(400).json({ success: false, message: "Giá trị giảm phải là số hợp lệ!" });
    }

    // BUG-16: ngày dạng YYYY-MM-DD hết hạn vào cuối ngày (23:59:59.999 giờ Việt Nam)
    const expiry =
      typeof expiryDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(expiryDate)
        ? new Date(`${expiryDate}T23:59:59.999+07:00`)
        : new Date(expiryDate);
    if (Number.isNaN(expiry.getTime())) {
      return res.status(400).json({ success: false, message: "Ngày hết hạn không hợp lệ!" });
    }
    const type = discountType === "FIXED" ? "FIXED" : "PERCENT";
    if (type === "PERCENT" && (val < 1 || val > 100)) {
      return res.status(400).json({
        success: false,
        message: "Mã giảm giá phần trăm phải có giá trị từ 1% đến 100%!",
      });
    }
    if (type === "FIXED" && val <= 0) {
      return res.status(400).json({
        success: false,
        message: "Giá trị giảm tiền mặt phải lớn hơn 0đ!",
      });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Mã giảm giá "${code.toUpperCase()}" đã tồn tại trên hệ thống!`,
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      discountType: type,
      discountValue: val,
      minOrderValue: Math.max(0, Number(minOrderValue) || 0),
      maxUsage: Math.max(1, Number(maxUsage) || 100),
      expiryDate: expiry,
    });

    res.status(201).json({
      success: true,
      message: "Tạo mã giảm giá thành công",
      data: coupon,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// [DELETE] /api/coupons/:id - Xóa mã giảm giá (Admin)
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Không tìm thấy mã giảm giá!" });
    }
    res.status(200).json({ success: true, message: "Đã xóa mã giảm giá thành công!" });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// [PUT] /api/coupons/:id/toggle - Kích hoạt / Tạm ngừng mã (Admin)
exports.toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Không tìm thấy mã giảm giá!" });
    }
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    res.status(200).json({
      success: true,
      message: coupon.isActive ? "Đã kích hoạt mã giảm giá!" : "Đã tạm dừng mã giảm giá!",
      data: coupon,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// [POST] /api/coupons/validate - Kiểm tra mã giảm giá khi thanh toán (Khách & Admin)
exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderTotal } = req.body || {};
    if (!code || typeof code !== "string" || code.length > 50) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập mã giảm giá!" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Mã giảm giá không tồn tại!" });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: "Mã giảm giá đã bị tạm ngừng áp dụng!" });
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ success: false, message: "Mã giảm giá đã hết hạn sử dụng!" });
    }

    if (coupon.usageCount >= coupon.maxUsage) {
      return res.status(400).json({ success: false, message: "Mã giảm giá đã hết lượt sử dụng!" });
    }

    const currentTotal = Number(orderTotal) || 0;
    if (currentTotal < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng tối thiểu phải từ ${Number(coupon.minOrderValue).toLocaleString("vi-VN")} đ để áp dụng mã này!`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === "PERCENT") {
      const pct = Math.min(100, Math.max(1, Number(coupon.discountValue) || 0));
      discountAmount = Math.round((currentTotal * pct) / 100);
    } else {
      discountAmount = Math.min(Number(coupon.discountValue) || 0, currentTotal);
    }

    res.status(200).json({
      success: true,
      message: "Áp dụng mã giảm giá thành công!",
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        finalTotal: Math.max(0, currentTotal - discountAmount),
      },
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};
