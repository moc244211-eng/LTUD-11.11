/**
 * LOGIC TƯƠNG TÁC GIAO DIỆN KHÁCH HÀNG - MENSTYLE STOREFRONT
 * Kết nối toàn bộ RESTful API, LocalStorage, VietQR, Carousel & Phân trang
 */

// Trạng thái ứng dụng
let currentCategory = "";
let currentSearch = "";
let currentMinPrice = "";
let currentMaxPrice = "";
let currentSort = "";
let currentPage = 1;
const PAGE_LIMIT = 8;

let cart = JSON.parse(localStorage.getItem("MENSTYLE_CART") || "[]");
let currentUser = JSON.parse(localStorage.getItem("MENSTYLE_USER") || "null");
let authToken = localStorage.getItem("MENSTYLE_TOKEN") || "";

let currentSlideIdx = 0;
let carouselTimer = null;
let selectedDetailProduct = null;
let selectedDetailSize = "L";

// Khởi chạy khi DOM sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  initAuthUI();
  initCarousel();
  initCategories();
  initPriceFilters();
  loadProducts();
  updateCartUI();
  setupEventListeners();
});

// ================= 1. CAROUSEL BANNER SLIDER =================
function initCarousel() {
  startCarouselAuto();
  const container = document.querySelector(".carousel-container");
  if (container) {
    container.addEventListener("mouseenter", () => clearInterval(carouselTimer));
    container.addEventListener("mouseleave", () => startCarouselAuto());
  }
}

function startCarouselAuto() {
  clearInterval(carouselTimer);
  carouselTimer = setInterval(() => {
    nextSlide();
  }, 4500);
}

function updateCarouselView() {
  const slides = document.getElementById("carouselSlides");
  const dots = document.querySelectorAll(".carousel-dot");
  if (slides) {
    slides.style.transform = `translateX(-${currentSlideIdx * 100}%)`;
  }
  dots.forEach((d, i) => {
    if (i === currentSlideIdx) d.classList.add("active");
    else d.classList.remove("active");
  });
}

function nextSlide() {
  currentSlideIdx = (currentSlideIdx + 1) % 3;
  updateCarouselView();
}

function prevSlide() {
  currentSlideIdx = (currentSlideIdx - 1 + 3) % 3;
  updateCarouselView();
}

function goToSlide(idx) {
  currentSlideIdx = idx;
  updateCarouselView();
}

function scrollToProducts() {
  const el = document.getElementById("productsMain");
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

function filterByCatSlug(slug) {
  scrollToProducts();
  const pills = document.querySelectorAll("#categoryPills .cat-pill");
  pills.forEach((p) => {
    if (p.getAttribute("data-slug") === slug) {
      p.click();
    }
  });
}

// ================= 2. QUẢN LÝ DANH MỤC & BỘ LỌC GIÁ =================
async function initCategories() {
  const catList = document.getElementById("categoryPills");
  if (!catList) return;

  const res = await API.getCategories();
  if (res.success && Array.isArray(res.data)) {
    let html = `<button class="cat-pill active" data-id="" data-slug="">Tất cả sản phẩm</button>`;
    res.data.forEach((cat) => {
      html += `<button class="cat-pill" data-id="${cat._id}" data-slug="${cat.slug}">${cat.name}</button>`;
    });
    catList.innerHTML = html;

    catList.querySelectorAll(".cat-pill").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        catList.querySelectorAll(".cat-pill").forEach((b) => b.classList.remove("active"));
        e.currentTarget.classList.add("active");
        currentCategory = e.currentTarget.getAttribute("data-id");
        currentPage = 1;
        loadProducts();
      });
    });
  }
}

function initPriceFilters() {
  const pricePills = document.querySelectorAll(".price-pill");
  pricePills.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      pricePills.forEach((b) => b.classList.remove("active"));
      e.currentTarget.classList.add("active");
      currentMinPrice = e.currentTarget.getAttribute("data-min") || "";
      currentMaxPrice = e.currentTarget.getAttribute("data-max") || "";
      currentPage = 1;
      loadProducts();
    });
  });
}

