exports.calculateShipping = (req, res) => {
  try {
    const { province, orderTotal } = req.body || {};

    if (!province || typeof province !== "string" || province.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp tỉnh thành!",
      });
    }

    if (orderTotal && Number(orderTotal) >= 500000) {
      return res.status(200).json({
        success: true,
        data: {
          province,
          shippingFee: 0,
          isFree: true,
          estimatedDays: "2-3 ngày",
        },
      });
    }

    const p = province.toLowerCase();
    let shippingFee = 25000; // đồng bộ với phí ship thực tính ở orderController (25.000đ, miễn phí từ 500.000đ)


    res.status(200).json({
      success: true,
      data: {
        province,
        shippingFee,
        isFree: false,
        estimatedDays: "3-4 ngày",
      },
    });
  } catch (error) {
    console.error("Lỗi calculateShipping:", error);
    res.status(500).json({
      success: false,
      message: "Không thể tính phí vận chuyển lúc này.",
    });
  }
};
