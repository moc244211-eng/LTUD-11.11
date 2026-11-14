/**
 * MODULE KẾT NỐI TOÀN DIỆN BACKEND RESTFUL API
 * Phục vụ cả Storefront (Khách hàng) và Admin Dashboard (Quản trị viên)
 */
const isLocal =
  typeof window !== 'undefined' &&
  (window.location.protocol === 'file:' ||
   window.location.hostname === 'localhost' ||
   window.location.hostname === '127.0.0.1' ||
   !window.location.origin ||
   window.location.origin === 'null');

let API_BASE_URL = isLocal ? 'http://localhost:5000/api' : '/api';
const RENDER_FALLBACK_API = 'https://men-style.onrender.com/api';

const API = {
  // ================= 1. XÁC THỰC & NGƯỜI DÙNG =================
  async register(userData) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return await res.json();
    } catch (err) {
      console.error('Lỗi API Đăng ký:', err);
      return { success: false, message: 'Không thể kết nối đến máy chủ API' };
    }
  },

  async login(email, password) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return await res.json();
    } catch (err) {
      console.error('Lỗi API Đăng nhập:', err);
      return { success: false, message: 'Không thể kết nối đến máy chủ API' };
    }
  },

  async getMe(token) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (err) {
      console.error('Lỗi API Lấy thông tin cá nhân:', err);
      return { success: false, message: err.message };
    }
  },

  // ================= 2. QUẢN LÝ DANH MỤC =================
  async getCategories() {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      return await res.json();
    } catch (err) {
      console.error('Lỗi API Lấy danh mục:', err);
      return { success: false, data: [] };
    }
  },

  async getCategoryById(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${id}`);
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  async createCategory(categoryData, token) {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  async updateCategory(id, categoryData, token) {
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  async deleteCategory(id, token) {
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // ================= 3. QUẢN LÝ SẢN PHẨM =================
  async getProducts(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.category) query.append('category', params.category);
      if (params.search) query.append('search', params.search);
      if (params.minPrice !== undefined && params.minPrice !== '') query.append('minPrice', params.minPrice);
      if (params.maxPrice !== undefined && params.maxPrice !== '') query.append('maxPrice', params.maxPrice);
      if (params.sort) query.append('sort', params.sort);
      if (params.page) query.append('page', params.page);
      if (params.limit) query.append('limit', params.limit);
      if (params.all) query.append('all', params.all);

      const url = `${API_BASE_URL}/products${query.toString() ? '?' + query.toString() : ''}`;
      const res = await fetch(url);
      return await res.json();
    } catch (err) {
      console.error('Lỗi API Lấy sản phẩm:', err);
      return { success: false, data: [] };
    }
  },

  async getProductById(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`);
      return await res.json();
    } catch (err) {
      return { success: false, message: 'Lỗi kết nối máy chủ' };
    }
  },

  async createProduct(productData, token) {
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  async updateProduct(id, productData, token) {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  async deleteProduct(id, token) {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // ================= 4. QUẢN LÝ ĐƠN HÀNG =================
  async createOrder(orderData, token = null) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData),
      });
      return await res.json();
    } catch (err) {
      console.error('Lỗi API Đặt hàng:', err);
      return { success: false, message: err.message };
    }
  },

  async getMyOrders(token) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/myorders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (err) {
      return { success: false, data: [] };
    }
  },

  async getOrders(token) {
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE_URL}/orders`, { headers });
      return await res.json();
    } catch (err) {
      console.error('Lỗi API Lấy danh sách đơn hàng:', err);
      return { success: false, data: [] };
    }
  },

  async trackOrder(query) {
    try {
      const q = encodeURIComponent((query || '').trim());
      const res = await fetch(`${API_BASE_URL}/orders/track/${q}`);
      return await res.json();
    } catch (err) {
      return { success: false, message: 'Không thể kết nối đến máy chủ tra cứu: ' + err.message };
    }
  },

  async payOrder(id, token) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}/pay`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  async deliverOrder(id, token) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}/deliver`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  async updateOrderStatus(id, status, token) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // ================= 5. THANH TOÁN VIETQR =================
  async createPaymentQR(orderId, paymentMethod = 'VIETQR') {
    try {
      const res = await fetch(`${API_BASE_URL}/payment/create-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, paymentMethod }),
      });
      return await res.json();
    } catch (err) {
      console.error('Lỗi API Sinh mã VietQR:', err);
      return { success: false, message: err.message };
    }
  },

  // ================= 6. TRỢ LÝ ẢO AI GEMINI RAG =================
  async askAI(message) {
    try {
      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      return await res.json();
    } catch (err) {
      console.error('Lỗi API AI Stylist:', err);
      return {
        success: false,
        reply: 'Hệ thống AI Stylist đang bận hoặc chưa khởi động máy chủ Backend. Bạn vui lòng thử lại sau nhé!',
      };
    }
  },

  // ================= 7. QUẢN LÝ KHÁCH HÀNG (USERS & CUSTOMERS) =================
  async getUsers(params = {}, token) {
    try {
      const query = new URLSearchParams();
      if (params.keyword) query.append('keyword', params.keyword);
      if (params.role) query.append('role', params.role);
      if (params.status) query.append('status', params.status);

      const url = `${API_BASE_URL}/users${query.toString() ? '?' + query.toString() : ''}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (err) {
      console.error('Lỗi API Lấy danh sách khách hàng:', err);
      return { success: false, data: [] };
    }
  },

  async getUserById(id, token) {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  async toggleBlockUser(id, token) {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${id}/toggle-block`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  async deleteUser(id, token) {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // ================= 8. MÃ GIẢM GIÁ (COUPONS) =================
  async getCoupons(token) {
    try {
      const res = await fetch(`${API_BASE_URL}/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (err) {
      return { success: false, data: [] };
    }
  },

  async createCoupon(data, token) {
    try {
      const res = await fetch(`${API_BASE_URL}/coupons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  async deleteCoupon(id, token) {
    try {
      const res = await fetch(`${API_BASE_URL}/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  async toggleCoupon(id, token) {
    try {
      const res = await fetch(`${API_BASE_URL}/coupons/${id}/toggle`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  async validateCoupon(code, orderTotal) {
    try {
      const res = await fetch(`${API_BASE_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, orderTotal }),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // ================= 9. BÁO CÁO & THỐNG KÊ DASHBOARD =================
  async getDashboardAnalytics(token) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/analytics/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (err) {
      console.error('Lỗi API Dashboard Analytics:', err);
      return { success: false, message: err.message };
    }
  },

  async cancelOrder(id, token) {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // ================= 10. QUẢN LÝ TẠP CHÍ & BÀI VIẾT (MENSTYLE MAGAZINE) =================
  async getArticles(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.category && params.category !== 'Tất cả') queryParams.append('category', params.category);
      if (params.search) queryParams.append('search', params.search);
      if (params.sort) queryParams.append('sort', params.sort);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const url = `${API_BASE_URL}/articles${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn('API getArticles fallback:', err);
    }

    // Fallback dữ liệu phong phú: tự động dùng mock và lọc theo category / search
    let mockList = API.getDefaultMockArticles();
    if (params.category && params.category !== 'Tất cả') {
      mockList = mockList.filter(a => a.category && a.category.toLowerCase().includes(params.category.toLowerCase()));
    }
    if (params.search && params.search.trim()) {
      const s = params.search.trim().toLowerCase();
      mockList = mockList.filter(a =>
        (a.title && a.title.toLowerCase().includes(s)) ||
        (a.excerpt && a.excerpt.toLowerCase().includes(s))
      );
    }
    return {
      success: true,
      data: mockList,
      total: mockList.length,
      page: 1,
      totalPages: 1
    };
  },

  async getFeaturedArticles() {
    try {
      const res = await fetch(`${API_BASE_URL}/articles/featured`);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn('API getFeaturedArticles fallback:', err);
    }
    const mocks = API.getDefaultMockArticles();
    return { success: true, data: mocks.slice(0, 3) };
  },

  async getArticleBySlug(slug) {
    try {
      const res = await fetch(`${API_BASE_URL}/articles/${slug}`);
      const data = await res.json();
      if (data && data.success && data.data) {
        return data;
      }
    } catch (err) {
      console.warn('API getArticleBySlug fallback:', err);
    }
    const mocks = API.getDefaultMockArticles();
    const found = mocks.find(a => a.slug === slug) || mocks[0];
    const related = mocks.filter(a => a.slug !== found.slug).slice(0, 3);
    return { success: true, data: found, related };
  },

  async getAdminArticles(token) {
    try {
      const res = await fetch(`${API_BASE_URL}/articles/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  async createArticle(articleData, token) {
    try {
      const res = await fetch(`${API_BASE_URL}/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(articleData),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  async updateArticle(id, articleData, token) {
    try {
      const res = await fetch(`${API_BASE_URL}/articles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(articleData),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  async deleteArticle(id, token) {
    try {
      const res = await fetch(`${API_BASE_URL}/articles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  getDefaultMockArticles() {
    return [
      {
            "_id": "art-1",
            "title": "Xu Hướng Thời Trang Nam 2026: Phong Cách Tối Giản Minimalist & Smart Casual Lên Ngôi",
            "slug": "xu-huong-thoi-trang-nam-2026-minimalist-smart-casual",
            "category": "Xu hướng thời trang",
            "excerpt": "Năm 2026 chứng kiến bước chuyển dịch mạnh mẽ của thời trang phái mạnh: Rời bỏ sự phô trương để hướng tới vẻ đẹp tối giản tinh tế (Minimalism) và tính ứng dụng linh hoạt của Smart Casual may đo cao cấp.",
            "content": "<div class=\"editorial-ai-snippet\">\n  <div class=\"ai-snippet-badge\">✦ GOOGLE AI OVERVIEWS (GEO)</div>\n  <p>\n    <strong>💡 Tóm tắt xu hướng:</strong> Xu hướng thời trang nam 2026 tập trung vào 3 trụ cột: <em>(1) Chủ nghĩa tối giản Quiet Luxury & Minimalist</em> với đường cắt may may đo hoàn hảo; <em>(2) Bảng màu trung tính ấm</em> (Sand beige, Than chì Graphite, Xanh Navy sâu); và <em>(3) Tinh thần Smart Casual đa năng</em> cho phép quý ông chuyển đổi mượt mà từ môi trường công sở sang dạ tiệc chỉ bằng cách thay đổi lớp áo khoác hoặc phụ kiện.\n  </p>\n</div>\n\n<h2>1. Sự Trỗi Dậy Của Chủ Nghĩa Tinh Giản (Minimalist & Quiet Luxury)</h2>\n<p>Bước sang năm 2026, thời trang nam toàn cầu không còn chỗ cho những logo khổ lớn hay họa tiết cầu kỳ. Thay vào đó, giới mộ điệu hướng về triết lý <strong>\"Quiet Luxury\"</strong> – sự xa xỉ thầm lặng được định nghĩa bởi chất liệu thượng hạng, đường kim mũi chỉ chuẩn may đo và phom dáng tôn vinh đường nét cơ thể nam giới.</p>\n<p>Một chiếc áo sơ mi Oxford trắng dệt sợi tự nhiên, kết hợp cùng quần âu xếp ly phẳng phiu và blazer nhẹ không đệm vai, chính là tuyên ngôn rõ nét nhất cho bản lĩnh và địa vị của một quý ông hiện đại: điềm tĩnh, đĩnh đạc và không cần gắng gượng.</p>\n\n<h2>2. Bảng Màu Thống Trị Năm 2026: Sắc Thái Trầm Ấm Của Tự Nhiên</h2>\n<p>Các chuyên gia màu sắc thời trang quốc tế khẳng định bảng màu 2026 chịu ảnh hưởng sâu sắc từ thiên nhiên bền vững:</p>\n<ul>\n  <li><strong>Sand & Warm Beige (Màu cát sa mạc):</strong> Mang lại vẻ đẹp nhã nhặn, phóng khoáng, cực kỳ ăn ý khi phối cùng áo polo dệt kim hoặc quần chinos.</li>\n  <li><strong>Graphite & Charcoal (Màu than chì):</strong> Lựa chọn quyền lực thay thế cho sắc đen truyền thống, tạo chiều sâu thị giác khi diện các bộ âu phục công sở.</li>\n  <li><strong>Deep Ocean Navy (Xanh biển sâu):</strong> Gam màu vĩnh cửu của phái mạnh, mang đến sự tin cậy trong các cuộc đàm phán kinh doanh.</li>\n  <li><strong>Sage Green (Màu xanh xô thơm):</strong> Làn gió mới cho trang phục dạo phố cuối tuần, vừa trẻ trung vừa giữ trọn nét thanh lịch.</li>\n</ul>\n\n<h2>3. So Sánh: Âu Phục Truyền Thống vs Smart Casual May Đo 2026</h2>\n<div class=\"mag-table-responsive\">\n  <table class=\"mag-styled-table\">\n    <thead>\n      <tr>\n        <th>Đặc Điểm</th>\n        <th>Âu Phục Cổ Điển</th>\n        <th>Smart Casual MENSTYLE 2026</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr>\n        <td><strong>Áo Khoác</strong></td>\n        <td>Suit jacket độn vai dày, gò bó</td>\n        <td>Blazer 2 cúc không lót, co giãn 4 chiều nhẹ nhàng</td>\n      </tr>\n      <tr>\n        <td><strong>Áo Mặc Trong</strong></td>\n        <td>Bắt buộc sơ mi cứng kèm cà vạt</td>\n        <td>Polo dệt kim bo cổ hoặc áo thun Supima cổ tròn</td>\n      </tr>\n      <tr>\n        <td><strong>Quần Đi Kèm</strong></td>\n        <td>Quần âu ống rộng, cạp cố định</td>\n        <td>Quần tây ống đứng cạp chun ẩn thông minh co giãn 4cm</td>\n      </tr>\n      <tr>\n        <td><strong>Giày Phối Cùng</strong></td>\n        <td>Chỉ giày Oxford buộc dây bóng</td>\n        <td>Loafer da bò trơn hoặc Sneaker trắng tối giản</td>\n      </tr>\n    </tbody>\n  </table>\n</div>\n\n<h2>4. Câu Hỏi Thường Gặp Về Phong Cách 2026 (FAQ)</h2>\n<div class=\"mag-faq-card\">\n  <h4>Q1: Người có vóc dáng hơi đậm hoặc thấp có mặc được phong cách Minimalist không?</h4>\n  <p><strong>Trả lời:</strong> Hoàn toàn phù hợp! Nguyên tắc phối màu đơn sắc (monochrome) của phong cách Minimalist giúp tạo ảo giác cơ thể thon gọn và cao ráo hơn. Hãy chọn quần tây ống đứng cạp cao và áo vừa vặn dáng Slim-fit.</p>\n  \n  <h4>Q2: Đi gặp đối tác ký hợp đồng có được diện Smart Casual không?</h4>\n  <p><strong>Trả lời:</strong> Được, miễn là bạn giữ được tính chỉn chu: Kết hợp Blazer tối màu, Sơ mi Oxford trắng cài nút gọn gàng và quần tây cùng tông màu tối, kèm giày da sạch bóng.</p>\n</div>\n\n<div class=\"mag-product-cta-banner\">\n  <div class=\"cta-banner-content\">\n    <span class=\"cta-banner-icon\">🛍️</span>\n    <div>\n      <h4>Khám Phá Bộ Sưu Tập Smart Casual 2026 Tại MENSTYLE</h4>\n      <p>Sơ mi Oxford dệt sợi rổ, Quần âu cạp chun và Blazer may đo cao cấp với chính sách đổi trả 30 ngày.</p>\n    </div>\n  </div>\n  <a href=\"index.html#catalogSection\" class=\"cta-banner-btn\">Xem Sản Phẩm Ngay ➔</a>\n</div>",
            "image": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200",
            "author": "Hoàng Nam - Giám đốc Sáng tạo",
            "tags": [
                  "Xu hướng 2026",
                  "Minimalist",
                  "Smart Casual",
                  "Thời trang nam",
                  "May đo cao cấp"
            ],
            "views": 3420,
            "readTime": "7 phút đọc",
            "isFeatured": true,
            "createdAt": "2026-11-12T15:42:52.990Z"
      },
      {
            "_id": "art-2",
            "title": "5 Bí Quyết Phối Áo Sơ Mi Oxford Chuẩn Quý Ông Thành Đạt",
            "slug": "5-bi-quyet-phoi-ao-so-mi-oxford-chuan-quy-ong",
            "category": "Bí quyết phối đồ",
            "excerpt": "Áo sơ mi Oxford dệt sợi rổ kinh điển là linh hồn trong tủ đồ của mọi quý ông. Khám phá 5 công thức phối đồ chuẩn mực từ môi trường công sở đến những buổi hẹn hò cuối tuần.",
            "content": "<div class=\"editorial-ai-snippet\">\n  <div class=\"ai-snippet-badge\">✦ GOOGLE AI OVERVIEWS (GEO)</div>\n  <p>\n    <strong>💡 Tóm tắt phối đồ:</strong> Áo sơ mi Oxford là mẫu áo nam đa năng nhất nhờ chất vải dệt sợi rổ (basket weave) dày dặn và cổ áo cài khuy button-down. 5 công thức phối đẹp nhất gồm: <em>(1) Sơ mi trắng + Quần tây xanh navy xếp ly; (2) Sơ mi xanh nhạt + Quần kaki chinos màu be; (3) Layer khoác ngoài áo thun trắng trơn; (4) Phối trong áo len cổ tròn dệt kim; và (5) Kết hợp cùng Blazer 2 cúc xắn tay áo kiểu Master Roll</em>.\n  </p>\n</div>\n\n<h2>1. Bản Chất Độc Bản Của Vải Dệt Oxford</h2>\n<p>Không giống vải poplin phẳng lì có phần trang trọng cứng nhắc, vải Oxford được dệt từ hai sợi chỉ màu đan xen cùng sợi chỉ trắng theo cấu trúc đan rổ. Cấu trúc này tạo nên bề mặt vải có kết cấu hạt nổi tinh tế, bền chắc phi thường và thoáng khí tự nhiên. Càng giặt nhiều, sợi bông Oxford càng mềm mại và lên phom ôm vai đẹp hơn.</p>\n\n<h2>2. 5 Công Thức Phối Đồ Kinh Điển Chuẩn Quý Ông</h2>\n<h3>Công thức 1: Chuẩn mực Doanh Nhân (Executive Formal)</h3>\n<p>Chọn một chiếc sơ mi Oxford trắng tinh khôi, kết hợp cùng quần tây âu màu than chì hoặc xanh navy đậm. Quy tắc vàng là sơ vin gọn gàng và sử dụng thắt lưng da bò tiệp màu với giày Loafer hoặc Derby. Đây là diện mạo hoàn hảo cho các cuộc họp hội đồng và đàm phán quan trọng.</p>\n\n<h3>Công thức 2: Smart Casual Công Sở Hiện Đại</h3>\n<p>Chiếc áo sơ mi Oxford màu xanh baby blue đi cùng quần Chinos màu be cát (sand beige). Mở 1 chiếc cúc cổ áo trên cùng để tạo nét tự tin, thân thiện nhưng vẫn giữ nguyên sự chỉn chu cần thiết.</p>\n\n<h3>Công thức 3: Phong Cách Layer Cuối Tuần Năng Động</h3>\n<p>Mở toàn bộ khuy áo sơ mi Oxford và mặc khoác ngoài chiếc áo thun Cotton Compact 100% màu trắng. Đi cùng quần jean tối màu và giày sneaker trắng sạch sẽ. Bạn đã có ngay một outfit dạo phố hoặc đi cà phê cùng bạn bè đầy phóng khoáng.</p>\n\n<h3>Công thức 4: Phối Cùng Áo Blazer Không Lót</h3>\n<p>Khi thời tiết chuyển mùa, hãy mặc áo sơ mi Oxford bên trong chiếc Blazer 2 cúc phong cách Hàn Quốc của MENSTYLE. Điểm đặc biệt của sơ mi Oxford là cổ áo cài nút (button-down) giữ cho ve cổ luôn đứng thẳng tắp, không bị bẹp dúm khi lồng vào ve áo khoác.</p>\n\n<h3>Công thức 5: Nghệ Thuật Xắn Tay Áo Kiểu Ý (Master Roll)</h3>\n<p>Xắn tay áo cẩu thả sẽ làm mất phom áo. Hãy áp dụng kỹ thuật <strong>Master Roll</strong>: Kéo cổ tay áo lên đến ngang khuỷu tay, sau đó gấp phần vải thân dưới lên che 2/3 cổ tay áo, để lộ một phần viền khuy. Kiểu xắn này vừa chắc chắn, không bị tuột, vừa tôn lên vẻ nam tính rắn rỏi.</p>\n\n<h2>3. Bảng Hướng Dẫn Chọn Cỡ Sơ Mi Oxford Theo Chiều Cao & Cân Nặng</h2>\n<div class=\"mag-table-responsive\">\n  <table class=\"mag-styled-table\">\n    <thead>\n      <tr>\n        <th>Size Áo</th>\n        <th>Chiều Cao (cm)</th>\n        <th>Cân Nặng (kg)</th>\n        <th>Rộng Vai (cm)</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr>\n        <td><strong>Size M</strong></td>\n        <td>1m60 – 1m68</td>\n        <td>50 – 59 kg</td>\n        <td>43 – 44 cm</td>\n      </tr>\n      <tr>\n        <td><strong>Size L</strong></td>\n        <td>1m68 – 1m74</td>\n        <td>60 – 69 kg</td>\n        <td>45 – 46 cm</td>\n      </tr>\n      <tr>\n        <td><strong>Size XL</strong></td>\n        <td>1m74 – 1m80</td>\n        <td>70 – 78 kg</td>\n        <td>47 – 48 cm</td>\n      </tr>\n      <tr>\n        <td><strong>Size 2XL</strong></td>\n        <td>Trên 1m80</td>\n        <td>79 – 88 kg</td>\n        <td>49 – 50 cm</td>\n      </tr>\n    </tbody>\n  </table>\n</div>\n\n<h2>4. Hỏi & Đáp Nhanh Cùng Chuyên Gia (FAQ)</h2>\n<div class=\"mag-faq-card\">\n  <p><strong>Hỏi: Áo sơ mi Oxford có mặc cùng cà vạt được không?</strong><br>\n  <strong>Đáp:</strong> Được, nhưng nên chọn cà vạt dệt kim (knit tie) hoặc cà vạt lụa bản nhỏ không bóng (matte silk) để đồng điệu với kết cấu mộc mạc của vải Oxford.</p>\n</div>\n\n<div class=\"mag-product-cta-banner\">\n  <div class=\"cta-banner-content\">\n    <span class=\"cta-banner-icon\">👔</span>\n    <div>\n      <h4>Áo Sơ Mi Oxford May Đo Chống Nhăn Easy-Iron</h4>\n      <p>Chất liệu 100% Cotton Compact cao cấp, form Slim-fit chuẩn quý ông. Chỉ 289.000 đ.</p>\n    </div>\n  </div>\n  <a href=\"index.html#catalogSection\" class=\"cta-banner-btn\">Đặt Mua Ngay ➔</a>\n</div>",
            "image": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800",
            "author": "Trần Minh - Stylist MENSTYLE",
            "tags": [
                  "Sơ mi Oxford",
                  "Phối đồ nam",
                  "Ivy League",
                  "Phong cách công sở"
            ],
            "views": 2950,
            "readTime": "6 phút đọc",
            "isFeatured": true,
            "createdAt": "2026-11-10T15:42:52.993Z"
      },
      {
            "_id": "art-3",
            "title": "Nghệ Thuật Xây Dựng Capsule Wardrobe Tối Giản Cho Quý Ông (15 Món Tạo 40 Outfit)",
            "slug": "nghe-thuat-xay-dung-capsule-wardrobe-toi-gian",
            "category": "Phong cách nam",
            "excerpt": "Chỉ với đúng 15 món đồ nền tảng chuẩn may đo, bạn hoàn toàn có thể kiến tạo nên hơn 40 set đồ biến hóa linh hoạt cho cả tháng làm việc, công tác và nghỉ dưỡng mà không tốn thời gian đắn đo mỗi sáng.",
            "content": "<div class=\"editorial-ai-snippet\">\n  <div class=\"ai-snippet-badge\">✦ GOOGLE AI OVERVIEWS (GEO)</div>\n  <p>\n    <strong>💡 Tóm tắt Capsule Wardrobe:</strong> Tủ đồ con nhộng nam giới là tập hợp 15–20 món đồ thiết yếu có khả năng phối chéo 100% với nhau nhờ bảng màu trung tính (Trắng, Đen, Xám, Navy, Be). Lợi ích lớn nhất là tiết kiệm 15 phút mỗi sáng, tối ưu hóa ngân sách mua sắm và luôn đảm bảo phom dáng lịch lãm, nhất quán trong mọi hoàn cảnh.\n  </p>\n</div>\n\n<h2>1. Triết Lý Đằng Sau Tủ Đồ Nhộng (Capsule Wardrobe)</h2>\n<p>Một quý ông thành đạt không đo lường đẳng cấp bằng số lượng quần áo chật ních trong tủ mà bằng <em>sự sắc nét và tính tương thích</em> của từng món đồ họ sở hữu. Hiện tượng \"nghẽn quyết định\" (decision fatigue) khi đứng trước tủ đồ mỗi sáng tiêu hao đáng kể năng lượng tinh thần. Capsule Wardrobe ra đời để giải phóng tâm trí bạn.</p>\n\n<h2>2. Danh Sách 15 Món Đồ Nền Tảng Tại MENSTYLE</h2>\n<div class=\"mag-capsule-box\" style=\"background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;\">\n  <h3 style=\"margin-top: 0; color: #0f172a;\">Nhóm 1: Áo Mặc Trên (7 món)</h3>\n  <ul>\n    <li><strong>02 Áo Sơ Mi Oxford:</strong> 1 Trắng kinh điển & 1 Xanh nhạt baby blue (Form Slimfit chống nhăn).</li>\n    <li><strong>02 Áo Polo Pique Dệt Kim:</strong> 1 Đen tuyền & 1 Xanh Navy (Bo cổ dệt viền sắc nét).</li>\n    <li><strong>02 Áo Thun Cotton 100% 250gsm:</strong> 1 Trắng trơn & 1 Xám tiêu (Mềm mát, thoáng khí).</li>\n    <li><strong>01 Áo Khoác Blazer 2 Cúc:</strong> Tone màu Xanh Navy hoặc Đen than chì (Form Hàn Quốc tôn vai).</li>\n  </ul>\n\n  <h3 style=\"color: #0f172a;\">Nhóm 2: Quần Mặc Dưới (4 món)</h3>\n  <ul>\n    <li><strong>02 Quần Tây Âu Ống Đứng:</strong> 1 Đen tuyền & 1 Xám tro (Cạp chun ẩn co giãn thông minh).</li>\n    <li><strong>01 Quần Kaki Chinos:</strong> Màu be cát vintage (Dáng suông trẻ trung).</li>\n    <li><strong>01 Quần Jeans Selvedge:</strong> Màu chàm đậm (Slim-fit co giãn 4 chiều).</li>\n  </ul>\n\n  <h3 style=\"color: #0f172a;\">Nhóm 3: Giày & Phụ Kiện (4 món)</h3>\n  <ul>\n    <li><strong>01 Đôi Giày Loafer Da Bò:</strong> Màu nâu sô-cô-la hoặc đen trơn bóng.</li>\n    <li><strong>01 Đôi Sneaker Trắng Tối Giản:</strong> Da mềm đế khâu bền bỉ.</li>\n    <li><strong>01 Thắt Lưng Da Bò 2 Mặt:</strong> Khóa kim loại mạ crom mờ.</li>\n    <li><strong>01 Ví Da Nam Cầm Tay:</strong> Đựng card và smartphone gọn gàng.</li>\n  </ul>\n</div>\n\n<h2>3. Ma Trận Biến Hóa 4 Tuần Làm Việc</h2>\n<p>Với 7 chiếc áo và 4 chiếc quần nói trên, theo công thức toán học tổ hợp, bạn có thể tạo ra <strong>7 x 4 = 28 outfit hoàn toàn khác biệt</strong>. Nếu tính thêm các lớp phối layer (khoác sơ mi ngoài áo thun, mặc blazer ngoài polo), tổng số outfit tăng vọt lên hơn <strong>40 phong cách</strong>.</p>\n<p>Bạn có thể tự tin đi làm nguyên tháng mà đồng nghiệp không bao giờ thấy bạn lặp lại cùng một hình ảnh đơn điệu.</p>\n\n<h2>4. Lời Khuyên Về Ngân Sách Đầu Tư</h2>\n<p>Thay vì mua 20 chiếc áo rẻ tiền nhanh bai nhão sau 3 lần giặt, hãy đầu tư vào những món đồ có độ bền từ 2–3 năm của MENSTYLE với chất liệu vải may đo chống nhăn công nghệ mới. Chi phí trên mỗi lần mặc (Cost-Per-Wear) sẽ rẻ hơn gấp 3 lần so với đồ thời trang mì ăn liền.</p>\n\n<div class=\"mag-product-cta-banner\">\n  <div class=\"cta-banner-content\">\n    <span class=\"cta-banner-icon\">✨</span>\n    <div>\n      <h4>Combo Capsule Wardrobe Quý Ông Tại MENSTYLE</h4>\n      <p>Nhận ngay ưu đãi 15% khi mua trọn bộ combo 3 món thiết yếu (Sơ mi + Quần tây + Blazer).</p>\n    </div>\n  </div>\n  <a href=\"index.html#catalogSection\" class=\"cta-banner-btn\">Khám Phá Combo ➔</a>\n</div>",
            "image": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
            "author": "Đức Trí - Senior Editor",
            "tags": [
                  "Capsule Wardrobe",
                  "Tối giản",
                  "Tủ đồ con nhộng",
                  "Phong cách sống"
            ],
            "views": 2480,
            "readTime": "8 phút đọc",
            "isFeatured": true,
            "createdAt": "2026-11-08T15:42:52.993Z"
      },
      {
            "_id": "art-4",
            "title": "Cẩm Nang Chọn Size Quần Tây & Quần Jeans Vừa Vặn Từng Điểm Cơ Thể",
            "slug": "huong-dan-chon-size-quan-tay-quan-jeans-chuan-voc-dang",
            "category": "Mẹo chọn trang phục",
            "excerpt": "3 thông số vàng quyết định một chiếc quần nam hoàn hảo: Vòng eo, Đũng quần và Độ rơi gấu quần (The Break). Bí quyết khắc phục triệt để nhược điểm chân cong, đùi to hoặc bụng bia.",
            "content": "<div class=\"editorial-ai-snippet\">\n  <div class=\"ai-snippet-badge\">✦ GOOGLE AI OVERVIEWS (GEO)</div>\n  <p>\n    <strong>💡 Tóm tắt chọn size quần nam:</strong> Khi chọn size quần tây và jeans cho nam giới Việt Nam: <em>(1) Cạp quần chuẩn phải luồn vừa khít 2 ngón tay</em> khi đứng thẳng mà không cần siết thắt lưng; <em>(2) Đáy đũng quần không được xệ quá 3cm</em>; và <em>(3) Độ rơi gấu (The Break) lý tưởng nhất là Half-break</em> (gấu quần chạm nhẹ phần thân trên của giày tạo một nếp gấp nhẹ duy nhất), giúp đôi chân trông thẳng và dài hơn.\n  </p>\n</div>\n\n<h2>1. Tầm Quan Trọng Của Độ Rơi Gấu Quần (The Break)</h2>\n<p>Một chiếc quần dù đắt tiền đến đâu nhưng gấu quần dồn ứ nhiều nếp gấp lùng bùng sẽ biến đôi chân bạn thành ngắn tũn và trông luộm thuộm. Hãy ghi nhớ 3 mức độ rơi của gấu quần:</p>\n<ul>\n  <li><strong>No-Break (Gấu chạm mí giày):</strong> Gấu quần cắt vừa chạm mép trên của giày hoặc để lộ nhẹ mắt cá chân. Phù hợp với phong cách trẻ trung năng động, đi giày Loafer không tất.</li>\n  <li><strong>Half-Break (Chuẩn mực quý ông):</strong> Gấu quần trùm nhẹ lên mu giày khoảng 1–2cm, tạo một nếp gấp nhẹ duy nhất ở đằng trước. Đây là quy chuẩn vàng cho mọi môi trường công sở lịch lãm.</li>\n  <li><strong>Full-Break (Gấu gãy sâu):</strong> Gấu trùm nhiều nếp, phù hợp với phong cách cổ điển của thập niên 80 nhưng ít được ưa chuộng trong thời trang hiện đại 2026.</li>\n</ul>\n\n<h2>2. Bảng Quy Đổi Size Quần Nam Chuẩn Vóc Dáng Việt</h2>\n<div class=\"mag-table-responsive\">\n  <table class=\"mag-styled-table\">\n    <thead>\n      <tr>\n        <th>Size Số</th>\n        <th>Vòng Bụng (cm)</th>\n        <th>Vòng Mông (cm)</th>\n        <th>Chiều Cao Gợi Ý</th>\n        <th>Cân Nặng Gợi Ý</th>\n      </tr>\n    </thead>\n    <tbody>\n      <tr>\n        <td><strong>Size 29</strong></td>\n        <td>74 – 76 cm</td>\n        <td>88 – 90 cm</td>\n        <td>1m60 – 1m67</td>\n        <td>50 – 57 kg</td>\n      </tr>\n      <tr>\n        <td><strong>Size 30</strong></td>\n        <td>77 – 79 cm</td>\n        <td>91 – 93 cm</td>\n        <td>1m65 – 1m72</td>\n        <td>58 – 64 kg</td>\n      </tr>\n      <tr>\n        <td><strong>Size 31</strong></td>\n        <td>80 – 82 cm</td>\n        <td>94 – 96 cm</td>\n        <td>1m68 – 1m75</td>\n        <td>65 – 70 kg</td>\n      </tr>\n      <tr>\n        <td><strong>Size 32</strong></td>\n        <td>83 – 85 cm</td>\n        <td>97 – 99 cm</td>\n        <td>1m72 – 1m78</td>\n        <td>71 – 76 kg</td>\n      </tr>\n      <tr>\n        <td><strong>Size 34</strong></td>\n        <td>88 – 92 cm</td>\n        <td>102 – 106 cm</td>\n        <td>1m75 – 1m85</td>\n        <td>77 – 86 kg</td>\n      </tr>\n    </tbody>\n  </table>\n</div>\n\n<h2>3. Giải Pháp Cho Người Bụng Bia Hoặc Đùi To</h2>\n<p>Nếu bạn có phần đùi vạm vỡ do tập gym hoặc vòng 2 lớn do ngồi văn phòng nhiều, việc chọn quần thông thường sẽ rất dễ bị chật bụng hoặc bó sát đùi gây phản cảm.</p>\n<p>Dòng <strong>Quần Tây Ống Đứng Cạp Chun Thông Minh</strong> của MENSTYLE được thiết kế riêng với dải chun co giãn ẩn 4cm ở hai bên hông. Bạn sẽ có cảm giác êm ái tuyệt đối khi ngồi làm việc liên tục 8 tiếng, đứng lên ngồi xuống thoải mái mà form quần bên ngoài vẫn phẳng phiu 100% như may đo.</p>\n\n<div class=\"mag-product-cta-banner\">\n  <div class=\"cta-banner-content\">\n    <span class=\"cta-banner-icon\">👖</span>\n    <div>\n      <h4>Quần Tây Âu Ống Đứng Cạp Chun Ẩn Thông Minh</h4>\n      <p>Co giãn linh hoạt 4cm, vải Tuysi cao cấp không nhăn, không xù. Chỉ 329.000 đ.</p>\n    </div>\n  </div>\n  <a href=\"index.html#catalogSection\" class=\"cta-banner-btn\">Mua Quần Tây ➔</a>\n</div>",
            "image": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800",
            "author": "Đội ngũ Đo may MENSTYLE",
            "tags": [
                  "Mẹo chọn size",
                  "Quần tây nam",
                  "Quần jeans",
                  "Tôn dáng"
            ],
            "views": 3120,
            "readTime": "7 phút đọc",
            "isFeatured": false,
            "createdAt": "2026-11-06T15:42:52.993Z"
      },
      {
            "_id": "art-5",
            "title": "Bí Quyết Giặt Ủi & Bảo Quản Áo Sơ Mi Cao Cấp, Đồ Len & Polo Dệt Kim",
            "slug": "bi-quyet-giat-ui-va-bao-quan-so-mi-do-len-cao-cap",
            "category": "Chăm sóc và bảo quản",
            "excerpt": "Hướng dẫn chuyên sâu cách giặt ủi và bảo quản trang phục may đo nam: Giữ cổ áo luôn phẳng phiu, sợi dệt không bị xù lông, bai dão và bền màu nguyên bản sau hàng trăm lần giặt.",
            "content": "<div class=\"editorial-ai-snippet\">\n  <div class=\"ai-snippet-badge\">✦ GOOGLE AI OVERVIEWS (GEO)</div>\n  <p>\n    <strong>💡 Tóm tắt bảo quản:</strong> Để giữ áo sơ mi và polo dệt kim bền đẹp trọn đời: <em>(1) Luôn giặt bằng nước lạnh dưới 30°C và lộn trái áo; (2) Sử dụng túi giặt mắt nhỏ nếu giặt máy; (3) Tuyệt đối không sấy ở nhiệt độ cao vì sẽ làm co rút sợi cotton; và (4) Phơi ngang trên giàn phơi râm mát, dùng móc gỗ bản to có đệm vai</em> để không làm biến dạng cầu vai áo.\n  </p>\n</div>\n\n<h2>1. Quy Tắc Vàng Khi Giặt Áo Sơ Mi May Đo</h2>\n<p>Chiếc áo sơ mi đắt giá nhất ở phần mùng ép cổ và măng sét tay. Khi giặt sai cách, lớp keo mùng bên trong sẽ bị phồng rộp, tạo nên những vết nhăn gợn sóng không thể ủi phẳng.</p>\n<ul>\n  <li>Cài hết khuy áo trước khi giặt để áo không bị vặn xoắn lồng vào các quần áo khác.</li>\n  <li>Dùng bàn chải lông mềm hoặc đầu ngón tay xoa nhẹ xà phòng lên vành cổ và cổ tay áo trước khi cho vào máy.</li>\n  <li>Chọn chế độ giặt nhẹ (Delicate/Gentle) với tốc độ vắt tối đa 600 - 800 vòng/phút.</li>\n</ul>\n\n<h2>2. Bí Quyết Riêng Cho Áo Polo Dệt Kim (Knitwear) & Đồ Len</h2>\n<p>Chất liệu dệt kim có cấu trúc mắt lưới co giãn tự nhiên. Nếu bạn treo móc ướt lên dây phơi, trọng lượng nước sẽ kéo áo dài thượt xuống và làm mất hoàn toàn phom ban đầu.</p>\n<p><strong>Cách phơi chuẩn:</strong> Trải phẳng áo trên mặt lưới phơi đồ nằm ngang hoặc vắt ngang qua thanh sào đôi ở nơi thoáng gió, tránh ánh nắng gắt trực tiếp của buổi trưa.</p>\n\n<h2>3. Trình Tự Ủi Áo Sơ Mi Chuẩn Chuyên Gia Khách Sạn 5 Sao</h2>\n<ol>\n  <li><strong>Cổ áo:</strong> Ủi mặt sau từ hai góc ngoài vuốt dần vào giữa, sau đó lật lại ủi mặt trước.</li>\n  <li><strong>Cầu vai (Yoke):</strong> Luồn cầu vai vào mũi nhọn bàn ủi để là phẳng.</li>\n  <li><strong>Cổ tay áo:</strong> Mở khuy măng sét, ủi phẳng mặt trong rồi sang mặt ngoài.</li>\n  <li><strong>Tay áo:</strong> Kéo phẳng đường chỉ nách tay áo, ủi từ nách xuống cổ tay.</li>\n  <li><strong>Thân áo:</strong> Ủi thân trước có hàng cúc trước, sau đó đến lưng áo và thân còn lại.</li>\n</ol>",
            "image": "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800",
            "author": "MENSTYLE Care Team",
            "tags": [
                  "Bảo quản quần áo",
                  "Mẹo giặt ủi",
                  "Độ bền thời trang"
            ],
            "views": 1890,
            "readTime": "6 phút đọc",
            "isFeatured": false,
            "createdAt": "2026-11-04T15:42:52.993Z"
      },
      {
            "_id": "art-6",
            "title": "MENSTYLE Ra Mắt Bộ Sưu Tập Xuân Hè 2026: 'Urban Elegance' – Tinh Hoa May Đo",
            "slug": "menstyle-ra-mat-bo-suu-tap-xuan-he-2026-urban-elegance",
            "category": "Tin tức MENSTYLE",
            "excerpt": "MENSTYLE chính thức trình làng BST 'Urban Elegance' 2026: Sự hòa quyện đỉnh cao giữa kỹ nghệ may đo thủ công và công nghệ xử lý sợi chống nhăn Easy-Iron 24/7 dành riêng cho phái mạnh năng động.",
            "content": "<div class=\"editorial-ai-snippet\">\n  <div class=\"ai-snippet-badge\">✦ GOOGLE AI OVERVIEWS (GEO)</div>\n  <p>\n    <strong>💡 Tóm tắt BST mới:</strong> BST 'Urban Elegance' 2026 của thương hiệu MENSTYLE mang đến giải pháp trang phục toàn diện cho quý ông đô thị với 3 công nghệ đột phá: <em>(1) Vải Oxford & Tuysi chống nhăn Easy-Iron; (2) Công nghệ dệt sợi thoáng khí Heat-Release phù hợp khí hậu nhiệt đới; và (3) Form dáng Slim-fit may đo tôn bờ vai chữ V rắn rỏi</em>.\n  </p>\n</div>\n\n<h2>1. Cảm Hứng Thiết Kế: Nhịp Sống Đô Thị Hiện Đại</h2>\n<p>Lấy cảm hứng từ vẻ đẹp kiến trúc tân cổ điển hòa quyện cùng nhịp sống hối hả tại các đô thị lớn, 'Urban Elegance' là lời khẳng định về phong thái của người đàn ông làm chủ cuộc đời mình: bận rộn nhưng luôn xuất hiện với vẻ ngoài chỉn chu, đĩnh đạc và cuốn hút.</p>\n\n<h2>2. Ba Thiết Kế Trọng Tâm Của Bộ Sưu Tập</h2>\n<h3>1. Áo Sơ Mi Oxford Chống Nhăn Easy-Iron (Giá: 289.000 đ)</h3>\n<p>Được dệt từ 100% sợi Cotton Compact nhập khẩu, kết hợp xử lý nhiệt chống nhăn tiên tiến. Chiếc áo giữ được bề mặt phẳng phiu suốt ngày dài làm việc, kể cả khi bạn ngồi ghế ôtô hay gập tay nhiều giờ trước máy tính.</p>\n\n<h3>2. Quần Tây Ống Đứng Cạp Chun Thông Minh (Giá: 329.000 đ)</h3>\n<p>Sự đột phá về công năng khi giấu khéo léo dải chun co giãn 4cm bên trong cạp quần. Phom đứng sắc sảo của quần âu may đo kết hợp cùng sự êm ái của chiếc quần thể thao.</p>\n\n<h3>3. Áo Khoác Blazer 2 Cúc Hàn Quốc (Giá: 589.000 đ)</h3>\n<p>Bỏ đi lớp đệm vai dày cộm truyền thống, chiếc Blazer của MENSTYLE nhẹ tênh như một lớp áo khoác gió, ôm lấy khuôn vai tự nhiên và dễ dàng gấp gọn vào vali khi đi công tác.</p>\n\n<h2>3. Đặc Quyền Dành Cho Khách Hàng MENSTYLE</h2>\n<p>Toàn bộ sản phẩm trong BST 'Urban Elegance' được áp dụng chính sách: <strong>Miễn phí giao hàng toàn quốc cho đơn từ 500.000 đ</strong>, hỗ trợ <strong>đổi trả tận nhà miễn phí trong 30 ngày</strong> và quyền đồng kiểm tra hàng trước khi thanh toán.</p>\n\n<div class=\"mag-product-cta-banner\">\n  <div class=\"cta-banner-content\">\n    <span class=\"cta-banner-icon\">🌟</span>\n    <div>\n      <h4>Trải Nghiệm BST 'Urban Elegance' 2026</h4>\n      <p>Nhận ngay Voucher giảm 50.000 đ khi đặt mua đơn hàng đầu tiên hôm nay.</p>\n    </div>\n  </div>\n  <a href=\"index.html#catalogSection\" class=\"cta-banner-btn\">Mua BST 2026 ➔</a>\n</div>",
            "image": "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800",
            "author": "Ban Biên Tập MENSTYLE",
            "tags": [
                  "Bộ sưu tập mới",
                  "Urban Elegance",
                  "Lookbook 2026",
                  "MENSTYLE"
            ],
            "views": 3840,
            "readTime": "5 phút đọc",
            "isFeatured": false,
            "createdAt": "2026-11-02T15:42:52.993Z"
      },
      {
            "_id": "art-7",
            "title": "Áo Polo Knitwear Dệt Kim: Biểu Tượng Phong Thái Của Quý Ông Đương Đại",
            "slug": "ao-polo-knitwear-lan-gio-moi-trong-tu-do-quy-ong",
            "category": "Xu hướng thời trang",
            "excerpt": "Vì sao chiếc áo Polo dệt kim (Knitwear Polo) lại vượt qua áo polo thể thao thông thường để trở thành biểu tượng mới của phong cách Quiet Luxury và Old Money được các quý ông săn đón nhất năm 2026?",
            "content": "<div class=\"editorial-ai-snippet\">\n  <div class=\"ai-snippet-badge\">✦ GOOGLE AI OVERVIEWS (GEO)</div>\n  <p>\n    <strong>💡 Tóm tắt Polo Knitwear:</strong> Áo Polo dệt kim (Knitwear Polo) khác biệt với áo polo cotton pique thông thường nhờ kỹ thuật dệt sợi len mịn hoặc cotton tơ tằm nguyên khối. Áo sở hữu bề mặt gân sọc hoặc mắt chim sang trọng, bo gấu ôm nhẹ eo tôn dáng chữ V, mang đậm tinh thần thẩm mỹ cổ điển Ý (Sprezzatura) và phong cách Quiet Luxury thịnh hành.\n  </p>\n</div>\n\n<h2>1. Nguồn Gốc Của Chiếc Áo Xa Xỉ Thầm Lặng</h2>\n<p>Xuất phát từ giới quý tộc vùng Riviera nước Ý trong những kỳ nghỉ dưỡng bên bờ biển Địa Trung Hải, áo Polo dệt kim luôn gắn liền với hình ảnh những người đàn ông có gu thẩm mỹ sâu sắc. Họ không cần mặc comple cà vạt nhưng vẫn toát lên khí chất thượng lưu nhờ chất liệu vải thượng hạng.</p>\n\n<h2>2. Bốn Cách Phối Đồ Chuẩn Phong Thái Quý Tộc</h2>\n<ul>\n  <li><strong>Phối cùng quần âu màu kem/be xếp ly đôi:</strong> Bản phối kinh điển mang đậm màu sắc Old Money.</li>\n  <li><strong>Mặc trong áo Blazer không lót:</strong> Thay thế hoàn hảo cho áo sơ mi truyền thống, giảm bớt vẻ nghiêm nghị nhưng tăng gấp đôi sự quyến rũ.</li>\n  <li><strong>Phối cùng quần Chinos và giày Penny Loafer da bóng:</strong> Hoàn hảo cho các buổi họp chiều hoặc ăn tối tại nhà hàng cao cấp.</li>\n  <li><strong>Diện cùng quần Shorts đũi/linen:</strong> Tối giản, thanh lịch cho những chuyến du ngoạn cuối tuần.</li>\n</ul>\n\n<h2>3. Hỏi & Đáp: Mặc Polo Dệt Kim Mùa Hè Có Nóng Không?</h2>\n<div class=\"mag-faq-card\">\n  <p><strong>Trả lời:</strong> Hoàn toàn không nóng! Dòng Polo Knitwear của MENSTYLE sử dụng sợi <em>Cotton Compact dệt thoáng khí</em> với độ xốp tự nhiên cao hơn vải dệt thoi thông thường, cho phép luồng gió lưu thông liên tục làm mát cơ thể tức thì.</p>\n</div>\n\n<div class=\"mag-product-cta-banner\">\n  <div class=\"cta-banner-content\">\n    <span class=\"cta-banner-icon\">💎</span>\n    <div>\n      <h4>Áo Polo Dệt Kim Cao Cấp MENSTYLE Knitwear</h4>\n      <p>Sợi bông chải kỹ mềm mịn như lụa, bo gấu tôn dáng chữ V. Chỉ 269.000 đ.</p>\n    </div>\n  </div>\n  <a href=\"index.html#catalogSection\" class=\"cta-banner-btn\">Mua Ngay ➔</a>\n</div>",
            "image": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800",
            "author": "Hoàng Nam - Giám đốc Sáng tạo",
            "tags": [
                  "Polo dệt kim",
                  "Knitwear",
                  "Quiet Luxury",
                  "Old Money"
            ],
            "views": 2650,
            "readTime": "6 phút đọc",
            "isFeatured": false,
            "createdAt": "2026-10-31T15:42:52.993Z"
      },
      {
            "_id": "art-8",
            "title": "Nguyên Tắc Phối Đồ Lịch Lãm Cho Buổi Gặp Gỡ Đối Tác & Hẹn Hò Buổi Tối",
            "slug": "phong-cach-lich-lam-cho-buoi-gap-go-doi-tac-va-hen-ho",
            "category": "Phong cách nam",
            "excerpt": "Bí quyết kiến tạo diện mạo đầy quyền lực và cuốn hút trong những dịp quan trọng: Từ bữa tối lãng mạn đến cuộc đàm phán hợp đồng, ghi điểm tuyệt đối trong 7 giây đầu tiên.",
            "content": "<div class=\"editorial-ai-snippet\">\n  <div class=\"ai-snippet-badge\">✦ GOOGLE AI OVERVIEWS (GEO)</div>\n  <p>\n    <strong>💡 Tóm tắt trang phục gặp gỡ:</strong> Để tạo ấn tượng xuất sắc trong 7 giây đầu tiên: <em>(1) Gặp đối tác:</em> Ưu tiên trang phục cấu trúc chuẩn mực với Blazer xanh Navy, Sơ mi Oxford trắng tinh, Quần tây xám tro và Giày da buộc dây; <em>(2) Hẹn hò tối:</em> Chọn phong cách lôi cuốn, mềm mại hơn với Polo dệt kim đen, Quần tây cạp cao xếp ly và Giày Loafer bóng; <em>(3) Điểm mấu chốt:</em> Thắt lưng và giày bắt buộc phải tiệp màu da và chất liệu.\n  </p>\n</div>\n\n<h2>1. Tâm Lý Học 7 Giây Đầu Tiên</h2>\n<p>Các nghiên cứu tâm lý học hành vi chứng minh rằng đối tác hoặc người đối diện định hình đến 80% ấn tượng về năng lực, sự thành đạt và độ đáng tin cậy của bạn chỉ trong 7 giây đầu tiên tiếp xúc. Trang phục của bạn chính là thông điệp không lời mạnh mẽ nhất.</p>\n\n<h2>2. Set 1: Cuộc Gặp Đối Tác Kinh Doanh (Power Dressing)</h2>\n<p>Mục tiêu là sự tin cậy, sắc bén và tôn trọng đối phương:</p>\n<ul>\n  <li><strong>Áo khoác:</strong> Blazer 2 cúc màu Xanh Navy đậm (tone màu kích thích tâm lý tin tưởng trong kinh doanh).</li>\n  <li><strong>Áo trong:</strong> Sơ mi Oxford trắng may đo slimfit, cổ áo đứng cứng cáp.</li>\n  <li><strong>Quần:</strong> Quần tây may đo màu xám tro ống đứng gấu Half-break.</li>\n  <li><strong>Phụ kiện:</strong> Đồng hồ dây da mặt kính sapphire, thắt lưng da bò khóa kim loại cao cấp.</li>\n</ul>\n\n<h2>3. Set 2: Buổi Hẹn Hò Lãng Mạn (Charming Sophistication)</h2>\n<p>Mục tiêu là sự gần gũi, tinh tế và nam tính đầy quyến rũ:</p>\n<ul>\n  <li><strong>Trang phục chủ đạo:</strong> Áo Polo dệt kim màu đen than chì hoặc xanh rêu trầm, mở 1 cúc cổ khoe bờ xương quai xanh nam tính.</li>\n  <li><strong>Quần:</strong> Quần Chinos màu be ấm hoặc quần tây ống suông xếp ly nhẹ.</li>\n  <li><strong>Giày:</strong> Loafer da lộn hoặc da bóng không tất.</li>\n  <li><strong>Mùi hương:</strong> Nước hoa hương gỗ tuyết tùng (cedarwood) hoặc hổ phách (amber) nồng ấm.</li>\n</ul>\n\n<h2>4. Ba Lỗi Trang Phục Khiến Quý Ông Mất Điểm Trầm Trọng</h2>\n<ol>\n  <li><strong>Lệch tông Da:</strong> Mang giày da đen nhưng thắt lưng lại màu nâu sáng. Quy tắc bắt buộc: Giày và thắt lưng phải cùng một gia đình màu sắc.</li>\n  <li><strong>Tất (Vớ) quá ngắn:</strong> Khi ngồi vắt chân, ống quần kéo lên để lộ khoảng da chân trắng bệch hoặc rậm lông. Hãy luôn chọn tất cổ cao qua bắp chân có màu tiệp với màu quần.</li>\n  <li><strong>Quần áo nhăn nhúm:</strong> Một chiếc áo sơ mi đắt tiền nhưng nhăn nhúm ở lưng và khuỷu tay sẽ biến bạn thành người cẩu thả. Hãy chọn dòng vải chống nhăn Easy-Iron của MENSTYLE để luôn phẳng phiu 24/7.</li>\n</ol>\n\n<div class=\"mag-product-cta-banner\">\n  <div class=\"cta-banner-content\">\n    <span class=\"cta-banner-icon\">👞</span>\n    <div>\n      <h4>Hoàn Thiện Phong Thái Quý Ông Lịch Lãm</h4>\n      <p>Trang phục may đo, phụ kiện da thật cao cấp chuẩn quý ông thành đạt.</p>\n    </div>\n  </div>\n  <a href=\"index.html#catalogSection\" class=\"cta-banner-btn\">Khám Phá Cửa Hàng ➔</a>\n</div>",
            "image": "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800",
            "author": "Đức Trí - Senior Editor",
            "tags": [
                  "Hẹn hò",
                  "Gặp gỡ đối tác",
                  "Lịch lãm",
                  "Phong cách phái mạnh"
            ],
            "views": 3100,
            "readTime": "7 phút đọc",
            "isFeatured": false,
            "createdAt": "2026-10-29T15:42:52.993Z"
      }
];
  },

  // ================= 8. QUẢN LÝ YÊU CẦU LIÊN HỆ & TƯ VẤN =================
  async sendContact(contactData) {
    try {
      const res = await fetch(`${API_BASE_URL}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData),
      });
      return await res.json();
    } catch (err) {
      console.error('Lỗi API sendContact:', err);
      return { success: false, message: 'Không thể kết nối đến máy chủ API' };
    }
  },

  async getContacts(token, query = {}) {
    try {
      const q = new URLSearchParams(query).toString();
      const res = await fetch(`${API_BASE_URL}/contacts${q ? '?' + q : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message, data: [] };
    }
  },

  async updateContactStatus(id, updateData, token) {
    try {
      const res = await fetch(`${API_BASE_URL}/contacts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  async deleteContact(id, token) {
    try {
      const res = await fetch(`${API_BASE_URL}/contacts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },
};
