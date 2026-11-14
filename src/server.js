require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const connectDB = require("./config/db");

const {
  apiLimiter,
  mongoSanitizeMiddleware,
  errorHandlerMiddleware,
} = require("./middlewares/securityMiddleware");

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const aiRoutes = require("./routes/aiRoutes");
const shippingRoutes = require("./routes/shippingRoutes");
const userRoutes = require("./routes/userRoutes");
const couponRoutes = require("./routes/couponRoutes");
const articleRoutes = require("./routes/articleRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Kết nối MongoDB Atlas
connectDB();

// 2. Bảo mật máy chủ toàn diện với Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdnjs.cloudflare.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://images.unsplash.com",
          "https://img.vietqr.io",
          "https://api.qrserver.com",
          "https://placehold.co",
        ],
        connectSrc: [
          "'self'",
          "https://men-style.onrender.com",
          "http://localhost:5000",
          "http://127.0.0.1:5000",
        ],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// 3. Cấu hình CORS an toàn
const allowedOrigins = [
  "https://men-style.onrender.com",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".onrender.com")) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// 4. Lọc bỏ toán tử NoSQL Injection ($ và .) trong mọi request
app.use(mongoSanitizeMiddleware);

// 5. Phục vụ giao diện tĩnh Frontend (Storefront & Admin)
app.use(express.static(path.join(__dirname, "../frontend_template")));

// 6. Giới hạn tần suất truy vấn API chung
app.use("/api", apiLimiter);

// 7. Health Check API
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "MENSTYLE E-Commerce Backend API",
    timestamp: new Date().toISOString(),
    message: "Hệ thống Bán hàng Thời trang Nam hoạt động ổn định và an toàn!",
  });
});

// 8. Định tuyến các Endpoint API
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/contacts", contactRoutes);

// 9. Xử lý SEO & Robots / Sitemap cho Google Search Console
app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.sendFile(path.join(__dirname, "../frontend_template/robots.txt"));
});

app.get("/sitemap.xml", (req, res) => {
  res.type("application/xml");
  res.sendFile(path.join(__dirname, "../frontend_template/sitemap.xml"));
});

// Google Search Console HTML Verification File
app.get("/google5c0a95efb5bbd70b.html", (req, res) => {
  res.type("text/html");
  res.sendFile(path.join(__dirname, "../frontend_template/google5c0a95efb5bbd70b.html"));
});

// 10. Xử lý fallback cho SPA / Giao diện Frontend
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend_template/admin.html"));
});
app.get(["/news", "/tin-tuc"], (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend_template/news.html"));
});

// 11. Bắt lỗi 404 cho API không tồn tại
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Đường dẫn [${req.method}] ${req.originalUrl} không tồn tại trên hệ thống API!`,
  });
});

// 12. Middleware xử lý lỗi tập trung (Không để lộ stack trace trên Production)
app.use(errorHandlerMiddleware);

// 13. Khởi chạy Server
app.listen(PORT, () => {
  console.log("====================================================");
  console.log(`🚀 MENSTYLE E-Commerce Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`🛒 Trang Storefront Khách hàng: http://localhost:${PORT}/index.html`);
  console.log(`⚙️ Trang Admin Quản trị: http://localhost:${PORT}/admin.html`);
  console.log(`🤖 AI Gemini RAG Chatbot: POST http://localhost:${PORT}/api/ai/chat`);
  console.log("====================================================");
});
