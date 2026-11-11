# 👔 ĐỒ ÁN CUỐI KỲ: MENSTYLE - HỆ THỐNG TMĐT THỜI TRANG NAM CAO CẤP
**Học phần:** Lập Trình Ứng Dụng (Mã HP: 112175) — Chuyên ngành Thương Mại Điện Tử — Trường Đại Học Lạc Hồng (LHU)

---

## 🌟 1. TỔNG QUAN HỆ THỐNG
Dự án được xây dựng theo kiến trúc Fullstack hoàn chỉnh, đáp ứng 100% các tiêu chí trong Rubric Chấm điểm Cuối kỳ:
* **Đề tài kinh doanh:** Cửa hàng Thời trang Nam cao cấp **MENSTYLE** (Áo sơ mi Oxford, Áo polo pique, Quần tây âu cạp thông minh, Quần jean slimfit, Áo khoác blazer Hàn Quốc, Thắt lưng da bò...).
* **Backend RESTful API:** Node.js, Express.js, MongoDB Atlas (Mongoose ODM), JWT Authentication, Phân quyền Role-based, Zero-Trust Pricing, Trừ kho nguyên tử `$inc`.
* **Thanh toán VietQR:** Tích hợp API sinh mã thanh toán VietQR động chuẩn Napas 247 gắn đúng `orderCode` và `totalAmount`.
* **Trợ lý ảo AI Gemini RAG:** Google Gemini 1.5 Flash kết hợp kỹ thuật Retrieval-Augmented Generation (RAG) truy vấn trực tiếp kho sản phẩm từ MongoDB Atlas để tư vấn chọn size theo chiều cao cân nặng và gợi ý phối đồ.
* **Storefront Khách hàng (`index.html`):** Carousel quảng cáo, Bộ lọc danh mục & khoảng giá, Tìm kiếm Debounce, Phân trang chuyên nghiệp (Pagination), Modal chi tiết & chọn Size, Giỏ hàng LocalStorage, Form đặt hàng, Popup VietQR, Modal Đăng nhập/Đăng ký & Xem đơn hàng cá nhân `/myorders`.
* **Admin Dashboard (`admin.html`):** Auth Guard kiểm tra Bearer JWT Token ở Client; Thống kê doanh thu, đơn hàng, sản phẩm; CRUD Quản lý sản phẩm; CRUD Quản lý danh mục; Nút thao tác trực tiếp duyệt thanh toán (`PUT /api/orders/:id/pay`) và giao hàng (`PUT /api/orders/:id/deliver`).

---

## 🔑 2. TÀI KHOẢN MẪU ĐÃ CÓ TRONG HỆ THỐNG
Dữ liệu đã được nạp tự động qua file seeder (`node src/seeder.js`):
* **👑 Quản trị viên (Admin):**
  * Email: `admin@menstyle.vn`
  * Mật khẩu: `AdminPassword123@`
* **👤 Khách hàng (Customer):**
  * Email: `hung.nguyen@gmail.com`
  * Mật khẩu: `KhachPassword123@`

---

## 🚀 3. HƯỚNG DẪN KHỞI CHẠY DỰ ÁN

### Bước 1: Khởi động máy chủ Backend
```bash
npm start
# Hoặc chế độ lập trình tự reload:
npm run dev
```
Server chạy tại: `http://localhost:5000`

### Bước 2: Nạp lại dữ liệu Seeder (Khi cần reset database)
```bash
npm run seed
```

### Bước 3: Truy cập hệ thống trên Trình duyệt
* **Cửa hàng Khách hàng:** `http://localhost:5000/index.html` (hoặc mở trực tiếp file `frontend_template/index.html`).
* **Trang Quản trị Admin:** `http://localhost:5000/admin.html` (hoặc mở trực tiếp file `frontend_template/admin.html`).

---

## 📋 4. BẢNG TỔNG HỢP ENDPOINT RESTFUL API

| Phương thức | Endpoint | Chức năng | Phân quyền |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Đăng ký tài khoản mới (Bcrypt salt=10) | Công khai |
| **POST** | `/api/auth/login` | Đăng nhập nhận JWT Token | Công khai |
| **GET** | `/api/auth/me` | Lấy thông tin tài khoản đang đăng nhập | Bearer Token |
| **GET** | `/api/products` | Lấy danh sách sản phẩm (Phân trang, Lọc giá, Danh mục, Regex) | Công khai |
| **GET** | `/api/products/:id` | Xem chi tiết 1 sản phẩm | Công khai |
| **POST** | `/api/products` | Thêm sản phẩm mới | Admin |
| **PUT** | `/api/products/:id` | Cập nhật sản phẩm | Admin |
| **DELETE**| `/api/products/:id` | Xóa sản phẩm | Admin |
| **GET** | `/api/categories` | Lấy danh sách danh mục | Công khai |
| **POST** | `/api/categories` | Thêm danh mục mới | Admin |
| **PUT** | `/api/categories/:id` | Cập nhật danh mục | Admin |
| **DELETE**| `/api/categories/:id` | Xóa danh mục | Admin |
| **POST** | `/api/orders` | Đặt hàng mới (Zero-Trust, Trừ kho nguyên tử `$inc`) | Khách / User |
| **GET** | `/api/orders/myorders` | Xem lịch sử đơn hàng cá nhân | Bearer Token |
| **GET** | `/api/orders` | Xem danh sách toàn bộ đơn hàng | Admin |
| **PUT** | `/api/orders/:id/pay` | Nút trực tiếp duyệt thanh toán | Admin |
| **PUT** | `/api/orders/:id/deliver` | Nút trực tiếp xác nhận giao hàng | Admin |
| **POST** | `/api/payment/create-qr` | Sinh mã VietQR động chuẩn Napas 247 | Công khai |
| **POST** | `/api/ai/chat` | AI Stylist Gemini 1.5 Flash tư vấn bán hàng (RAG) | Công khai |