// ================= 3. TẢI VÀ HIỂN THỊ SẢN PHẨM (PAGINATION) =================
async function loadProducts() {
  const grid = document.getElementById("productGrid");
  const countEl = document.getElementById("productCount");
  const paginationWrapper = document.getElementById("paginationWrapper");
  if (!grid) return;

  grid.innerHTML = `<div class="state-box"><h3>⏳ Đang tải sản phẩm từ MongoDB Atlas...</h3></div>`;

  const res = await API.getProducts({
    category: currentCategory,
    search: currentSearch,
    minPrice: currentMinPrice,
    maxPrice: currentMaxPrice,
    sort: currentSort,
    page: currentPage,
    limit: PAGE_LIMIT,
  });

  if (res.success && Array.isArray(res.data) && res.data.length > 0) {
    const total = res.total || res.data.length;
    const totalPages = res.totalPages || 1;
    if (countEl) countEl.innerText = `Tìm thấy ${total} sản phẩm (Trang ${currentPage}/${totalPages})`;

    grid.innerHTML = res.data
      .map((p) => {
        const discount =
          p.originalPrice > p.salePrice
            ? Math.round(((p.originalPrice - p.salePrice) / p.originalPrice) * 100)
            : 0;
        const catName = p.category ? p.category.name || p.category : "Thời trang nam";
        const imgUrl = p.image || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600";
        const brand = p.brand || "MENSTYLE";

        return `
        <div class="product-card">
          <div class="product-thumb-wrap">
            <img src="${imgUrl}" alt="${p.name}" class="product-thumb" onerror="this.src='https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600'">
            ${discount > 0 ? `<span class="discount-tag">-${discount}%</span>` : ""}
            <span class="badge-brand">${brand}</span>
          </div>
          <div class="product-details">
            <span class="product-category-name">${catName}</span>
            <h4 class="product-name" title="${p.name}">${p.name}</h4>
            <div class="product-rating">★ ${p.rating || 5.0} (Kho: ${p.stock || 0})</div>
            <div class="price-container">
              <span class="sale-price">${Number(p.salePrice).toLocaleString("vi-VN")} đ</span>
              ${p.originalPrice > p.salePrice ? `<span class="original-price">${Number(p.originalPrice).toLocaleString("vi-VN")} đ</span>` : ""}
            </div>
            <div class="card-actions">
              <button class="btn-add-cart" onclick="quickAddToCart('${p._id}', '${escapeQuotes(p.name)}', ${p.salePrice}, '${imgUrl}')">
                🛒 Thêm giỏ
              </button>
              <button class="btn-view-quick" onclick="viewProductDetail('${p._id}')" title="Xem chi tiết & chọn size">
                👁️
              </button>
            </div>
          </div>
        </div>
      `;
      })
      .join("");

    renderPagination(totalPages);
  } else {
    if (countEl) countEl.innerText = "0 sản phẩm";
    grid.innerHTML = `
      <div class="state-box">
        <h3>🔍 Không tìm thấy sản phẩm phù hợp!</h3>
        <p>Vui lòng thử chọn khoảng giá khác hoặc bấm 'Tất cả sản phẩm'.</p>
      </div>
    `;
    if (paginationWrapper) paginationWrapper.innerHTML = "";
  }
}

function renderPagination(totalPages) {
  const wrapper = document.getElementById("paginationWrapper");
  if (!wrapper) return;

  if (totalPages <= 1) {
    wrapper.innerHTML = "";
    return;
  }

  let html = `
    <button class="page-btn" ${currentPage === 1 ? "disabled" : ""} onclick="changePage(${currentPage - 1})">❮ Trước</button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button class="page-btn ${i === currentPage ? "active" : ""}" onclick="changePage(${i})">${i}</button>
    `;
  }

  html += `
    <button class="page-btn" ${currentPage === totalPages ? "disabled" : ""} onclick="changePage(${currentPage + 1})">Tiếp ❯</button>
  `;

  wrapper.innerHTML = html;
}

function changePage(page) {
  currentPage = page;
  loadProducts();
  scrollToProducts();
}

