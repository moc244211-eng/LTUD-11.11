const { sendServerError } = require("../utils/errorResponse");
// Hoàn lại 1 lượt dùng coupon khi đơn bị hủy (không để usageCount âm)
async function restoreCouponUsage(order) {
  if (order && order.couponCode) {
    await Coupon.updateOne(
      { code: order.couponCode, usageCount: { $gt: 0 } },
      { $inc: { usageCount: -1 } }
    ).catch(() => {});
  }
}

// Che tên khách trong API tra cứu công khai: "Nguyễn Văn An" -> "N*** An"
function maskName(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].charAt(0) + "***";
  return parts[0].charAt(0) + "*** " + parts[parts.length - 1];
}

// Thứ tự trạng thái hợp lệ (chỉ được đi tiến, CANCELLED/COMPLETED là trạng thái cuối)
const ORDER_STATUS_RANK = { PENDING: 0, CONFIRMED: 1, SHIPPING: 2, COMPLETED: 3 };
const crypto = require("crypto");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const sendOrderInvoice = require("../utils/sendEmail");

function escapeRegex(text) {
  if (typeof text !== "string") return "";
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// [POST] /api/orders - Đặt hàng mới (Zero-Trust Pricing, Server-side Shipping Fee, Rollback An Toàn)
exports.createOrder = async (req, res) => {
  const decrementedProducts = [];
  let appliedCouponCode = "";

  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      paymentMethod,
      items,
      note,
      couponCode,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Giỏ hàng của bạn đang trống!",
      });
    }

    if (!customerName || !customerPhone || !customerEmail || !shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ: Họ tên, Số điện thoại, Email và Địa chỉ nhận hàng!",
      });
    }

    let subtotal = 0;
    const verifiedItems = [];

    // 1. Kiểm tra tồn kho & Áp dụng Zero-Trust Pricing & Trừ kho nguyên tử $inc
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        // Rollback các sản phẩm đã trừ kho trước đó
        for (const dec of decrementedProducts) {
          await Product.findByIdAndUpdate(dec.productId, {
            $inc: { stock: dec.quantity },
          }).catch(() => {});
        }
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy sản phẩm có mã ID: ${item.productId}`,
        });
      }

      // SEC-03: size phải thuộc danh sách size của sản phẩm (kiểm tra TRƯỚC khi trừ kho)
      const productSizes = Array.isArray(product.sizes) ? product.sizes.map(String) : [];
      let validatedSize;
      if (productSizes.length > 0) {
        const reqSize = typeof item.size === "string" ? item.size.trim() : "";
        if (!productSizes.includes(reqSize)) {
          for (const dec of decrementedProducts) {
            await Product.findByIdAndUpdate(dec.productId, {
              $inc: { stock: dec.quantity },
            }).catch(() => {});
          }
          return res.status(400).json({
            success: false,
            message: `Size không hợp lệ cho sản phẩm "${product.name}". Vui lòng chọn: ${productSizes.join(", ")}.`,
          });
        }
        validatedSize = reqSize;
      } else {
        validatedSize = "FREE";
      }

      // Trừ kho nguyên tử với điều kiện stock >= quantity
      const quantityToBuy = Math.max(1, parseInt(item.quantity, 10) || 1);
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          stock: { $gte: quantityToBuy },
        },
        {
          $inc: { stock: -quantityToBuy },
        },
        { new: true }
      );

      if (!updatedProduct) {
        // Rollback nếu không đủ hàng trong kho
        for (const dec of decrementedProducts) {
          await Product.findByIdAndUpdate(dec.productId, {
            $inc: { stock: dec.quantity },
          }).catch(() => {});
        }
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${product.name}" trong kho không đủ (chỉ còn ${product.stock} món, bạn đặt ${quantityToBuy})!`,
        });
      }

      decrementedProducts.push({
        productId: product._id,
        quantity: quantityToBuy,
      });

      // Zero-Trust Pricing: Server hoàn toàn tin tưởng giá bán `product.salePrice` từ Database
      subtotal += product.salePrice * quantityToBuy;

      verifiedItems.push({
        productId: product._id,
        name: product.name,
        quantity: quantityToBuy,
        price: product.salePrice,
        size: validatedSize,
        image: product.image || "",
      });
    }

    // 2. Kiểm tra & Áp dụng mã giảm giá (Coupons) nguyên tử
    let discountAmount = 0;

    if (couponCode && typeof couponCode === "string" && couponCode.trim()) {
      try {
        const cleanCode = couponCode.toUpperCase().trim();
        const now = new Date();

        const coupon = await Coupon.findOne({
          code: cleanCode,
          isActive: true,
          expiryDate: { $gte: now },
        });

        if (
          coupon &&
          coupon.usageCount < coupon.maxUsage &&
          subtotal >= coupon.minOrderValue
        ) {
          if (coupon.discountType === "PERCENT") {
            const pct = Math.min(100, Math.max(1, Number(coupon.discountValue) || 0));
            discountAmount = Math.round((subtotal * pct) / 100);
          } else {
            discountAmount = Math.min(Number(coupon.discountValue) || 0, subtotal);
          }

          // Cập nhật nguyên tử lượt dùng coupon với điều kiện usageCount < maxUsage
          const incResult = await Coupon.findOneAndUpdate(
            {
              _id: coupon._id,
              isActive: true,
              usageCount: { $lt: coupon.maxUsage },
            },
            {
              $inc: { usageCount: 1 },
            },
            { new: true }
          );

          if (incResult) {
            appliedCouponCode = coupon.code;
          } else {
            discountAmount = 0;
          }
        }
      } catch (cpErr) {
        console.warn("Lỗi xác thực coupon khi đặt hàng:", cpErr.message);
      }

      // BUG-02: mã giảm giá được gửi lên nhưng không áp dụng được -> báo lỗi rõ ràng
      // (không âm thầm bỏ qua để tổng tiền khách thấy luôn khớp với đơn thật)
      if (!appliedCouponCode) {
        for (const dec of decrementedProducts) {
          await Product.findByIdAndUpdate(dec.productId, {
            $inc: { stock: dec.quantity },
          }).catch(() => {});
        }
        return res.status(400).json({
          success: false,
          message:
            "Mã giảm giá không thể áp dụng (không tồn tại, hết hạn, hết lượt hoặc chưa đạt giá trị đơn tối thiểu). Vui lòng bỏ mã hoặc kiểm tra lại.",
        });
      }
    }

    // 3. Zero-Trust Shipping Fee: Server tự tính phí ship, không tin tưởng client
    const finalShippingFee = subtotal >= 500000 ? 0 : 25000;
    const totalAmount = Math.max(0, subtotal - discountAmount + finalShippingFee);

    // Sinh mã đơn hàng an toàn không thể đoán thứ tự (Cryptographically secure & Unique)
    const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
    const orderCode = `MS${randomSuffix}${Date.now().toString().slice(-4)}`;

    // 4. Lưu snapshot đơn hàng vào MongoDB
    const order = await Order.create({
      orderCode,
      user: req.user ? req.user._id : null,
      customerName: String(customerName).trim(),
      customerPhone: String(customerPhone).trim(),
      customerEmail: String(customerEmail).trim().toLowerCase(),
      shippingAddress: String(shippingAddress).trim(),
      items: verifiedItems,
      shippingFee: finalShippingFee,
      discountAmount,
      couponCode: appliedCouponCode,
      totalAmount,
      paymentMethod: ["COD", "VIETQR", "MOMO_QR"].includes(paymentMethod)
        ? paymentMethod
        : "COD",
      paymentStatus: "UNPAID",
      orderStatus: "PENDING",
      note: typeof note === "string" ? note.slice(0, 500) : "",
    });

    // Gửi email hóa đơn không đồng bộ (nếu cấu hình)
    try {
      sendOrderInvoice(order);
    } catch (e) {
      console.warn("Không gửi được email xác nhận:", e.message);
    }

    res.status(201).json({
      success: true,
      message: "Đặt hàng thành công!",
      data: order,
    });
  } catch (error) {
    // 5. ROLLBACK TOÀN DIỆN: Nếu tạo đơn thất bại, hoàn trả lại tồn kho & lượt dùng coupon
    console.error("Lỗi tạo đơn hàng, kích hoạt rollback kho:", error.message);
    for (const dec of decrementedProducts) {
      await Product.findByIdAndUpdate(dec.productId, {
        $inc: { stock: dec.quantity },
      }).catch(() => {});
    }
    if (appliedCouponCode) {
      await Coupon.findOneAndUpdate(
        { code: appliedCouponCode },
        { $inc: { usageCount: -1 } }
      ).catch(() => {});
    }

    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi tạo đơn hàng. Tồn kho đã được hoàn trả an toàn!",
    });
  }
};

