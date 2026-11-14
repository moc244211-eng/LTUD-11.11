const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
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

    const token = generateToken(user._id);

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
    res.status(500).json({ success: false, message: error.message });
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

    const token = generateToken(user._id);

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
    res.status(500).json({ success: false, message: error.message });
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
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới!",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới phải có ít nhất 6 ký tự!",
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
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Đổi mật khẩu thành công!",
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