// ================= 4. XEM CHI TIẾT SẢN PHẨM & CHỌN SIZE =================
async function viewProductDetail(id) {
  const modal = document.getElementById("productDetailModal");
  const content = document.getElementById("productDetailContent");
  if (!modal || !content) return;

  content.innerHTML = `<p style="text-align:center; padding:30px;">⏳ Đang tải thông tin sản phẩm...</p>`;
  modal.classList.remove("hidden");

  const res = await API.getProductById(id);
  if (res.success && res.data) {
    const p = res.data;
    selectedDetailProduct = p;
    selectedDetailSize = p.sizes && p.sizes.length > 0 ? p.sizes[0] : "L";

    const catName = p.category ? p.category.name || p.category : "Thời trang nam";
    const imgUrl = p.image || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600";
    const sizes = p.sizes || ["M", "L", "XL", "2XL"];

    const sizesHtml = sizes
      .map(
        (s, idx) => `
        <button type="button" class="size-pill ${idx === 0 ? "active" : ""}" onclick="selectSize(this, '${s}')">
          ${s}
        </button>
      `
      )
      .join("");

    content.innerHTML = `
      <div style="display: flex; gap: 24px; flex-wrap: wrap;">
        <img src="${imgUrl}" style="width: 100%; max-width: 250px; height: 320px; object-fit: cover; border-radius: 12px;">
        <div style="flex: 1; min-width: 240px;">
          <span style="font-size: 12px; color: var(--primary); font-weight: 800; text-transform: uppercase;">${catName} • ${p.brand || "MENSTYLE"}</span>
          <h3 style="font-size: 20px; font-weight: 800; margin: 6px 0 10px 0; color: var(--secondary);">${p.name}</h3>
          
          <div style="font-size: 22px; font-weight: 900; color: var(--danger); margin-bottom: 12px;">
            ${Number(p.salePrice).toLocaleString("vi-VN")} đ
            ${p.originalPrice > p.salePrice ? `<span style="font-size:14px; color:#94a3b8; text-decoration:line-through; margin-left:8px;">${Number(p.originalPrice).toLocaleString("vi-VN")} đ</span>` : ""}
          </div>

          <div style="margin-bottom: 14px;">
            <label class="form-label">Chọn Kích Thước (Size):</label>
            <div class="size-selector">${sizesHtml}</div>
          </div>

          <p style="font-size: 14px; color: #475569; line-height: 1.5; margin-bottom: 16px;">
            ${p.description || "Chất vải cao cấp, mềm mại, thoáng mát và bền màu."}
          </p>

          <div style="font-size: 13px; color: #64748b; margin-bottom: 18px; padding: 10px; background: #f8fafc; border-radius: 8px;">
            📦 Kho: <strong>${p.stock || 0}</strong> sản phẩm sẵn có | ⭐ Đánh giá: <strong>${p.rating || 5.0} / 5.0</strong>
          </div>

          <button class="btn-checkout-start" onclick="addCurrentDetailToCart()">
            🛒 Thêm Vào Giỏ Hàng
          </button>
        </div>
      </div>
    `;
  }
}

function selectSize(btn, size) {
  document.querySelectorAll(".size-selector .size-pill").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  selectedDetailSize = size;
}

function addCurrentDetailToCart() {
  if (!selectedDetailProduct) return;
  addToCart(
    selectedDetailProduct._id,
    selectedDetailProduct.name,
    selectedDetailProduct.salePrice,
    selectedDetailProduct.image,
    selectedDetailSize
  );
  closeProductDetailModal();
}

function closeProductDetailModal() {
  const modal = document.getElementById("productDetailModal");
  if (modal) modal.classList.add("hidden");
}

// ================= 5. QUẢN LÝ GIỎ HÀNG (SHOPPING CART) =================
function quickAddToCart(id, name, price, image) {
  addToCart(id, name, price, image, "L");
}

function addToCart(id, name, price, image, size = "L") {
  const itemKey = `${id}_${size}`;
  const existing = cart.find((item) => item.key === itemKey);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      key: itemKey,
      id,
      name,
      price,
      image,
      size,
      quantity: 1,
    });
  }

  saveCart();
  updateCartUI();
  openCartDrawer();
}

