require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

async function changeAdminPassword(newPassword) {
  if (!newPassword || newPassword.length < 6) {
    console.error("❌ Mật khẩu phải có ít nhất 6 ký tự!");
    process.exit(1);
  }

  try {
    await connectDB();
    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      console.error("❌ Không tìm thấy tài khoản admin trong CSDL!");
      process.exit(1);
    }

    admin.password = newPassword;
    await admin.save();
    console.log("====================================================");
    console.log(`✅ ĐÃ ĐỔI MẬT KHẨU ADMIN THÀNH CÔNG!`);
    console.log(`📧 Email Quản trị : ${admin.email}`);
    console.log(`🔑 Mật khẩu mới   : ${newPassword}`);
    console.log("====================================================");
    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi đổi mật khẩu Admin:", err.message);
    process.exit(1);
  }
}

const newPass = process.argv[2];
if (!newPass) {
  console.log("Cách dùng: node src/scripts/changeAdminPassword.js <MatKhauMoi>");
  process.exit(1);
}
changeAdminPassword(newPass);
