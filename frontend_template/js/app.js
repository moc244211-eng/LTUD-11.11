/**
 * LOGIC TƯƠNG TÁC GIAO DIỆN KHÁCH HÀNG - MENSTYLE STOREFRONT (REDESIGN 2026)
 * Chuẩn Modern Premium, Minimalist, Fashion E-Commerce
 * Kết nối toàn bộ RESTful API, LocalStorage, VietQR, Best Sellers & Phân trang
 */

// Trạng thái ứng dụng
let currentCategory = "";
let currentSearch = "";
let currentMinPrice = "";
let currentMaxPrice = "";
let currentSort = "";
let currentPage = 1;
const PAGE_LIMIT = 12; // 2 hàng 6 cột trên màn hình lớn

let cart = JSON.parse(localStorage.getItem("MENSTYLE_CART") || "[]");
let wishlist = JSON.parse(localStorage.getItem("MENSTYLE_WISHLIST") || "[]");
let currentUser = JSON.parse(localStorage.getItem("MENSTYLE_USER") || "null");
let authToken = localStorage.getItem("MENSTYLE_TOKEN") || "";

let currentSlideIdx = 0;
let carouselTimer = null;
let selectedDetailProduct = null;
let selectedDetailSize = "L";

// Khởi chạy khi DOM sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  initAuthUI();
  initWishlistUI();
  initCarousel();
  initCategories();
  initPriceFilters();
  loadBestSellers();
  loadProducts();
  updateCartUI();
  setupEventListeners();
});

// ================= 1. CAROUSEL BANNER SLIDER =================
function initCarousel() {
  startCarouselAuto();
  const banner = document.querySelector(".hero-banner") || document.querySelector(".carousel-container");
  if (banner) {
    banner.addEventListener("mouseenter", () => clearInterval(carouselTimer));
    banner.addEventListener("mouseleave", () => startCarouselAuto());
  }
}

function startCarouselAuto() {
  clearInterval(carouselTimer);
  carouselTimer = setInterval(() => {
    nextSlide();
  }, 5000);
}