function changeQty(key, delta) {
  const item = cart.find((i) => i.key === key);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter((i) => i.key !== key);
  }
  saveCart();
  updateCartUI();
}

function removeFromCart(key) {
  cart = cart.filter((i) => i.key !== key);
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem("MENSTYLE_CART", JSON.stringify(cart));
}

function updateCartUI() {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const badge = document.getElementById("cartBadge");
  if (badge) badge.innerText = totalCount;

  const body = document.getElementById("cartItemsBody");
  const subtotal = document.getElementById("cartSubtotal");
  if (subtotal) subtotal.innerText = `${totalPrice.toLocaleString("vi-VN")} đ`;

  if (body) {
    if (cart.length === 0) {
      body.innerHTML = `
        <div style="text-align: center; padding: 50px 10px; color: #94a3b8;">
          <p style="font-size: 42px; margin-bottom: 10px;">🛍️</p>
          <p style="font-weight: 600;">Túi đồ của bạn đang trống!</p>
          <p style="font-size: 13px; margin-top: 4px;">Hãy chọn những mẫu trang phục ưng ý nhé.</p>
        </div>
      `;
    } else {
      body.innerHTML = cart
        .map(
          (i) => `
        <div class="cart-item">
          <img src="${i.image}" class="cart-item-img" alt="${i.name}">
          <div class="cart-item-info">
            <h5 class="cart-item-name">${i.name}</h5>
            <div class="cart-item-meta">Size: <strong>${i.size}</strong></div>
            <div class="cart-item-price">${(i.price * i.quantity).toLocaleString("vi-VN")} đ</div>
            <div class="qty-control">
              <button class="qty-btn" onclick="changeQty('${i.key}', -1)">-</button>
              <span class="qty-val">${i.quantity}</span>
              <button class="qty-btn" onclick="changeQty('${i.key}', 1)">+</button>
            </div>
          </div>
          <button class="btn-item-del" onclick="removeFromCart('${i.key}')" title="Xóa món này">✕</button>
        </div>
      `
        )
        .join("");
    }
  }
}

function openCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  const backdrop = document.getElementById("cartBackdrop");
  if (drawer && backdrop) {
    backdrop.style.display = "block";
    setTimeout(() => drawer.classList.add("open"), 10);
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  const backdrop = document.getElementById("cartBackdrop");
  if (drawer && backdrop) {
    drawer.classList.remove("open");
    setTimeout(() => {
      backdrop.style.display = "none";
    }, 300);
  }
}

// ================= 6. ĐẶT HÀNG & SINH MÃ VIETQR ĐỘNG =================
function openCheckoutModal() {
  if (cart.length === 0) {
    alert("Túi đồ của bạn đang trống! Vui lòng chọn sản phẩm trước khi đặt hàng.");
    return;
  }
  closeCartDrawer();

  // Tự động điền thông tin nếu đã đăng nhập
  if (currentUser) {
    const nameEl = document.getElementById("chkCustomerName");
    const phoneEl = document.getElementById("chkCustomerPhone");
    const emailEl = document.getElementById("chkCustomerEmail");
    if (nameEl) nameEl.value = currentUser.name || "";
    if (phoneEl) phoneEl.value = currentUser.phone || "";
    if (emailEl) emailEl.value = currentUser.email || "";
  }

  const modal = document.getElementById("checkoutModal");
  if (modal) modal.classList.remove("hidden");
}

function closeCheckoutModal() {
  const modal = document.getElementById("checkoutModal");
  if (modal) modal.classList.add("hidden");
}

