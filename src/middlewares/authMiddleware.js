const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 1. Middleware kiểm tra Token bắt buộc (Protect Route)
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Bạn chưa đăng nhập! Vui lòng gửi kèm mã Token (Bearer Token).",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản người dùng không tồn tại!",
      });
    }
    if (req.user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Tài khoản đã bị khóa!",
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Mã Token không hợp lệ hoặc đã hết hạn!",
    });
  }
};

// 2. Middleware nhận diện Token không bắt buộc (Optional Auth)
exports.optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const u = await User.findById(decoded.id).select("-password");
      if (u && !u.isBlocked) req.user = u;
    } catch (err) {
      // Bỏ qua lỗi token nếu chỉ là optional
    }
  }
  next();
};

// 3. Middleware phân quyền chuẩn Rubric authorize(...roles)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Quyền truy cập bị từ chối! Yêu cầu vai trò: [${roles.join(", ")}].`,
      });
    }
    next();
  };
};

// Alias adminOnly tương thích ngược
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Quyền truy cập bị từ chối! Chức năng này chỉ dành cho Quản trị viên (Admin).",
    });
  }
};
