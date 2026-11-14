const { sendServerError } = require("../utils/errorResponse");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id, tokenVersion = 0) => {
  return jwt.sign({ id, tv: tokenVersion || 0 }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

// [POST] /api/auth/register - Đăng ký tài khoản (Chống NoSQL Injection)
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ và chính xác: họ tên, email và mật khẩu!",
      });
    }

    if (
      email.length > 120 ||
      !/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(email.trim()) ||
      name.trim().length === 0 ||
      name.length > 100
    ) {
      return res.status(400).json({ success: false, message: "Họ tên hoặc email không hợp lệ!" });
    }
    if (password.length < 8 || password.length > 100 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải từ 8 ký tự, gồm cả chữ và số!",
      });
    }
    if (phone !== undefined && phone !== "" && (typeof phone !== "string" || !/^[0-9+\-\s().]{8,20}$/.test(phone.trim()))) {
      return res.status(400).json({ success: false, message: "Số điện thoại không hợp lệ!" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPhone = typeof phone === "string" ? phone.trim() : "";

    const existing = await User.findOne({ email: cleanEmail });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email này đã được đăng ký tài khoản!",
      });
    }

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: password,
      phone: cleanPhone,
      role: "customer",
    });

    const token = generateToken(user._id, user.tokenVersion);

    res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// [POST] /api/auth/login - Đăng nhập nhận Token (Chống NoSQL Injection)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      !email ||
      !password ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp email và mật khẩu hợp lệ!",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không chính xác!",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Tài khoản của bạn đã bị khóa bởi Quản trị viên. Vui lòng liên hệ hỗ trợ!",
      });
    }

    const token = generateToken(user._id, user.tokenVersion);

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// [GET] /api/auth/me - Lấy thông tin tài khoản hiện tại
exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Lấy thông tin tài khoản thành công",
    data: req.user,
  });
};

// [PUT] /api/auth/update-password - Đổi mật khẩu tài khoản (Chuẩn bảo mật thực tế)
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword || typeof currentPassword !== "string" || typeof newPassword !== "string") {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới!",
      });
    }

    if (newPassword.length < 8 || newPassword.length > 100 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới phải từ 8 ký tự, gồm cả chữ và số!",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user || !(await user.matchPassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: "Mật khẩu hiện tại không chính xác!",
      });
    }

    user.password = newPassword;
    user.tokenVersion = (user.tokenVersion || 0) + 1; // thu hồi mọi token cũ
    await user.save();

    const token = generateToken(user._id, user.tokenVersion);

    res.status(200).json({
      success: true,
      message: "Đổi mật khẩu thành công!",
      token,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};