async function handleCheckoutSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = document.getElementById("btnSubmitOrder");

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = "⏳ Đang kết nối máy chủ đặt hàng...";
  }

  const customerName = form.customerName.value.trim();
  const customerPhone = form.customerPhone.value.trim();
  const customerEmail = form.customerEmail.value.trim();
  const shippingAddress = form.shippingAddress.value.trim();
  const paymentMethod = form.paymentMethod.value;
  const note = form.note ? form.note.value.trim() : "";

  const orderData = {
    customerName,
    customerPhone,
    customerEmail,
    shippingAddress,
    paymentMethod,
    note,
    items: cart.map((i) => ({
      productId: i.id,
      name: i.name,
      quantity: i.quantity,
      size: i.size,
    })),
    shippingFee: 25000,
  };

  const res = await API.createOrder(orderData, authToken);

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerText = "Xác Nhận Đặt Hàng";
  }

  if (res.success && res.data) {
    const createdOrder = res.data;

    // Làm rỗng giỏ hàng
    cart = [];
    saveCart();
    updateCartUI();
    closeCheckoutModal();

    if (paymentMethod === "VIETQR" || paymentMethod === "MOMO_QR") {
      await showDynamicQRModal(createdOrder._id, paymentMethod);
    } else {
      alert(
        `🎉 ĐẶT HÀNG THÀNH CÔNG!\n\n• Mã đơn hàng: #${createdOrder.orderCode}\n• Tổng tiền: ${Number(createdOrder.totalAmount).toLocaleString("vi-VN")} đ\n• Hình thức: Tiền mặt khi nhận hàng (COD)\n\nCảm ơn bạn đã lựa chọn MENSTYLE!`
      );
    }
  } else {
    alert(`❌ Đặt hàng thất bại: ${res.message || "Lỗi máy chủ"}`);
  }
}

// Gọi API Backend sinh mã VietQR động
async function showDynamicQRModal(orderId, paymentMethod) {
  const modal = document.getElementById("qrModal");
  const qrImg = document.getElementById("qrImage");
  const orderCodeEl = document.getElementById("qrOrderCode");
  const totalEl = document.getElementById("qrTotalAmount");
  const infoEl = document.getElementById("qrNoteInfo");

  if (modal) modal.classList.remove("hidden");
  if (qrImg) qrImg.src = "";
  if (infoEl) infoEl.innerText = "Đang tạo mã QR chuẩn Napas 247...";

  const res = await API.createPaymentQR(orderId, paymentMethod);

  if (res.success && res.data) {
    const d = res.data;
    if (orderCodeEl) orderCodeEl.innerText = `#${d.orderCode}`;
    if (totalEl) totalEl.innerText = `${Number(d.totalAmount).toLocaleString("vi-VN")} đ`;
    if (infoEl) infoEl.innerText = `Nội dung CK: ${d.transferNote} | Ngân hàng: ${d.bankId} (${d.accountNo})`;
    if (qrImg) qrImg.src = d.qrUrl;
  } else {
    alert("Lỗi tạo mã QR: " + res.message);
  }
}

function closeQRModal() {
  const modal = document.getElementById("qrModal");
  if (modal) modal.classList.add("hidden");
  alert("Cảm ơn anh! Đơn hàng của anh đã được ghi nhận. Quản trị viên sẽ xác nhận thanh toán và gửi đồ sớm nhất.");
}

