# 👔 MENSTYLE – THỜI TRANG NAM CAO CẤP & TẠP CHÍ XU HƯỚNG
> **Nền tảng Thương mại Điện tử May đo Nam Giới Toàn diện** tích hợp thanh toán VietQR động Napas 247, Tra cứu vận đơn thời gian thực, Trợ lý AI Stylist Gemini RAG và Tạp chí Thời trang chuẩn SEO Top 1 Google & Google AI Overviews (GEO).

---

## 🌟 1. TỔNG QUAN DỰ ÁN
**MENSTYLE** được xây dựng theo kiến trúc Full-stack hiện đại, bảo mật đa tầng Zero-Trust và tối ưu hóa trải nghiệm khách hàng:
* **Storefront Khách hàng (`frontend_template/index.html`):** Thiết kế tối giản sang trọng (Minimalist Luxury), bộ lọc danh mục và giá thông minh, giỏ hàng tức thì, phân trang mượt mà và giao diện thanh toán liền mạch.
* **Tạp chí Thời trang (`frontend_template/news.html`):** 8 bài viết chuyên sâu 800–1200 từ/bài, định dạng Google AI Overviews (GEO), bảng đo size may đo, cấu trúc FAQ Schema và nút chuyển đổi mua hàng trực tiếp (Shop-The-Look).
* **Tra Cứu Vận Đơn Thời Gian Thực (`#orderTrackingModal`):** Khách hàng tra cứu tiến trình 5 bước (`Tiếp nhận ➔ Xác nhận ➔ Đóng gói ➔ Đang giao ➔ Hoàn tất`) bằng Mã đơn hàng hoặc Số điện thoại mà không cần đăng nhập.
* **Thanh Toán VietQR Động Napas 247:** Sinh mã QR thanh toán ngân hàng chính xác theo `orderCode` và `totalAmount` kèm tiện ích sao chép STK / Nội dung một chạm.
* **Trợ Lý Ảo AI Gemini RAG (`ai-chat.js`):** Tư vấn chọn size chuẩn vóc dáng Việt Nam và gợi ý phối đồ dựa trên dữ liệu sản phẩm thực tế từ MongoDB Atlas.
* **Trang Quản Trị Hệ Thống (`frontend_template/admin.html`):** Bảo vệ bằng JWT Auth Guard phía máy chủ, tự động đăng xuất sau 45 phút không hoạt động, quản lý kho hàng với cơ chế trừ kho nguyên tử `$inc`, duyệt đơn hàng và **in phiếu xuất kho kiêm vận đơn** chuẩn kho vận.

---

## 🏗️ 2. KIẾN TRÚC KỸ THUẬT (TECH STACK)
* **Backend:** Node.js, Express.js (RESTful Architecture).
* **Database:** MongoDB Atlas Cloud (Mongoose ODM).
* **AI & Trí Tuệ Nhân Tạo:** Google Gemini AI API (Retrieval-Augmented Generation).
* **Bảo Mật:** JWT Authentication, Bcrypt Password Hashing, Zero-Trust Server Pricing, CORS Whitelisting.
* **Frontend:** Vanilla JavaScript (ES6+), HTML5 Semantic, CSS3 Custom Properties & Responsive Flex/Grid (Tốc độ tải trang tức thì, 0 phụ thuộc thư viện nặng).

---

## 🚀 3. HƯỚNG DẪN KHỞI CHẠY HỆ THỐNG

### Bước 1: Cài đặt thư viện phụ thuộc
```bash
npm install
```

### Bước 2: Cấu hình biến môi trường (`.env`)
Tạo file `.env` tại thư mục gốc với các biến cấu hình cần thiết:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ecommerce_lhu?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key
BANK_ID=MB
BANK_ACCOUNT_NO=0862583284
BANK_ACCOUNT_NAME=MÀN MỘC SÁNG
ADMIN_PASSWORD=your_secure_admin_password
```

### Bước 3: Nạp dữ liệu nền tảng (Seeder)
```bash
npm run seed
```

### Bước 4: Khởi chạy máy chủ Backend
```bash
# Chế độ phát triển (Tự reload khi sửa code)
npm run dev

# Hoặc chế độ Production:
npm start
```

### Bước 5: Truy cập hệ thống
* **Cửa hàng Storefront:** `http://localhost:5000/index.html`
* **Tạp chí Tin tức Fashion:** `http://localhost:5000/news.html`
* **Bảng điều khiển Quản trị:** `http://localhost:5000/admin.html`

---

## 🔒 4. QUY CHUẨN BẢO MẬT & BẢN QUYỀN
* Tuyệt đối không commit file cấu hình bí mật `.env` lên kho lưu trữ Git.
* Bản quyền thuộc về **MENSTYLE FASHION VIETNAM**. Bảo lưu mọi quyền thương hiệu.