function updateCarouselView() {
  const slides = document.getElementById("carouselSlides");
  const dots = document.querySelectorAll(".hero-dot, .carousel-dot");
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
  const el = document.getElementById("catalogSection") || document.getElementById("productsMain");
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

function filterByCategoryName(name) {
  scrollToProducts();
  const pills = document.querySelectorAll("#categoryPills .filter-pill");
  let matched = false;
  pills.forEach((p) => {
    const text = p.innerText.toLowerCase();
    if (text.includes(name.toLowerCase())) {
      p.click();
      matched = true;
    }
  });

  if (!matched) {
    currentSearch = name;
    const sInput = document.getElementById("searchInput");
    if (sInput) sInput.value = name;
    currentPage = 1;
    loadProducts();
  }
}

function filterByCatSlug(slug) {
  scrollToProducts();
  const pills = document.querySelectorAll("#categoryPills .filter-pill");
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
    let html = `<button class="filter-pill active" data-id="" data-slug="">Tất cả sản phẩm</button>`;
    res.data.forEach((cat) => {
      html += `<button class="filter-pill" data-id="${cat._id}" data-slug="${cat.slug}">${cat.name}</button>`;
    });
    catList.innerHTML = html;

    catList.querySelectorAll(".filter-pill").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        catList.querySelectorAll(".filter-pill").forEach((b) => b.classList.remove("active"));
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

// ================= 3. RENDER PRODUCT CARD (CHUẨN 6 CỘT THEO MOCKUP) =================
function renderProductCard(p) {
  const discount =
    p.originalPrice > p.salePrice
      ? Math.round(((p.originalPrice - p.salePrice) / p.originalPrice) * 100)
      : 0;
  const catName = p.category ? (p.category.name || p.category) : "Thời trang nam";
  const imgUrl = p.image || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600";
  const isWishlisted = wishlist.includes(p._id);

  return `
    <div class="product-card">
      <div class="product-thumb-wrap" onclick="viewProductDetail('${p._id}')">
        <img src="${imgUrl}" alt="${p.name}" class="product-thumb" onerror="this.src='https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600'">
        ${discount > 0 ? `<span class="discount-tag">-${discount}%</span>` : ""}
        <button class="btn-wishlist ${isWishlisted ? "active" : ""}" onclick="toggleWishlist(event, '${p._id}')" title="Yêu thích">
          ${isWishlisted ? "❤️" : "♡"}
        </button>
      </div>
      <div class="product-details">
        <span class="product-category-name">${catName}</span>
        <h4 class="product-name" onclick="viewProductDetail('${p._id}')" title="${p.name}">${p.name}</h4>
        <div class="price-container">
          <span class="sale-price">${Number(p.salePrice).toLocaleString("vi-VN")} đ</span>
          ${p.originalPrice > p.salePrice ? `<span class="original-price">${Number(p.originalPrice).toLocaleString("vi-VN")} đ</span>` : ""}
        </div>
        <div class="product-bottom-row">
          <div class="product-rating"><span class="star">★</span> ${p.rating || 4.9} <span style="color:#9ca3af; font-size:10.5px;">(${p.stock ? p.stock + ' sp' : '1.2k'})</span></div>
          <button class="btn-quick-cart" onclick="quickAddToCart('${p._id}', '${escapeQuotes(p.name)}', ${p.salePrice}, '${imgUrl}')" title="Thêm vào giỏ">
            🛒
          </button>
        </div>
      </div>
    </div>
  `;
}

// ================= 4. SẢN PHẨM BÁN CHẠY (BEST SELLERS TOP 6) =================
async function loadBestSellers() {
  const bestGrid = document.getElementById("bestSellerGrid");
  if (!bestGrid) return;

  bestGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 24px; color: #6b7280;">⏳ Đang tải sản phẩm bán chạy...</div>`;

  const res = await API.getProducts({ limit: 6, sort: "rating" });
  if (res.success && Array.isArray(res.data) && res.data.length > 0) {
    const top6 = res.data.slice(0, 6);
    bestGrid.innerHTML = top6.map(renderProductCard).join("");
  } else {
    bestGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 24px; color: #9ca3af;">Chưa có sản phẩm nổi bật</div>`;
  }
}

// ================= 5. TẢI VÀ HIỂN THỊ SẢN PHẨM CATALOG (PAGINATION) =================
async function loadProducts() {
  const grid = document.getElementById("productGrid");
  const countEl = document.getElementById("productCount");
  const paginationWrapper = document.getElementById("paginationWrapper");
  if (!grid) return;

  grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #6b7280;">⏳ Đang tải sản phẩm từ MongoDB Atlas...</div>`;

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

    grid.innerHTML = res.data.map(renderProductCard).join("");
    renderPagination(totalPages);
  } else {
    if (countEl) countEl.innerText = "0 sản phẩm";
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 50px 20px; background: #ffffff; border-radius: 12px; border: 1px dashed #d1d5db;">
        <h3 style="font-size: 18px; margin-bottom: 8px;">🔍 Không tìm thấy sản phẩm phù hợp!</h3>
        <p style="color: #6b7280; font-size: 13.5px;">Vui lòng thử chọn khoảng giá khác hoặc bấm 'Tất cả sản phẩm'.</p>
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
    <button class="page-btn ${currentPage === totalPages ? "disabled" : ""} onclick="changePage(${currentPage + 1})">Tiếp ❯</button>
  `;

  wrapper.innerHTML = html;
}

function changePage(page) {
  currentPage = page;
  loadProducts();
  scrollToProducts();
}

// ================= 6. DANH SÁCH YÊU THÍCH (WISHLIST) =================
function initWishlistUI() {
  updateWishlistBadge();
}

function updateWishlistBadge() {
  const badge = document.getElementById("wishlistBadge");
  if (badge) {
    if (wishlist.length > 0) {
      badge.style.display = "flex";
      badge.innerText = wishlist.length;
    } else {
      badge.style.display = "none";
    }
  }
}

function toggleWishlist(e, productId) {
  if (e) e.stopPropagation();
  const idx = wishlist.indexOf(productId);
  if (idx > -1) {
    wishlist.splice(idx, 1);
    showToast("Đã xóa khỏi danh sách yêu thích");
  } else {
    wishlist.push(productId);
    showToast("❤️ Đã thêm vào danh sách yêu thích!");
  }
  localStorage.setItem("MENSTYLE_WISHLIST", JSON.stringify(wishlist));
  updateWishlistBadge();
  loadBestSellers();
  loadProducts();
}

function openWishlistToast() {
  if (wishlist.length === 0) {
    showToast("Danh sách yêu thích của bạn đang trống!");
  } else {
    showToast(`Bạn đang có ${wishlist.length} sản phẩm trong danh sách yêu thích ❤️`);
  }
}

// ================= 7. XEM CHI TIẾT SẢN PHẨM & CHỌN SIZE =================
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

    const catName = p.category ? (p.category.name || p.category) : "Thời trang nam";
    const imgUrl = p.image || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600";
    const sizes = p.sizes && p.sizes.length > 0 ? p.sizes : ["M", "L", "XL", "2XL"];

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
          <span style="font-size: 11.5px; color: #6b7280; font-weight: 800; text-transform: uppercase;">${catName} • ${p.brand || "MENSTYLE"}</span>
          <h3 style="font-size: 20px; font-weight: 800; margin: 6px 0 10px 0; color: #0b0b0b;">${p.name}</h3>
          
          <div style="font-size: 22px; font-weight: 900; color: var(--accent-red); margin-bottom: 12px;">
            ${Number(p.salePrice).toLocaleString("vi-VN")} đ
            ${p.originalPrice > p.salePrice ? `<span style="font-size:14px; color:#94a3b8; text-decoration:line-through; margin-left:8px;">${Number(p.originalPrice).toLocaleString("vi-VN")} đ</span>` : ""}
          </div>

          <div style="margin-bottom: 14px;">
            <label class="form-label">Chọn Kích Thước (Size):</label>
            <div class="size-selector" style="display: flex; gap: 8px;">${sizesHtml}</div>
          </div>

          <p style="font-size: 13.5px; color: #475569; line-height: 1.5; margin-bottom: 16px;">
            ${p.description || "Chất vải may đo cao cấp, mềm mại, thoáng mát và giữ form chuẩn phong cách phái mạnh."}
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

// ================= 8. QUẢN LÝ GIỎ HÀNG (SHOPPING CART) =================
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
  showToast(`✓ Đã thêm "${name}" vào giỏ hàng!`);
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
          <p style="font-weight: 600; color: #374151;">Túi đồ của bạn đang trống!</p>
          <p style="font-size: 13px; margin-top: 4px; color: #9ca3af;">Hãy chọn những mẫu trang phục ưng ý nhé.</p>
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

// ================= 9. ĐẶT HÀNG, ÁP MÃ GIẢM GIÁ & SINH MÃ VIETQR ĐỘNG =================
let currentAppliedCoupon = null;

function updateCheckoutSummaryUI() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal >= 500000 ? 0 : 25000;
  let discountAmount = 0;

  if (currentAppliedCoupon) {
    if (currentAppliedCoupon.discountType === "PERCENT") {
      discountAmount = Math.round((subtotal * currentAppliedCoupon.discountValue) / 100);
    } else {
      discountAmount = currentAppliedCoupon.discountValue;
    }
  }

  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const subtotalEl = document.getElementById("chkSummarySubtotal");
  const shippingEl = document.getElementById("chkSummaryShipping");
  const discountRow = document.getElementById("chkSummaryDiscountRow");
  const discountEl = document.getElementById("chkSummaryDiscount");
  const finalTotalEl = document.getElementById("chkSummaryFinalTotal");

  if (subtotalEl) subtotalEl.innerText = `${subtotal.toLocaleString("vi-VN")} đ`;
  if (shippingEl) {
    shippingEl.innerText = shippingFee === 0 ? "0 đ (Miễn phí đơn > 500k)" : `${shippingFee.toLocaleString("vi-VN")} đ`;
  }

  if (discountRow) {
    if (discountAmount > 0) {
      discountRow.style.display = "flex";
      if (discountEl) discountEl.innerText = `-${discountAmount.toLocaleString("vi-VN")} đ`;
    } else {
      discountRow.style.display = "none";
    }
  }

  if (finalTotalEl) finalTotalEl.innerText = `${finalTotal.toLocaleString("vi-VN")} đ`;
  return { subtotal, shippingFee, discountAmount, finalTotal };
}

async function handleApplyCheckoutCoupon() {
  const codeInput = document.getElementById("chkCouponCode");
  const feedback = document.getElementById("chkCouponFeedback");
  if (!codeInput) return;

  const code = codeInput.value.trim().toUpperCase();
  if (!code) {
    if (feedback) {
      feedback.style.color = "#dc2626";
      feedback.innerText = "Vui lòng nhập mã giảm giá!";
    }
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (feedback) {
    feedback.style.color = "#2563eb";
    feedback.innerText = "⏳ Đang kiểm tra mã ưu đãi...";
  }

  const res = await API.validateCoupon(code, subtotal);
  if (res && res.success && res.data) {
    currentAppliedCoupon = res.data;
    if (feedback) {
      feedback.style.color = "#16a34a";
      const discText = res.data.discountType === "PERCENT" ? `${res.data.discountValue}%` : `${Number(res.data.discountValue).toLocaleString("vi-VN")} đ`;
      feedback.innerText = `✓ Áp dụng mã "${res.data.code}" thành công! Giảm ${discText}`;
    }
    updateCheckoutSummaryUI();
  } else {
    currentAppliedCoupon = null;
    if (feedback) {
      feedback.style.color = "#dc2626";
      feedback.innerText = "✕ " + (res.message || "Mã giảm giá không hợp lệ hoặc đã hết hạn!");
    }
    updateCheckoutSummaryUI();
  }
}

function openCheckoutModal() {
  if (cart.length === 0) {
    alert("Túi đồ của bạn đang trống! Vui lòng chọn sản phẩm trước khi đặt hàng.");
    return;
  }
  closeCartDrawer();

  // Reset coupon & tính toán lại hóa đơn
  currentAppliedCoupon = null;
  const cpInput = document.getElementById("chkCouponCode");
  const cpFeedback = document.getElementById("chkCouponFeedback");
  if (cpInput) cpInput.value = "";
  if (cpFeedback) cpFeedback.innerText = "";
  updateCheckoutSummaryUI();

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

  const { subtotal, shippingFee, discountAmount, finalTotal } = updateCheckoutSummaryUI();

  const orderData = {
    customerName,
    customerPhone,
    customerEmail,
    shippingAddress,
    paymentMethod,
    note,
    couponCode: currentAppliedCoupon ? currentAppliedCoupon.code : undefined,
    discountAmount: currentAppliedCoupon ? discountAmount : 0,
    items: cart.map((i) => ({
      productId: i.id,
      name: i.name,
      quantity: i.quantity,
      size: i.size,
    })),
    shippingFee,
  };

  let createdOrder = null;
  try {
    const res = await API.createOrder(orderData, authToken);
    if (res && res.success && res.data) {
      createdOrder = res.data;
    }
  } catch (err) {
    console.warn("Không kết nối được server backend:", err);
  }

  // Fallback an toàn: nếu chưa bật backend, vẫn tạo đơn để hiển thị ngay mã VietQR chính chủ
  if (!createdOrder) {
    createdOrder = {
      _id: "order_" + Date.now(),
      orderCode: "MS" + Date.now().toString().slice(-8),
      totalAmount: finalTotal,
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      paymentMethod,
    };
  }

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerText = "Xác Nhận Đặt Hàng";
  }

  // Làm rỗng giỏ hàng
  cart = [];
  saveCart();
  updateCartUI();
  closeCheckoutModal();

  if (paymentMethod === "VIETQR" || paymentMethod === "MOMO_QR") {
    showDynamicQRModal(createdOrder, paymentMethod);
  } else {
    alert(
      `🎉 ĐẶT HÀNG THÀNH CÔNG!\n\n• Mã đơn hàng: #${createdOrder.orderCode}\n• Tổng tiền: ${Number(createdOrder.totalAmount).toLocaleString("vi-VN")} đ\n• Hình thức: Tiền mặt khi nhận hàng (COD)\n\nCảm ơn bạn đã lựa chọn MENSTYLE!`
    );
  }
}

