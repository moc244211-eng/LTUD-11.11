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
      if (isLocal && API_BASE_URL.includes('localhost:5000')) {
        API_BASE_URL = RENDER_FALLBACK_API;
        return await this.getCategories();
      }
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
      if (isLocal && API_BASE_URL.includes('localhost:5000')) {
        API_BASE_URL = RENDER_FALLBACK_API;
        return await this.getProducts(params);
      }
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
        _id: 'art-1',
        title: 'Xu Hướng Thời Trang Nam 2026: Phong Cách Tối Giản Minimalist & Smart Casual Lên Ngôi',
        slug: 'xu-huong-thoi-trang-nam-2026-minimalist-smart-casual',
        category: 'Xu hướng thời trang',
        excerpt: 'Năm 2026 đánh dấu sự trở lại mạnh mẽ của vẻ đẹp tinh giản, chú trọng vào đường cắt may sắc nét, bảng màu trung tính và chất liệu tự nhiên thượng hạng.',
        content: `
<h2>1. Sự Trỗi Dậy Của Chủ Nghĩa Cổ Điển Tinh Giản</h2>
<p>Bước sang năm 2026, thời trang nam chứng kiến bước ngoặt rõ nét khi người tiêu dùng thông thái dần rời xa những họa tiết rực rỡ để tìm về những giá trị nguyên bản. Phong cách Minimalist không hề đơn điệu, mà là tuyên ngôn của sự tự tin, chú trọng vào phom dáng may đo chuẩn xác và bảng màu thanh lịch.</p>
<h2>2. Bảng Màu Trung Tính Định Hình Phong Thái</h2>
<p>Bảng màu chủ đạo của năm hướng đến sự êm dịu của thiên nhiên: màu cát sa mạc (sand), xanh rêu quân đội trầm (olive drab), và tông than chì (graphite). Những sắc thái này mang lại vẻ ngoài lịch lãm và dễ dàng phối hợp.</p>
<blockquote>"Phong cách đích thực không phải là để người khác chú ý ngay lập tức, mà là để người ta nhớ mãi không quên." - Giorgio Armani</blockquote>
<h2>3. Xu Hướng Kết Hợp Smart Casual Linh Hoạt</h2>
<p>Thay vì âu phục gò bó, quý ông hiện đại ưa chuộng blazer không lót mỏng nhẹ phối cùng áo thun cổ tròn và quần tây cạp cao. Đây là diện mạo hoàn hảo từ văn phòng đến tiệc tối.</p>`,
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200',
        author: 'Hoàng Nam - Giám đốc Sáng tạo',
        tags: ['Xu hướng 2026', 'Minimalist', 'Smart Casual'],
        views: 2840,
        readTime: '6 phút đọc',
        isFeatured: true,
        createdAt: '2026-03-10T08:00:00.000Z'
      },
      {
        _id: 'art-2',
        title: '5 Bí Quyết Phối Áo Sơ Mi Oxford Chuẩn Quý Ông Thành Đạt',
        slug: '5-bi-quyet-phoi-ao-so-mi-oxford-chuan-quy-ong',
        category: 'Bí quyết phối đồ',
        excerpt: 'Áo sơ mi Oxford dệt sợi rổ kinh điển là món đồ không thể thiếu trong tủ đồ nam. Khám phá 5 cách biến tấu từ thanh lịch đến năng động.',
        content: `
<h2>1. Hiểu Đúng Về Chất Liệu Vải Dệt Oxford</h2>
<p>Vải Oxford được dệt từ hai loại sợi đan xen đặc trưng, tạo nên bề mặt có chiều sâu, dày dặn vừa phải và cực kỳ thoáng khí.</p>
<h2>2. Phối Cùng Quần Tây Xếp Ly Xanh Navy</h2>
<p>Một chiếc sơ mi Oxford trắng phối cùng quần âu xanh navy là quy chuẩn kinh điển. Hãy xắn tay áo lên hai nếp và kết hợp cùng đồng hồ thép để tôn lên vẻ rắn rỏi.</p>`,
        image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
        author: 'Trần Minh - Stylist MENSTYLE',
        tags: ['Sơ mi Oxford', 'Phối đồ nam'],
        views: 1950,
        readTime: '4 phút đọc',
        isFeatured: true,
        createdAt: '2026-03-08T09:30:00.000Z'
      },
      {
        _id: 'art-3',
        title: 'Nghệ Thuật Xây Dựng Capsule Wardrobe Tối Giản Cho Quý Ông Bận Rộn',
        slug: 'nghe-thuat-xay-dung-capsule-wardrobe-toi-gian',
        category: 'Phong cách nam',
        excerpt: 'Chỉ với 15 món đồ cốt lõi, bạn hoàn toàn có thể tạo nên hơn 40 outfit khác biệt cho cả tháng làm việc và du lịch.',
        content: `
<h2>1. Khái Niệm Tủ Đồ Nhộng (Capsule Wardrobe)</h2>
<p>Capsule Wardrobe là triết lý thời trang hướng đến việc sở hữu một số lượng trang phục vừa đủ nhưng có tính linh hoạt cao nhất.</p>
<h2>2. Danh Sách 15 Món Đồ Cốt Lõi Tại MENSTYLE</h2>
<p>Bao gồm 3 áo sơ mi, 4 áo thun/polo, 3 quần dài, 2 áo khoác và 3 đôi giày cơ bản tạo nên hàng chục set đồ ấn tượng.</p>`,
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
        author: 'Đức Trí - Senior Editor',
        tags: ['Capsule Wardrobe', 'Tối giản'],
        views: 1680,
        readTime: '5 phút đọc',
        isFeatured: true,
        createdAt: '2026-03-05T14:15:00.000Z'
      },
      {
        _id: 'art-4',
        title: 'Hướng Dẫn Chọn Size Quần Tây & Quần Jeans Vừa Vặn Từng Điểm Cơ Thể',
        slug: 'huong-dan-chon-size-quan-tay-quan-jeans-chuan-voc-dang',
        category: 'Mẹo chọn trang phục',
        excerpt: '3 thông số quan trọng nhất: Vòng bụng, Đũng quần và Chiều dài ống gấu. Đừng để một chiếc quần sai size làm hỏng cả tỷ lệ cơ thể.',
        content: `
<h2>1. Tầm Quan Trọng Của Độ Rơi Của Gấu Quần</h2>
<p>Gấu quần chạm vào giày như thế nào quyết định phong thái của bạn. No-break mang lại nét trẻ trung năng động, trong khi Half-break tạo vẻ lịch lãm trang trọng.</p>`,
        image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800',
        author: 'Đội ngũ Đo may MENSTYLE',
        tags: ['Mẹo chọn size', 'Quần âu'],
        views: 1220,
        readTime: '4 phút đọc',
        isFeatured: false,
        createdAt: '2026-03-02T11:00:00.000Z'
      },
      {
        _id: 'art-5',
        title: 'Bí Quyết Giặt Ủi Và Bảo Quản Áo Sơ Mi & Đồ Len Cao Cấp',
        slug: 'bi-quyet-giat-ui-va-bao-quan-so-mi-do-len-cao-cap',
        category: 'Chăm sóc và bảo quản',
        excerpt: 'Làm thế nào để chiếc áo sơ mi giữ nguyên phom cổ sắc nét và áo len không bị xù lông qua nhiều năm sử dụng?',
        content: `
<h2>1. Nhiệt Độ Nước Và Chế Độ Giặt</h2>
<p>Luôn giặt sơ mi và áo len bằng nước lạnh dưới 30°C. Nước nóng là kẻ thù số một khiến sợi vải co rút và mất phom dáng ban đầu.</p>`,
        image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800',
        author: 'MENSTYLE Care',
        tags: ['Bảo quản quần áo', 'Mẹo giặt ủi'],
        views: 940,
        readTime: '5 phút đọc',
        isFeatured: false,
        createdAt: '2026-02-28T16:20:00.000Z'
      },
      {
        _id: 'art-6',
        title: 'MENSTYLE Ra Mắt Bộ Sưu Tập Xuân Hè 2026: "Urban Elegance"',
        slug: 'menstyle-ra-mat-bo-suu-tap-xuan-he-2026-urban-elegance',
        category: 'Tin tức MENSTYLE',
        excerpt: 'Lấy cảm hứng từ nhịp sống hiện đại của các đô thị quốc tế, BST mới tôn vinh sự thoải mái, phóng khoáng cùng chất liệu Linen và Lụa tơ tằm dệt cao cấp.',
        content: `
<h2>1. Tinh Thần Urban Elegance</h2>
<p>Bộ sưu tập mang thông điệp về sự tự do và sang trọng thầm lặng. Từng thiết kế đều được kiểm định nghiêm ngặt từ sợi vải đến đường may thủ công tỉ mỉ.</p>`,
        image: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800',
        author: 'Ban Biên Tập MENSTYLE',
        tags: ['BST Mới', 'Urban Elegance'],
        views: 3120,
        readTime: '3 phút đọc',
        isFeatured: false,
        createdAt: '2026-02-25T10:00:00.000Z'
      },
      {
        _id: 'art-7',
        title: 'Áo Polo Knitwear: Làn Gió Mới Trong Tủ Đồ Quý Ông Hiện Đại',
        slug: 'ao-polo-knitwear-lan-gio-moi-trong-tu-do-quy-ong',
        category: 'Xu hướng thời trang',
        excerpt: 'Không còn là trang phục thể thao thuần túy, polo dệt kim mỏng nhẹ mang đến thần thái lịch thiệp chuẩn phong cách quý ông nước Ý.',
        content: `
<h2>1. Điểm Khác Biệt Của Polo Dệt Kim</h2>
<p>Được dệt từ sợi cotton chải kỹ hoặc len merino mỏng, áo polo dệt kim có độ rủ tự nhiên ôm nhẹ lấy khuôn ngực và bắp tay.</p>`,
        image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
        author: 'Hoàng Nam - Giám đốc Sáng tạo',
        tags: ['Polo Dệt Kim', 'Phong cách Ý'],
        views: 1450,
        readTime: '4 phút đọc',
        isFeatured: false,
        createdAt: '2026-02-20T08:45:00.000Z'
      },
      {
        _id: 'art-8',
        title: 'Phong Cách Lịch Lãm Cho Buổi Gặp Gỡ Đối Tác & Hẹn Hò Tối',
        slug: 'phong-cach-lich-lam-cho-buoi-gap-go-doi-tac-va-hen-ho',
        category: 'Phong cách nam',
        excerpt: 'Làm thế nào để chuyển đổi mượt mà từ bộ đồ công sở ban ngày sang phong thái quyến rũ cho buổi tối lãng mạn?',
        content: `
<h2>1. Đơn Giản Hóa Chi Tiết</h2>
<p>Tháo cà vạt, mở 1 đến 2 cúc cổ áo sơ mi và thay đôi giày công sở bóng lộn bằng đôi giày Loafer da đen hoặc da nâu trầm.</p>`,
        image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800',
        author: 'Đức Trí - Senior Editor',
        tags: ['Hẹn hò', 'Lịch lãm'],
        views: 1820,
        readTime: '5 phút đọc',
        isFeatured: false,
        createdAt: '2026-02-15T19:00:00.000Z'
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
      if (isLocal && API_BASE_URL.includes('localhost:5000')) {
        API_BASE_URL = RENDER_FALLBACK_API;
        return await this.sendContact(contactData);
      }
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
      if (isLocal && API_BASE_URL.includes('localhost:5000')) {
        API_BASE_URL = RENDER_FALLBACK_API;
        return await this.getContacts(token, query);
      }
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
