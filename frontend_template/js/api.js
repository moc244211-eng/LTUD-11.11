/**
 * MODULE KẾT NỐI TOÀN DIỆN BACKEND RESTFUL API
 * Phục vụ cả Storefront (Khách hàng) và Admin Dashboard (Quản trị viên)
 */
const API_BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? 'http://localhost:5000/api'
  : `${window.location.origin}/api`;

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
};