// Gọi API Backend sinh mã VietQR động chuẩn tài khoản MB Bank - 0862583284 - MÀN MỘC SÁNG
async function showDynamicQRModal(order, paymentMethod) {
  const modal = document.getElementById("qrModal");
  const qrImg = document.getElementById("qrImage");
  const orderCodeEl = document.getElementById("qrOrderCode");
  const totalEl = document.getElementById("qrTotalAmount");
  const infoEl = document.getElementById("qrNoteInfo");

  const orderId = order._id || order;
  const orderCode = order.orderCode || (typeof order === "string" ? order.slice(-8) : "DH");
  const totalAmount = order.totalAmount || 0;

  if (modal) modal.classList.remove("hidden");
  if (orderCodeEl) orderCodeEl.innerText = `#${orderCode}`;
  if (totalEl) totalEl.innerText = `${Number(totalAmount).toLocaleString("vi-VN")} đ`;

  // Mã QR chuẩn tài khoản cá nhân: MB Bank - STK 0862583284 - MÀN MỘC SÁNG
  const defaultQrUrl =
    paymentMethod === "MOMO_QR"
      ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
          `2|99|0862583284|MÀN MỘC SÁNG||0|0|${totalAmount}|DH ${orderCode}|transfer_myqr`
        )}`
      : `https://img.vietqr.io/image/MB-0862583284-compact2.png?amount=${totalAmount}&addInfo=DH%20${orderCode}&accountName=M%C3%80N%20M%E1%BB%98C%20S%C3%81NG`;

  if (qrImg) qrImg.src = defaultQrUrl;
  if (infoEl) infoEl.innerText = `Nội dung CK: DH ${orderCode} | MB Bank (0862583284 - MÀN MỘC SÁNG)`;

  // Gọi đồng thời qua API Backend để lưu log và đảm bảo tính chuẩn hóa
  try {
    const res = await API.createPaymentQR(orderId, paymentMethod);
    if (res.success && res.data && res.data.qrUrl) {
      if (qrImg) qrImg.src = res.data.qrUrl;
      if (infoEl)
        infoEl.innerText = `Nội dung CK: ${res.data.transferNote} | Ngân hàng: ${res.data.bankId} (${res.data.accountNo} - ${res.data.accountName})`;
    }
  } catch (err) {
    console.warn("Lỗi gọi API VietQR:", err);
  }
}

