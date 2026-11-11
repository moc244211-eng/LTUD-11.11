const Order = require("../models/Order");
const Product = require("../models/Product");
const sendOrderInvoice = require("../utils/sendEmail");

// [POST] /api/orders - Đặt hàng mới (Zero-Trust Pricing & Trừ kho nguyên tử $inc)
exports.createOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      paymentMethod,
      items,
      shippingFee,
      note,
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
    const decrementedProducts = [];

    // 1. Kiểm tra tồn kho & Áp dụng Zero-Trust Pricing & Trừ kho nguyên tử $inc
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        // Rollback các sản phẩm đã trừ kho trước đó
        for (const dec of decrementedProducts) {
          await Product.findByIdAndUpdate(dec.productId, {
            $inc: { stock: dec.quantity },
          });
        }
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy sản phẩm có mã ID: ${item.productId}`,
        });
      }

      // Trừ kho nguyên tử với điều kiện stock >= quantity
      const quantityToBuy = Math.max(1, parseInt(item.quantity) || 1);
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
          });
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

      // Zero-Trust Pricing: Server dùng giá gốc `product.salePrice` từ DB
      subtotal += product.salePrice * quantityToBuy;

      verifiedItems.push({
        productId: product._id,
        name: product.name,
        quantity: quantityToBuy,
        price: product.salePrice,
        size: item.size || "L",
        image: product.image || "",
      });
    }

    const finalShippingFee =
      shippingFee !== undefined ? Number(shippingFee) : 25000;
    const totalAmount = subtotal + finalShippingFee;
    const orderCode = "MS" + Date.now().toString().slice(-8);

    // Lưu snapshot đơn hàng vào MongoDB
    const order = await Order.create({
      orderCode,
      user: req.user ? req.user._id : null,
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      items: verifiedItems,
      shippingFee: finalShippingFee,
      totalAmount,
      paymentMethod: paymentMethod || "COD",
      paymentStatus: "UNPAID",
      orderStatus: "PENDING",
      note: note || "",
    });

    // Gửi email hóa đơn không đồng bộ (nếu có cấu hình)
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
    res.status(500).json({ success: false, message: error.message });
  }
};

// [GET] /api/orders/myorders - Xem danh sách đơn cá nhân (Yêu cầu Đăng nhập)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [
        { user: req.user._id },
        { customerEmail: req.user.email },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Lấy lịch sử đơn hàng cá nhân thành công",
      total: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [GET] /api/orders - Lấy danh sách toàn bộ đơn hàng (Yêu cầu Admin)
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [GET] /api/orders/:id - Xem chi tiết 1 đơn hàng
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng!",
      });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

    order.paymentStatus = "PAID";
    if (order.orderStatus === "PENDING") {
      order.orderStatus = "CONFIRMED";
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Duyệt thanh toán đơn hàng thành công!",
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

    order.orderStatus = order.orderStatus === "SHIPPING" ? "COMPLETED" : "SHIPPING";
    await order.save();

    res.status(200).json({
      success: true,
      message: `Cập nhật trạng thái giao hàng thành công: ${order.orderStatus}!`,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [PUT] /api/orders/:id/status - Cập nhật trạng thái tổng quát
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const updateData = {};

    if (status) updateData.orderStatus = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

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
    res.status(500).json({ success: false, message: error.message });
  }
};

// [PUT] /api/orders/:id/cancel - Hủy đơn hàng an toàn (Hoàn trả số lượng tồn kho)
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng!" });
    }

    if (order.orderStatus === "CANCELLED") {
      return res.status(400).json({ success: false, message: "Đơn hàng này đã bị hủy trước đó!" });
    }

    // Hoàn lại tồn kho cho các sản phẩm
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    order.orderStatus = "CANCELLED";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Đã hủy đơn hàng và hoàn trả tồn kho thành công!",
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// [GET] /api/orders/analytics/summary - Báo cáo số liệu toàn diện cho Dashboard
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const User = require("../models/User");
    const Category = require("../models/Category");

    const orders = await Order.find().sort({ createdAt: -1 });
    const products = await Product.find().populate("category", "name");
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
      if (o.paymentStatus === "PAID" || o.orderStatus === "COMPLETED") {
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
      if (o.paymentStatus === "PAID" || o.orderStatus === "COMPLETED") {
        customerSpendingMap[email].totalSpent += o.totalAmount || 0;
      }
    });

    const topCustomers = Object.values(customerSpendingMap)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    // 5. Thống kê theo 6 tháng gần nhất để vẽ biểu đồ
    const monthNames = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
    const now = new Date();
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const label = `${monthNames[mIdx]}/${d.getFullYear()}`;
      
      const ordersInMonth = orders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return orderDate.getFullYear() === d.getFullYear() && orderDate.getMonth() === mIdx;
      });

      const revInMonth = ordersInMonth
        .filter((o) => o.paymentStatus === "PAID" || o.orderStatus === "COMPLETED")
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      monthlyStats.push({
        label,
        revenue: revInMonth,
        orderCount: ordersInMonth.length,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalCustomers,
        ordersByStatus,
        stockSummary: {
          totalProducts: products.length,
          lowStockCount: lowStockProducts.length,
          outOfStockCount: outOfStockProducts.length,
          lowStockProducts,
          outOfStockProducts,
        },
        topSellingProducts,
        topCustomers,
        monthlyStats,
        recentOrders: orders.slice(0, 6),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
