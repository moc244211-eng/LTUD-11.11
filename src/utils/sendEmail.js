const nodemailer = require("nodemailer");

const sendOrderInvoice = async (order) => {
  // 1. Log tóm tắt an toàn (Không in số điện thoại hoặc địa chỉ nhà chi tiết ra console)
  console.log(`🧾 [MENSTYLE Invoice] Đơn hàng #${order.orderCode} | Khách: ${order.customerName} | Tổng: ${Number(order.totalAmount).toLocaleString("vi-VN")} đ`);

  // 2. Gửi Email thật nếu có cấu hình biến môi trường
  if (
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS &&
    process.env.EMAIL_USER !== "your_email@gmail.com"
  ) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const itemsRows = (order.items || [])
        .map(
          (item, idx) => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${idx + 1}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>${item.name}</strong> (Size ${item.size || "L"})</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">${Number(item.price).toLocaleString("vi-VN")} đ</td>
          </tr>
        `
        )
        .join("");

      await transporter.sendMail({
        from: `"MENSTYLE Fashion" <${process.env.EMAIL_USER}>`,
        to: order.customerEmail,
        subject: `[Xác Nhận Đơn Hàng #${order.orderCode}] MENSTYLE - Cảm ơn quý khách!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0b0b0b;">
            <div style="background: #0f172a; padding: 20px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">MENSTYLE</h1>
              <p style="margin: 5px 0 0 0; font-size: 13px; color: #94a3b8;">THỜI TRANG NAM CAO CẤP</p>
            </div>
            <div style="padding: 24px; background: #ffffff; border: 1px solid #e2e8f0;">
              <h2 style="font-size: 18px; margin-top: 0;">Kính chào ${order.customerName},</h2>
              <p>Đơn hàng <strong>#${order.orderCode}</strong> của quý khách đã được tạo thành công trên hệ thống MENSTYLE.</p>
              
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13.5px;">
                <thead>
                  <tr style="background: #f8fafc; text-align: left;">
                    <th style="padding: 8px;">STT</th>
                    <th style="padding: 8px;">Sản phẩm</th>
                    <th style="padding: 8px; text-align: center;">SL</th>
                    <th style="padding: 8px; text-align: right;">Đơn giá</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>

              <div style="text-align: right; margin-top: 15px; font-size: 14px;">
                <div>Phí vận chuyển: <strong>${Number(order.shippingFee || 0).toLocaleString("vi-VN")} đ</strong></div>
                ${order.discountAmount > 0 ? `<div style="color: #dc2626;">Giảm giá coupon: <strong>-${Number(order.discountAmount).toLocaleString("vi-VN")} đ</strong></div>` : ""}
                <div style="font-size: 18px; margin-top: 8px; color: #0b0b0b;">TỔNG THANH TOÁN: <strong style="color: #dc2626;">${Number(order.totalAmount).toLocaleString("vi-VN")} đ</strong></div>
              </div>

              <div style="margin-top: 24px; padding: 14px; background: #f8fafc; border-radius: 6px; font-size: 12.5px; color: #475569;">
                <div><strong>Phương thức:</strong> ${order.paymentMethod}</div>
                <div><strong>Trạng thái:</strong> ${order.paymentStatus === "PAID" ? "Đã thanh toán" : "Chờ thanh toán"}</div>
              </div>

              <p style="margin-top: 24px; font-size: 12.5px; color: #64748b; text-align: center;">
                Hotline hỗ trợ 24/7: 0862.583.284 | Showroom: Quận 1, TP. Hồ Chí Minh
              </p>
            </div>
          </div>
        `,
      });

      console.log(`📧 [Nodemailer] Đã gửi email xác nhận đơn #${order.orderCode} tới khách hàng.`);
    } catch (err) {
      console.warn(`⚠️ [Nodemailer] Không thể gửi email: ${err.message}`);
    }
  }
};

module.exports = sendOrderInvoice;