function closeQRModal() {
  const modal = document.getElementById("qrModal");
  if (modal) modal.classList.add("hidden");
  alert("Cảm ơn anh! Đơn hàng của anh đã được ghi nhận. Quản trị viên sẽ xác nhận thanh toán và gửi đồ sớm nhất.");
}

// ================= 10. XÁC THỰC NGƯỜI DÙNG & PROFILE =================
function initAuthUI() {
  const area = document.getElementById("authHeaderArea");
  if (!area) return;

  if (currentUser && authToken) {
    const firstName = currentUser.name ? currentUser.name.split(" ").pop() : "Khách";
    area.innerHTML = `
      <div class="user-profile-chip" onclick="openMyOrdersModal()" title="Xem đơn hàng của ${currentUser.name}">
        <span class="user-chip-avatar">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </span>
        <span class="user-chip-name">${firstName}</span>
        <button type="button" class="user-chip-logout" onclick="event.stopPropagation(); handleLogout();" title="Đăng xuất tài khoản">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    `;
  } else {
    area.innerHTML = `
      <button class="btn-header-icon" onclick="openAuthModal()" title="Đăng nhập tài khoản">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </button>
    `;
  }
}

function handleUserAccountClick() {
  if (currentUser && authToken) {
    openMyOrdersModal();
  } else {
    openAuthModal();
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
    showToast(`🎉 Xin chào ${currentUser.name}!`);
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
    showToast(`🎉 Tạo tài khoản thành công! Xin chào ${currentUser.name}`);
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
  showToast("Đã đăng xuất tài khoản!");
}

// ================= 11. LỊCH SỬ ĐƠN HÀNG CÁ NHÂN (/MYORDERS) =================
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
            <div>Tổng: <strong style="color:var(--accent-red);">${Number(o.totalAmount).toLocaleString("vi-VN")} đ</strong> (${o.paymentMethod})</div>
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

// ================= 12. MODAL LIÊN HỆ & TIỆN ÍCH THÔNG BÁO TOAST =================
function openContactModal() {
  const modal = document.getElementById("contactModal");
  if (!modal) return;
  modal.classList.remove("hidden");

  // Tự động điền thông tin nếu đã đăng nhập
  if (currentUser) {
    const nameEl = document.getElementById("contactName");
    const phoneEl = document.getElementById("contactPhone");
    const emailEl = document.getElementById("contactEmail");
    if (nameEl && !nameEl.value) nameEl.value = currentUser.name || "";
    if (phoneEl && !phoneEl.value) phoneEl.value = currentUser.phone || "";
    if (emailEl && !emailEl.value) emailEl.value = currentUser.email || "";
  }
}

function closeContactModal() {
  const modal = document.getElementById("contactModal");
  if (modal) modal.classList.add("hidden");
}

function handleContactSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("contactName")?.value.trim() || "";
  const phone = document.getElementById("contactPhone")?.value.trim() || "";
  const topic = document.getElementById("contactTopic")?.value || "Tư vấn";

  closeContactModal();
  showToast(`🎉 Cảm ơn anh ${name}! MENSTYLE đã nhận yêu cầu "${topic}" và sẽ liên hệ qua SĐT ${phone} sớm nhất.`);

  const form = document.getElementById("contactForm");
  if (form) form.reset();
}