// [GET] /api/orders/myorders - Xem danh sách đơn cá nhân (Yêu cầu Đăng nhập)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Lấy lịch sử đơn hàng cá nhân thành công",
      total: orders.length,
      data: orders,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// [GET] /api/orders - Lấy toàn bộ danh sách đơn hàng (Yêu cầu Admin, có Phân trang)
exports.getOrders = async (req, res) => {
  try {
    const { status, paymentStatus, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== "ALL") {
      filter.orderStatus = status;
    }
    if (paymentStatus && paymentStatus !== "ALL") {
      filter.paymentStatus = paymentStatus;
    }

    if (search && typeof search === "string") {
      const cleanSearch = escapeRegex(search.trim());
      const regex = new RegExp(cleanSearch, "i");
      filter.$or = [
        { orderCode: regex },
        { customerName: regex },
        { customerPhone: regex },
        { customerEmail: regex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 20), 50);
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      message: "Lấy danh sách đơn hàng thành công",
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// [GET] /api/orders/:id - Xem chi tiết 1 đơn hàng (Chống IDOR: Chỉ Admin hoặc Chính Chủ)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng!",
      });
    }

    // Kiểm tra quyền hạn (Admin hoặc chủ đơn)
    const isAdmin = req.user && req.user.role === "admin";
    const isOwner =
      order.user && req.user && order.user.toString() === req.user._id.toString();
    // SEC-04: chỉ khớp theo user (email khách vãng lai chưa được xác thực)
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Bảo mật IDOR: Bạn không có quyền truy cập vào thông tin đơn hàng này!",
      });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// [PUT] /api/orders/:id/pay - Thao tác trực tiếp: Duyệt thanh toán đơn hàng (Yêu cầu Admin)
