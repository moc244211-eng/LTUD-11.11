const rateLimit = require("express-rate-limit");

// 1. Rate Limiters bảo vệ máy chủ chống tấn công Brute-force & DoS
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Bạn đã thử đăng nhập/đăng ký quá nhiều lần. Vui lòng thử lại sau 15 phút!",
  },
});

const couponLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 phút
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Tần suất kiểm tra mã giảm giá quá nhanh. Vui lòng thử lại sau vài phút!",
  },
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Bạn đã gửi quá nhiều yêu cầu liên hệ. Vui lòng chờ 1 giờ trước khi gửi tiếp!",
  },
});

const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 phút
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Hệ thống AI Stylist đang tiếp nhận nhiều yêu cầu. Vui lòng chờ trong giây lát!",
  },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Quá nhiều yêu cầu từ địa chỉ IP của bạn. Vui lòng thử lại sau!",
  },
});

// 2. Chống NoSQL Injection Middleware (Lọc bỏ các toán tử MongoDB $ và . nguy hiểm)
function sanitizeMongoOperators(obj) {
  if (!obj || typeof obj !== "object") return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      sanitizeMongoOperators(obj[key]);
    }
  }
}

const mongoSanitizeMiddleware = (req, res, next) => {
  if (req.body) sanitizeMongoOperators(req.body);
  if (req.query) sanitizeMongoOperators(req.query);
  if (req.params) sanitizeMongoOperators(req.params);
  next();
};

// 3. Error Handling Middleware (Không để lộ stack trace trên môi trường Production)
const errorHandlerMiddleware = (err, req, res, next) => {
  console.error("🔥 [Unhandled Error]:", err && err.message);
  // SEC-10: tôn trọng mã trạng thái do thư viện đặt (JSON hỏng = 400, body quá lớn = 413...)
  let statusCode = Number(err && (err.status || err.statusCode)) || 500;
  if (statusCode < 400 || statusCode > 599) statusCode = 500;

  let message;
  if (statusCode >= 500) {
    message = "Đã có lỗi xảy ra trên hệ thống. Vui lòng thử lại sau!";
  } else if (err && err.type === "entity.parse.failed") {
    message = "Dữ liệu JSON gửi lên không hợp lệ.";
  } else if (err && err.type === "entity.too.large") {
    message = "Dữ liệu gửi lên quá lớn.";
  } else {
    message = "Yêu cầu không hợp lệ.";
  }

  // Chỉ lộ stack khi chạy dev trên máy cá nhân (Render luôn có biến RENDER)
  const isDev = process.env.NODE_ENV === "development" && !process.env.RENDER;
  res.status(statusCode).json({
    success: false,
    message,
    ...(isDev && err && err.stack ? { stack: err.stack } : {}),
  });
};

// Giới hạn riêng cho việc tạo đơn hàng (chống vét tồn kho bằng đơn COD ảo)
const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Bạn đã đặt quá nhiều đơn hàng trong thời gian ngắn. Vui lòng thử lại sau hoặc liên hệ cửa hàng!",
  },
});

module.exports = {
  orderLimiter,
  authLimiter,
  couponLimiter,
  contactLimiter,
  aiLimiter,
  apiLimiter,
  mongoSanitizeMiddleware,
  errorHandlerMiddleware,
};
