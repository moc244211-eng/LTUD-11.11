require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

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

// 2. Middleware toàn cục
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Phục vụ giao diện tĩnh Frontend (Storefront & Admin)
app.use(express.static(path.join(__dirname, "../frontend_template")));

// 4. Health Check API
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "MENSTYLE E-Commerce Backend API",
    timestamp: new Date().toISOString(),
    message: "Hệ thống Bán hàng Thời trang Nam hoạt động ổn định!",
  });
});

// 5. Định tuyến các Endpoint API
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

// 6. Xử lý SEO & Robots / Sitemap cho Google Search Console
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

// 7. Xử lý fallback cho SPA / Giao diện Frontend
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend_template/admin.html"));
});
app.get(["/news", "/tin-tuc"], (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend_template/news.html"));
});

// 8. Bắt lỗi 404 cho API không tồn tại
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Đường dẫn [${req.method}] ${req.originalUrl} không tồn tại trên hệ thống API!`,
  });
});

// 8. Khởi chạy Server
app.listen(PORT, () => {
  console.log("====================================================");
  console.log(`🚀 MENSTYLE E-Commerce Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`🛒 Trang Storefront Khách hàng: http://localhost:${PORT}/index.html`);
  console.log(`⚙️ Trang Admin Quản trị: http://localhost:${PORT}/admin.html`);
  console.log(`🤖 AI Gemini RAG Chatbot: POST http://localhost:${PORT}/api/ai/chat`);
  console.log("====================================================");
});
