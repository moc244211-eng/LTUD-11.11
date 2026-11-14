const User = require("../models/User");
const Order = require("../models/Order");

function escapeRegex(text) {
  if (typeof text !== "string") return "";
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// [GET] /api/users - Lấy danh sách khách hàng & thống kê chi tiêu (Tối ưu N+1 Query & Chống ReDoS)
exports.getUsers = async (req, res) => {
  try {
    const { keyword, role, status } = req.query;

    let query = {};
    if (role && typeof role === "string") {
      query.role = role.trim();
    }
    if (status === "blocked") {
      query.isBlocked = true;
    } else if (status === "active") {
      query.isBlocked = false;
    }

    if (keyword && typeof keyword === "string" && keyword.trim()) {
      const safeKw = escapeRegex(keyword.trim());
      const regex = { $regex: safeKw, $options: "i" };
      query.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
      ];
    }

    const users = await User.find(query).select("-password").sort({ createdAt: -1 });

    // TỐI ƯU HIỆU NĂNG: Gom tất cả đơn hàng trong 1 truy vấn duy nhất thay vì N+1 queries
    const userIds = users.map((u) => u._id);
    const userEmails = users.map((u) => (u.email || "").toLowerCase()).filter(Boolean);

    const allOrders = await Order.find({
      $or: [
        { user: { $in: userIds } },
        { customerEmail: { $in: userEmails } },
      ],
    }).select("user customerEmail paymentStatus orderStatus totalAmount");

    const statsMap = {};
    for (const o of allOrders) {
      const uId = o.user ? o.user.toString() : null;
      const email = (o.customerEmail || "").toLowerCase();
      const isPaidOrCompleted =
        o.paymentStatus === "PAID" || o.orderStatus === "COMPLETED";
      const amount = Number(o.totalAmount) || 0;

      const key = uId || email;
      if (key) {
        if (!statsMap[key]) statsMap[key] = { totalOrders: 0, totalSpent: 0 };
        statsMap[key].totalOrders += 1;
        if (isPaidOrCompleted) statsMap[key].totalSpent += amount;
      }
    }

    const usersWithStats = users.map((u) => {
      const uId = u._id.toString();
      const email = (u.email || "").toLowerCase();
      const stats = statsMap[uId] || statsMap[email] || { totalOrders: 0, totalSpent: 0 };

      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone || "Chưa cập nhật",
        role: u.role,
        isBlocked: !!u.isBlocked,
        createdAt: u.createdAt,
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
      };
    });

    res.status(200).json({
      success: true,
      count: usersWithStats.length,
      data: usersWithStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [GET] /api/users/:id - Xem chi tiết khách hàng và toàn bộ lịch sử đơn hàng
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy khách hàng!" });
    }

    const orders = await Order.find({
      $or: [{ user: user._id }, { customerEmail: user.email }],
    }).sort({ createdAt: -1 });

    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.orderStatus === "COMPLETED").length;
    const processingOrders = orders.filter(
      (o) => o.orderStatus === "PENDING" || o.orderStatus === "CONFIRMED" || o.orderStatus === "SHIPPING"
    ).length;
    const cancelledOrders = orders.filter((o) => o.orderStatus === "CANCELLED").length;
    const totalSpent = orders
      .filter((o) => o.paymentStatus === "PAID" || o.orderStatus === "COMPLETED")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        user,
        stats: {
          totalOrders,
          completedOrders,
          processingOrders,
          cancelledOrders,
          totalSpent,
        },
        orders,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [PUT] /api/users/:id/toggle-block - Khóa / Mở khóa tài khoản khách hàng
exports.toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Bảo mật: Không được phép khóa tài khoản Quản trị viên (Admin)!",
      });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: user.isBlocked ? "Đã khóa tài khoản khách hàng!" : "Đã mở khóa tài khoản khách hàng!",
      data: {
        _id: user._id,
        isBlocked: user.isBlocked,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [DELETE] /api/users/:id - Xóa tài khoản khách hàng an toàn
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Bảo mật: Nghiêm cấm xóa tài khoản Quản trị viên!",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Đã xóa tài khoản khách hàng thành công!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