function handleNewsletterSubmit(e) {
  if (e) e.preventDefault();
  openContactModal();
}

function showToast(msg) {
  const existing = document.querySelector(".toast-msg");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "toast-msg";
  toast.innerHTML = `<span>✨</span><span>${msg}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = "opacity 0.4s ease, transform 0.4s ease";
    toast.style.opacity = "0";
    toast.style.transform = "translate(-50%, 20px)";
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ================= 13. ĐIỀU HƯỚNG MENU ACTIVE (NỀN ĐEN DI CHUYỂN THEO TAB) =================
function handleNavClick(el, target) {
  // Bỏ active của tất cả các tab
  document.querySelectorAll(".nav-menu .nav-link").forEach((link) => {
    link.classList.remove("active");
  });

  // Chuyển active (nền đen chữ trắng) sang tab vừa bấm
  if (el) {
    el.classList.add("active");
  }

  // Điều hướng tương ứng
  if (target === "home") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (target === "catalog") {
    const catSection = document.getElementById("catalogSection") || document.getElementById("productsMain");
    if (catSection) catSection.scrollIntoView({ behavior: "smooth" });
  } else if (target === "promo") {
    const promoSection = document.getElementById("promoSection");
    if (promoSection) promoSection.scrollIntoView({ behavior: "smooth" });
  } else if (target === "news") {
    window.location.href = "news.html";
  } else if (target === "contact") {
    openContactModal();
  }
}

// ================= 14. EVENT LISTENERS & TIỆN ÍCH =================
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

  // Scroll Spy: Nền đen tự động bám theo khu vực người dùng đang xem khi cuộn trang
  window.addEventListener("scroll", () => {
    // Nếu modal liên hệ đang mở thì không can thiệp active
    const contactModal = document.getElementById("contactModal");
    if (contactModal && !contactModal.classList.contains("hidden")) return;

    const scrollPos = window.scrollY + 220;
    const promoEl = document.getElementById("promoSection");
    const catalogEl = document.getElementById("catalogSection");

    let currentNav = "home";
    if (catalogEl && scrollPos >= catalogEl.offsetTop) {
      currentNav = "catalog";
    } else if (promoEl && scrollPos >= promoEl.offsetTop) {
      currentNav = "promo";
    }

    document.querySelectorAll(".nav-menu .nav-link:not([data-nav='contact']):not([data-nav='news'])").forEach((l) => {
      if (l.getAttribute("data-nav") === currentNav) {
        l.classList.add("active");
      } else {
        l.classList.remove("active");
      }
    });
  }, { passive: true });
}

function escapeQuotes(str) {
  return (str || "").replace(/'/g, "\\'").replace(/"/g, "&quot;");
}