exports.payOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng!",
      });
    }

    if (order.orderStatus === "CANCELLED") {
      return res.status(400).json({ success: false, message: "Đơn hàng đã hủy, không thể duyệt thanh toán!" });
    }
    order.paymentStatus = "PAID";
    if (order.orderStatus === "PENDING") {
      order.orderStatus = "CONFIRMED";
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Đã duyệt thanh toán đơn hàng thành công!",
      data: order,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// [PUT] /api/orders/:id/deliver - Thao tác trực tiếp: Xác nhận giao hàng (Yêu cầu Admin)
exports.deliverOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng!",
      });
    }

    if (["CANCELLED", "COMPLETED"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Không thể chuyển sang Đang Giao khi đơn đang ở trạng thái ${order.orderStatus}!`,
      });
    }

    order.orderStatus = "SHIPPING";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Đã cập nhật trạng thái đơn sang Đang Giao Hàng!",
      data: order,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// [PUT] /api/orders/:id/status - Cập nhật trạng thái tổng thể (Validate Enum & Hoàn Kho An Toàn)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body || {};
    const ALLOWED_ORDER_STATUSES = [
      "PENDING",
      "CONFIRMED",
      "SHIPPING",
      "COMPLETED",
      "CANCELLED",
    ];
    const ALLOWED_PAYMENT_STATUSES = ["UNPAID", "PAID"];

    if (status && !ALLOWED_ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Trạng thái đơn hàng "${status}" không hợp lệ!`,
      });
    }

    if (paymentStatus && !ALLOWED_PAYMENT_STATUSES.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Trạng thái thanh toán "${paymentStatus}" không hợp lệ!`,
      });
    }

    // Nếu chuyển sang CANCELLED, thực hiện hoàn trả kho nguyên tử
    if (status === "CANCELLED") {
      const prevOrder = await Order.findOneAndUpdate(
        { _id: req.params.id, orderStatus: { $nin: ["CANCELLED", "COMPLETED"] } },
        {
          $set: {
            orderStatus: "CANCELLED",
            ...(paymentStatus ? { paymentStatus } : {}),
          },
        },
        { new: false }
      );

      if (!prevOrder) {
        return res.status(400).json({
          success: false,
          message: "Chỉ hủy được đơn chưa hoàn tất và chưa bị hủy trước đó!",
        });
      }

      // Hoàn trả kho + lượt dùng coupon
      await restoreCouponUsage(prevOrder);
      for (const item of prevOrder.items || []) {
        if (item.productId) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.quantity },
          }).catch(() => {});
        }
      }

      const updated = await Order.findById(req.params.id);
      return res.status(200).json({
        success: true,
        message: "Đã hủy đơn hàng và hoàn trả tồn kho thành công!",
        data: updated,
      });
    }

    const updateData = {};
    if (status) updateData.orderStatus = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    // BUG-03: chỉ cho đi tiến (PENDING→CONFIRMED→SHIPPING→COMPLETED); CANCELLED là trạng thái cuối
    const current = await Order.findById(req.params.id).select("orderStatus");
    if (!current) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng!",
      });
    }
    if (status && status !== current.orderStatus) {
      if (current.orderStatus === "CANCELLED" || current.orderStatus === "COMPLETED") {
        return res.status(400).json({
          success: false,
          message: `Đơn hàng đã ${current.orderStatus === "CANCELLED" ? "hủy" : "hoàn tất"}, không thể đổi trạng thái nữa!`,
        });
      }
      if (ORDER_STATUS_RANK[status] < ORDER_STATUS_RANK[current.orderStatus]) {
        return res.status(400).json({
          success: false,
          message: "Không thể lùi trạng thái đơn hàng về bước trước đó!",
        });
      }
    }
    if (paymentStatus && current.orderStatus === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Đơn hàng đã hủy, không thể đổi trạng thái thanh toán!",
      });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// [PUT] /api/orders/:id/cancel - Hủy đơn hàng an toàn (Idempotent - Chống hoàn kho 2 lần)
exports.cancelOrder = async (req, res) => {
  try {
    // Atomic test-and-set: Chỉ update nếu chưa phải CANCELLED
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, orderStatus: { $nin: ["CANCELLED", "COMPLETED"] } },
      { $set: { orderStatus: "CANCELLED" } },
      { new: false }
    );

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Chỉ hủy được đơn chưa hoàn tất và chưa bị hủy trước đó!",
      });
    }

    await restoreCouponUsage(order);

    // Hoàn lại tồn kho cho các sản phẩm trong đơn
    for (const item of order.items || []) {
      if (item.productId) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        }).catch(() => {});
      }
    }

    const updated = await Order.findById(req.params.id);

    res.status(200).json({
      success: true,
      message: "Đã hủy đơn hàng và hoàn trả tồn kho thành công!",
      data: updated,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// [GET] /api/orders/analytics/summary - Báo cáo số liệu toàn diện cho Dashboard (Tối ưu RAM)
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const User = require("../models/User");

    // Chỉ chọn các trường cần thiết để không tràn bộ nhớ RAM Node.js
    const orders = await Order.find({})
      .select("orderStatus paymentStatus totalAmount items customerEmail customerName customerPhone createdAt")
      .sort({ createdAt: -1 });

    const products = await Product.find({}).select("name stock category price salePrice");
    const totalCustomers = await User.countDocuments({ role: "customer" });

    // 1. Doanh thu & Tình trạng đơn
    let totalRevenue = 0;
    const ordersByStatus = {
      PENDING: 0,
      CONFIRMED: 0,
      SHIPPING: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    orders.forEach((o) => {
      if (ordersByStatus[o.orderStatus] !== undefined) {
        ordersByStatus[o.orderStatus]++;
      }
      if (o.orderStatus !== "CANCELLED" && (o.paymentStatus === "PAID" || o.orderStatus === "COMPLETED")) {
        totalRevenue += o.totalAmount || 0;
      }
    });

    // 2. Tồn kho
    const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 10);
    const outOfStockProducts = products.filter((p) => p.stock === 0);

    // 3. Top sản phẩm bán chạy (Tổng hợp từ Order items)
    const productSalesMap = {};
    orders.forEach((o) => {
      if (o.orderStatus !== "CANCELLED") {
        (o.items || []).forEach((item) => {
          const pId = item.productId ? item.productId.toString() : item.name;
          if (!productSalesMap[pId]) {
            productSalesMap[pId] = {
              name: item.name,
              price: item.price,
              image: item.image,
              totalQty: 0,
              totalSales: 0,
            };
          }
          productSalesMap[pId].totalQty += item.quantity || 1;
          productSalesMap[pId].totalSales += (item.price || 0) * (item.quantity || 1);
        });
      }
    });

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, 5);

    // 4. Top khách hàng chi tiêu nhiều nhất
    const customerSpendingMap = {};
    orders.forEach((o) => {
      const email = o.customerEmail || "anonymous@menstyle.vn";
      if (!customerSpendingMap[email]) {
        customerSpendingMap[email] = {
          name: o.customerName || "Khách mua hàng",
          email,
          phone: o.customerPhone,
          orderCount: 0,
          totalSpent: 0,
        };
      }
      customerSpendingMap[email].orderCount++;
      if (o.orderStatus !== "CANCELLED" && (o.paymentStatus === "PAID" || o.orderStatus === "COMPLETED")) {
        customerSpendingMap[email].totalSpent += o.totalAmount || 0;
      }
    });

    const topCustomers = Object.values(customerSpendingMap)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    // 5. Thống kê theo 6 tháng gần nhất để vẽ biểu đồ
    const monthlyStats = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = `Tháng ${d.getMonth() + 1}`;
      const year = d.getFullYear();
      const month = d.getMonth();

      let rev = 0;
      let count = 0;
      orders.forEach((o) => {
        const orderDate = new Date(o.createdAt);
        if (
          orderDate.getFullYear() === year &&
          orderDate.getMonth() === month &&
          o.orderStatus !== "CANCELLED"
        ) {
          count++;
          if (o.orderStatus !== "CANCELLED" && (o.paymentStatus === "PAID" || o.orderStatus === "COMPLETED")) {
            rev += o.totalAmount || 0;
          }
        }
      });

      monthlyStats.push({ month: monthLabel, revenue: rev, orders: count });
    }

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalOrders: orders.length,
        totalCustomers,
        totalProducts: products.length,
        ordersByStatus,
        stockAlerts: {
          lowStock: lowStockProducts.length,
          outOfStock: outOfStockProducts.length,
        },
        topSellingProducts,
        topCustomers,
        monthlyStats,
        recentOrders: orders.slice(0, 5),
      },
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// [GET] /api/orders/track/:query - Tra cứu đơn hàng công khai (Bảo Mật PII, Che SĐT, Che Địa Chỉ, Tránh ReDoS)
exports.trackOrder = async (req, res) => {
  try {
    const rawQuery = (req.params.query || "").trim();
    if (!rawQuery) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập mã đơn hàng (VD: MS...) hoặc số điện thoại!",
      });
    }

    // Escape regex an toàn chống ReDoS
    const cleanQuery = rawQuery.replace(/^#+/, "").trim();
    const safeEscaped = escapeRegex(cleanQuery);
    const queryRegex = new RegExp(`^#?${safeEscaped}$`, "i");

    const orders = await Order.find({
      $or: [
        { orderCode: queryRegex },
        { customerPhone: cleanQuery },
        ...(cleanQuery.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: cleanQuery }] : []),
      ],
    }).sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy đơn hàng nào khớp với "${cleanQuery}". Vui lòng kiểm tra lại mã đơn hoặc số điện thoại!`,
      });
    }

    // BẢO VỆ PII: Không bao giờ trả về nguyên vẹn SĐT, Email hay Địa chỉ nhà chi tiết ra API công khai!
    const sanitizedOrders = orders.map((ord) => {
      const p = ord.customerPhone || "";
      const maskedPhone =
        p.length >= 7 ? p.slice(0, 3) + "****" + p.slice(-3) : p;

      const email = ord.customerEmail || "";
      const maskedEmail = email.includes("@")
        ? email.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => `${a}***${c}`)
        : "";

      const addr = ord.shippingAddress || "";
      const addrParts = addr.split(",");
      const maskedAddr =
        addrParts.length > 1
          ? `***, ${addrParts.slice(-2).join(",").trim()}`
          : addr.length > 10
          ? `*** ${addr.slice(-10)}`
          : addr;

      return {
        _id: ord._id,
        orderCode: ord.orderCode,
        orderStatus: ord.orderStatus,
        paymentStatus: ord.paymentStatus,
        paymentMethod: ord.paymentMethod,
        createdAt: ord.createdAt,
        customerName: maskName(ord.customerName),
        customerPhone: maskedPhone,
        customerPhoneMasked: maskedPhone,
        customerEmail: maskedEmail,
        shippingAddress: maskedAddr,
        items: (ord.items || []).map((i) => ({
          productId: i.productId,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          size: i.size,
          image: i.image,
        })),
        shippingFee: ord.shippingFee,
        discountAmount: ord.discountAmount,
        couponCode: ord.couponCode,
        totalAmount: ord.totalAmount,
      };
    });

    res.status(200).json({
      success: true,
      message: `Tìm thấy ${orders.length} đơn hàng!`,
      data: sanitizedOrders,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};
