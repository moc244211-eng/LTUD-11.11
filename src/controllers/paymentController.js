const Order = require("../models/Order");

// [POST] /api/payment/create-qr - Tạo mã thanh toán QR động chuẩn VietQR / Napas 247
exports.createPaymentQR = async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;
    let order = null;

    if (orderId && typeof orderId === "string" && orderId.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(orderId);
    }
    if (!order && orderId && typeof orderId === "string") {
      order = await Order.findOne({ orderCode: orderId.trim() });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng tương ứng!",
      });
    }

    // SEC-11: chỉ sinh QR cho đơn còn cần thanh toán
    if (order.paymentStatus === "PAID" || order.orderStatus === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Đơn hàng đã thanh toán hoặc đã hủy, không cần tạo mã QR!",
      });
    }

    const totalAmount = order.totalAmount;
    const orderCode = order.orderCode;
    let qrUrl = "";

    const bankId = process.env.BANK_ID || "MB";
    const accountNo = process.env.BANK_ACCOUNT_NO || "0862583284";
    const rawAccountName = process.env.BANK_ACCOUNT_NAME || "MÀN MỘC SÁNG";
    const accountName = encodeURIComponent(rawAccountName);
    const addInfo = encodeURIComponent(`DH ${orderCode}`);

    if (paymentMethod === "VIETQR" || !paymentMethod) {
      // 1. Chuẩn VietQR (Napas 247) chuyển khoản ngân hàng
      qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${totalAmount}&addInfo=${addInfo}&accountName=${accountName}`;
    } else if (paymentMethod === "MOMO_QR") {
      // 2. Mã QR Ví MoMo
      const momoPhone = process.env.MOMO_PHONE || accountNo;
      const momoName = encodeURIComponent(rawAccountName);
      const momoData = encodeURIComponent(
        `2|99|${momoPhone}|${momoName}||0|0|${totalAmount}|DH ${orderCode}|transfer_myqr`
      );
      qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${momoData}`;
    }

    res.status(200).json({
      success: true,
      message: "Tạo mã thanh toán QR động thành công",
      data: {
        orderId: order._id,
        orderCode: order.orderCode,
        totalAmount,
        paymentMethod: paymentMethod || "VIETQR",
        qrUrl,
        bankId,
        accountNo,
        accountName: rawAccountName,
        transferNote: `DH ${orderCode}`,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi tạo mã thanh toán QR",
    });
  }
};