// ================= 7. XÁC THỰC NGƯỜI DÙNG & PROFILE =================
function initAuthUI() {
  const area = document.getElementById("authHeaderArea");
  if (!area) return;

  if (currentUser && authToken) {
    area.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <button class="btn-user-auth" onclick="openMyOrdersModal()">
          👤 ${currentUser.name.split(" ").pop()} (Đơn hàng)
        </button>
        <button class="btn-close" onclick="handleLogout()" title="Đăng xuất">⏻</button>
      </div>
    `;
  } else {
    area.innerHTML = `
      <button class="btn-user-auth" onclick="openAuthModal()">
        👤 Đăng nhập
      </button>
    `;
  }
}

function openAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.remove("hidden");
  toggleAuthMode(false);
}

function closeAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.add("hidden");
}

function toggleAuthMode(isRegister) {
  const loginForm = document.getElementById("loginForm");
  const regForm = document.getElementById("registerForm");
  const title = document.getElementById("authModalTitle");

  if (isRegister) {
    if (loginForm) loginForm.classList.add("hidden");
    if (regForm) regForm.classList.remove("hidden");
    if (title) title.innerText = "Đăng Ký Tài Khoản Mới";
  } else {
    if (loginForm) loginForm.classList.remove("hidden");
    if (regForm) regForm.classList.add("hidden");
    if (title) title.innerText = "Đăng Nhập Khách Hàng";
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = e.target.email.value.trim();
  const password = e.target.password.value;

  const res = await API.login(email, password);
  if (res.success && res.token) {
    authToken = res.token;
    currentUser = res.user;
    localStorage.setItem("MENSTYLE_TOKEN", authToken);
    localStorage.setItem("MENSTYLE_USER", JSON.stringify(currentUser));
    initAuthUI();
    closeAuthModal();
    alert(`🎉 Đăng nhập thành công! Xin chào ${currentUser.name}`);
  } else {
    alert("❌ Đăng nhập thất bại: " + (res.message || "Email hoặc mật khẩu không đúng"));
  }
}

async function handleRegisterSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const userData = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    password: form.password.value,
  };

  const res = await API.register(userData);
  if (res.success && res.token) {
    authToken = res.token;
    currentUser = res.user;
    localStorage.setItem("MENSTYLE_TOKEN", authToken);
    localStorage.setItem("MENSTYLE_USER", JSON.stringify(currentUser));
    initAuthUI();
    closeAuthModal();
    alert(`🎉 Đăng ký thành công! Xin chào ${currentUser.name}`);
  } else {
    alert("❌ Đăng ký thất bại: " + (res.message || "Lỗi tạo tài khoản"));
  }
}

function handleLogout() {
  if (!confirm("Bạn có chắc chắn muốn đăng xuất tài khoản?")) return;
  authToken = "";
  currentUser = null;
  localStorage.removeItem("MENSTYLE_TOKEN");
  localStorage.removeItem("MENSTYLE_USER");
  initAuthUI();
  alert("Đã đăng xuất tài khoản!");
}

// ================= 8. LỊCH SỬ ĐƠN HÀNG CÁ NHÂN (/MYORDERS) =================
async function openMyOrdersModal() {
  const modal = document.getElementById("myOrdersModal");
  const content = document.getElementById("myOrdersContent");
  if (!modal || !content) return;

  modal.classList.remove("hidden");
  content.innerHTML = `<p style="text-align: center; padding: 25px;">⏳ Đang tải đơn hàng của bạn...</p>`;

  const res = await API.getMyOrders(authToken);
  if (res.success && Array.isArray(res.data)) {
    if (res.data.length === 0) {
      content.innerHTML = `<p style="text-align:center; padding:30px; color:#64748b;">Bạn chưa có đơn hàng nào!</p>`;
    } else {
      content.innerHTML = res.data
        .map(
          (o) => `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <strong>#${o.orderCode}</strong>
            <span style="font-size: 12px; color: #64748b;">${new Date(o.createdAt).toLocaleString("vi-VN")}</span>
          </div>
          <div style="font-size: 13.5px; color: #334155; margin-bottom: 6px;">
            ${(o.items || []).map((it) => `<div>• ${it.name} (x${it.quantity}, Size ${it.size || "L"})</div>`).join("")}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; border-top: 1px dashed #cbd5e1; pt: 8px;">
            <div>Tổng: <strong style="color:var(--danger);">${Number(o.totalAmount).toLocaleString("vi-VN")} đ</strong> (${o.paymentMethod})</div>
            <div>
              <span class="badge-status status-${o.paymentStatus}">${o.paymentStatus === "PAID" ? "Đã TT" : "Chưa TT"}</span>
              <span class="badge-status status-${o.orderStatus}">${o.orderStatus}</span>
            </div>
          </div>
        </div>
      `
        )
        .join("");
    }
  }
}

function closeMyOrdersModal() {
  const modal = document.getElementById("myOrdersModal");
  if (modal) modal.classList.add("hidden");
}

// ================= 9. EVENT LISTENERS & TIỆN ÍCH =================
function setupEventListeners() {
  // Tìm kiếm Debounce 350ms
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    let timeout = null;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        currentSearch = e.target.value.trim();
        currentPage = 1;
        loadProducts();
      }, 350);
    });
  }

  // Sắp xếp
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      currentPage = 1;
      loadProducts();
    });
  }
}

function escapeQuotes(str) {
  return (str || "").replace(/'/g, "\\'").replace(/"/g, "&quot;");
}
