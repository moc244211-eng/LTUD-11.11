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
const PAGE_LIMIT = 24; // Hiển thị đầy đủ sản phẩm trên 1 trang (chuẩn 6 cột)

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
  loadPromoProducts();
  loadProducts();
  updateCartUI();
  setupEventListeners();

  // Kiểm tra mở popup tra cứu đơn hàng nếu được điều hướng từ trang tin tức hoặc URL
  if (sessionStorage.getItem("openTrackOrder") === "true") {
    sessionStorage.removeItem("openTrackOrder");
    openOrderTrackingModal();
  }
  const trackParam = new URLSearchParams(window.location.search).get("track");
  if (trackParam) {
    openOrderTrackingModal(trackParam);
  }
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
  const sInput = document.getElementById("searchInput");
  if (sInput) sInput.value = "";
  currentSearch = "";
  currentMinPrice = "";
  currentMaxPrice = "";
  document.querySelectorAll(".price-pill").forEach((b) => b.classList.remove("active"));
  document.querySelector('.price-pill[data-min=""]')?.classList.add("active");

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
    currentCategory = "";
    currentSearch = name;
    if (sInput) sInput.value = name;
    currentPage = 1;
    loadProducts();
  }
}

function resetToAllProducts(el) {
  const catList = document.getElementById("categoryPills");
  if (catList) {
    catList.querySelectorAll(".filter-pill").forEach((b) => b.classList.remove("active"));
    const allBtn = catList.querySelector('.filter-pill[data-id=""]') || el;
    if (allBtn) allBtn.classList.add("active");
  }
  const sInput = document.getElementById("searchInput");
  if (sInput) sInput.value = "";
  currentCategory = "";
  currentSearch = "";
  currentMinPrice = "";
  currentMaxPrice = "";
  document.querySelectorAll(".price-pill").forEach((b) => b.classList.remove("active"));
  document.querySelector('.price-pill[data-min=""]')?.classList.add("active");
  currentPage = 1;
  loadProducts();
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
    let html = `<button class="filter-pill active" data-id="" data-slug="" onclick="resetToAllProducts(this)">Tất cả sản phẩm</button>`;
    res.data.forEach((cat) => {
      html += `<button class="filter-pill" data-id="${cat._id}" data-slug="${cat.slug}">${cat.name}</button>`;
    });
    catList.innerHTML = html;

    catList.querySelectorAll(".filter-pill").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        catList.querySelectorAll(".filter-pill").forEach((b) => b.classList.remove("active"));
        e.currentTarget.classList.add("active");
        currentCategory = e.currentTarget.getAttribute("data-id") || "";

        // Tự động dọn sạch từ khóa tìm kiếm & lọc giá để hiển thị đúng toàn bộ sản phẩm của danh mục
        const sInput = document.getElementById("searchInput");
        if (sInput) sInput.value = "";
        currentSearch = "";
        currentMinPrice = "";
        currentMaxPrice = "";
        document.querySelectorAll(".price-pill").forEach((b) => b.classList.remove("active"));
        document.querySelector('.price-pill[data-min=""]')?.classList.add("active");

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

// 5 Sản phẩm duy nhất được hưởng chính sách giảm giá
const DISCOUNTED_PRODUCT_NAMES = [
  "Áo Sơ Mi Nam Oxford Slimfit Chống Nhăn",
  "Áo Polo Nam Bo Cổ Dệt Kim Pique Cao Cấp",
  "Áo Thun Nam Oversize Cotton 100% Định Lượng 250gsm",
  "Quần Tây Nam Ống Đứng Cạp Chun Thông Minh",
  "Áo Khoác Blazer Nam 2 Cúc Phong Cách Hàn Quốc",
];

// ================= 3. RENDER PRODUCT CARD (CHUẨN 6 CỘT THEO MOCKUP) =================
function renderProductCard(p) {
  const isDiscounted =
    DISCOUNTED_PRODUCT_NAMES.includes(p.name) && p.originalPrice > p.salePrice;
  const discount = isDiscounted
    ? Math.round(((p.originalPrice - p.salePrice) / p.originalPrice) * 100)
    : 0;
  const catName = p.category ? (p.category.name || p.category) : "Thời trang nam";
  const imgUrl = p.image || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600";
  const isWishlisted = wishlist.includes(p._id);

  return `
    <div class="product-card">
      <div class="product-thumb-wrap" onclick="viewProductDetail('${p._id}')">
        <img src="${imgUrl}" alt="${escapeHtml(p.name)}" class="product-thumb" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600'">
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
          ${isDiscounted ? `<span class="original-price">${Number(p.originalPrice).toLocaleString("vi-VN")} đ</span>` : ""}
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

// ================= 4. SẢN PHẨM BÁN CHẠY (CHỈ GỒM CÁC SẢN PHẨM KHÔNG GIẢM GIÁ) =================
async function loadBestSellers() {
  const bestGrid = document.getElementById("bestSellerGrid");
  if (!bestGrid) return;

  bestGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 24px; color: #6b7280;">⏳ Đang tải sản phẩm bán chạy...</div>`;

  const res = await API.getProducts({ all: "true", sort: "rating" });
  if (res.success && Array.isArray(res.data) && res.data.length > 0) {
    // Loại trừ các sản phẩm khuyến mãi vì sản phẩm khuyến mãi CHỈ HIỆN ở khu vực Khuyến Mãi
    const regularProds = res.data.filter((p) => !DISCOUNTED_PRODUCT_NAMES.includes(p.name));
    const top6 = regularProds.slice(0, 6);
    bestGrid.innerHTML = top6.map(renderProductCard).join("");
  } else {
    bestGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 24px; color: #9ca3af;">Chưa có sản phẩm nổi bật</div>`;
  }
}

// ================= 4B. TẢI VÀ HIỂN THỊ SẢN PHẨM KHUYẾN MÃI (CHỈ XUẤT HIỆN TẠI ĐÂY) =================
async function loadPromoProducts() {
  const promoGrid = document.getElementById("promoProductsGrid");
  if (!promoGrid) return;

  promoGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 24px; color: #6b7280;">⏳ Đang tải sản phẩm khuyến mãi...</div>`;

  try {
    const res = await API.getProducts({ all: "true" });
    const allProds = res && res.success && Array.isArray(res.data) ? res.data : [];

    // Chỉ lấy đúng 5 sản phẩm khuyến mãi
    const promoProds = allProds.filter((p) => DISCOUNTED_PRODUCT_NAMES.includes(p.name));

    if (promoProds.length > 0) {
      promoGrid.innerHTML = promoProds.map(renderProductCard).join("");
    } else {
      promoGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 24px; color: #9ca3af;">Hiện tại chưa có chương trình khuyến mãi</div>`;
    }
  } catch (err) {
    console.error("Lỗi loadPromoProducts:", err);
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
    all: "true",
  });

  if (res.success && Array.isArray(res.data) && res.data.length > 0) {
    // Hiển thị đầy đủ tất cả sản phẩm (bao gồm cả sản phẩm giảm giá, phụ kiện, quần áo...)
    const allProds = res.data;
    window.cachedProducts = allProds;
    const total = allProds.length;
    const totalPages = Math.ceil(total / PAGE_LIMIT) || 1;
    const startIndex = (currentPage - 1) * PAGE_LIMIT;
    const paginatedProds = allProds.slice(startIndex, startIndex + PAGE_LIMIT);

    if (countEl) {
      if (totalPages > 1) {
        countEl.innerText = `Tìm thấy ${total} sản phẩm (Trang ${currentPage}/${totalPages})`;
      } else {
        countEl.innerText = `Tìm thấy ${total} sản phẩm`;
      }
    }

    grid.innerHTML = paginatedProds.map(renderProductCard).join("");
    renderPagination(totalPages);
    return;
  }

  if (countEl) countEl.innerText = "0 sản phẩm";
  grid.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 50px 20px; background: #ffffff; border-radius: 12px; border: 1px dashed #d1d5db;">
      <h3 style="font-size: 18px; margin-bottom: 8px;">🔍 Không tìm thấy sản phẩm phù hợp!</h3>
      <p style="color: #6b7280; font-size: 13.5px; margin-bottom: 14px;">Vui lòng thử chọn khoảng giá khác hoặc bấm 'Tất cả sản phẩm'.</p>
      <button class="hero-cta" style="padding: 8px 20px; font-size: 13px;" onclick="resetToAllProducts()">Xem Tất Cả Sản Phẩm ➔</button>
    </div>
  `;
  if (paginationWrapper) paginationWrapper.innerHTML = "";
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

  // Đảm bảo có dữ liệu sản phẩm trong cache
  if (!window.cachedProducts || window.cachedProducts.length === 0) {
    try {
      const allRes = await API.getProducts({ all: "true" });
      if (allRes.success && Array.isArray(allRes.data)) {
        window.cachedProducts = allRes.data;
      }
    } catch (e) {}
  }

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

    const isDiscounted =
      DISCOUNTED_PRODUCT_NAMES.includes(p.name) && p.originalPrice > p.salePrice;

    // Sinh HTML Smart Outfit Mix & Match Upsell Combo
    const mixMatchHtml = buildMixMatchHtml(p);

    content.innerHTML = `
      <div style="display: flex; gap: 24px; flex-wrap: wrap;">
        <img src="${imgUrl}" style="width: 100%; max-width: 260px; height: 340px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
        <div style="flex: 1; min-width: 250px;">
          <span style="font-size: 11.5px; color: #6b7280; font-weight: 800; text-transform: uppercase;">${catName} • ${p.brand || "MENSTYLE"}</span>
          <h3 style="font-size: 21px; font-weight: 800; margin: 6px 0 10px 0; color: #0b0b0b;">${p.name}</h3>
          
          <div style="font-size: 22px; font-weight: 900; color: ${isDiscounted ? 'var(--accent-red)' : 'var(--secondary)'}; margin-bottom: 12px;">
            ${Number(p.salePrice).toLocaleString("vi-VN")} đ
            ${isDiscounted ? `<span style="font-size:14px; color:#94a3b8; text-decoration:line-through; margin-left:8px;">${Number(p.originalPrice).toLocaleString("vi-VN")} đ</span>` : ""}
          </div>

          <div style="margin-bottom: 12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <label class="form-label" style="margin:0;">Kích Thước (Size):</label>
              <span style="font-size:12px; color:#64748b; font-weight:700;">Đang chọn: <strong id="selectedSizeLabel" style="color:#0b0b0b;">${selectedDetailSize}</strong></span>
            </div>
            <div class="size-selector" style="display: flex; gap: 8px;">${sizesHtml}</div>
          </div>

          <!-- ================= VIRTUAL FIT & SIZE FINDER 2.0 ================= -->
          <div class="virtual-fit-trigger-bar">
            <button type="button" class="btn-virtual-fit-toggle" onclick="toggleVirtualFitWidget()">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:16px;">📏</span>
                <strong>Bộ Đo Size Thông Minh 1 Chạm (Virtual Fit 2.0)</strong>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="vf-badge-recom">Khuyên Dùng</span>
                <span id="vfToggleArrow" style="font-size:13px; transition: transform 0.2s;">▾</span>
              </div>
            </button>
            
            <div class="virtual-fit-card hidden" id="virtualFitCard">
              <div class="vf-slider-row">
                <div class="vf-slider-header">
                  <span>Chiều cao của anh:</span>
                  <span class="vf-slider-bubble" id="vfHeightBubble">172 cm</span>
                </div>
                <input type="range" min="150" max="195" value="172" class="vf-range-input" id="vfHeightInput" oninput="onVirtualFitChange()">
              </div>

              <div class="vf-slider-row">
                <div class="vf-slider-header">
                  <span>Cân nặng của anh:</span>
                  <span class="vf-slider-bubble" id="vfWeightBubble">65 kg</span>
                </div>
                <input type="range" min="45" max="105" value="65" class="vf-range-input" id="vfWeightInput" oninput="onVirtualFitChange()">
              </div>

              <div style="margin-bottom: 10px;">
                <label class="vf-slider-header" style="margin-bottom:4px;">Dáng người:</label>
                <div class="vf-pill-selector" id="vfBuildSelector">
                  <button type="button" class="vf-pill-btn" data-val="slim" onclick="setVirtualFitBuild('slim')">Gầy (Slim)</button>
                  <button type="button" class="vf-pill-btn active" data-val="regular" onclick="setVirtualFitBuild('regular')">Cân Đối</button>
                  <button type="button" class="vf-pill-btn" data-val="solid" onclick="setVirtualFitBuild('solid')">Đậm / Có Bụng</button>
                </div>
              </div>

              <div style="margin-bottom: 10px;">
                <label class="vf-slider-header" style="margin-bottom:4px;">Sở thích mặc:</label>
                <div class="vf-pill-selector" id="vfFitPrefSelector">
                  <button type="button" class="vf-pill-btn" data-val="slim" onclick="setVirtualFitFitPref('slim')">Ôm vừa</button>
                  <button type="button" class="vf-pill-btn active" data-val="regular" onclick="setVirtualFitFitPref('regular')">Tiêu chuẩn</button>
                  <button type="button" class="vf-pill-btn" data-val="relaxed" onclick="setVirtualFitFitPref('relaxed')">Thoải mái</button>
                </div>
              </div>

              <div class="vf-result-box">
                <div class="vf-result-top">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:12px; color:#64748b; font-weight:700;">Form của anh:</span>
                    <span class="vf-size-target" id="vfTargetSize">SIZE L</span>
                  </div>
                  <span class="vf-accuracy-badge" id="vfAccuracy">Độ chuẩn xác 98%</span>
                </div>
                <p class="vf-advice-text" id="vfAdviceText">
                  Form L vừa vặn tuyệt đối ở vai và ngực, chiều dài vạt áo ngang hông thanh lịch, dễ sơ vin hoặc thả ngoài.
                </p>
                <button type="button" class="btn-vf-apply" id="vfApplyBtn" data-size="L" onclick="applyVirtualFitSize()">
                  ✓ Áp Dụng Size L Này
                </button>
              </div>
            </div>
          </div>

          <p style="font-size: 13.5px; color: #475569; line-height: 1.5; margin-bottom: 14px;">
            ${p.description || "Chất vải may đo cao cấp, mềm mại, thoáng mát và giữ form chuẩn phong cách phái mạnh."}
          </p>

          <div style="font-size: 13px; color: #64748b; margin-bottom: 16px; padding: 10px; background: #f8fafc; border-radius: 8px;">
            📦 Kho: <strong>${p.stock || 0}</strong> sản phẩm sẵn có | ⭐ Đánh giá: <strong>${p.rating || 5.0} / 5.0</strong>
          </div>

          <button class="btn-checkout-start" onclick="addCurrentDetailToCart()" style="padding:13px; font-size:14.5px;">
            🛒 Thêm Vào Giỏ Hàng
          </button>
        </div>
      </div>

      <!-- ================= SMART OUTFIT MIX & MATCH (UPSELL COMBO) ================= -->
      ${mixMatchHtml}
    `;

    // Khởi tạo tính toán ban đầu cho Virtual Fit
    calcVirtualFitSize();
  }
}

function selectSize(btn, size) {
  document.querySelectorAll(".size-selector .size-pill").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  selectedDetailSize = size;
  const label = document.getElementById("selectedSizeLabel");
  if (label) label.innerText = size;
  const mixSize0 = document.getElementById("mixItemSize0");
  if (mixSize0) mixSize0.innerText = size;
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

// ================= VIRTUAL FIT 2.0 LOGIC =================
let vfState = {
  height: 172,
  weight: 65,
  build: "regular",
  fitPref: "regular",
};

function toggleVirtualFitWidget() {
  const card = document.getElementById("virtualFitCard");
  const arrow = document.getElementById("vfToggleArrow");
  if (!card) return;
  const isHidden = card.classList.contains("hidden");
  if (isHidden) {
    card.classList.remove("hidden");
    if (arrow) arrow.style.transform = "rotate(180deg)";
    calcVirtualFitSize();
  } else {
    card.classList.add("hidden");
    if (arrow) arrow.style.transform = "rotate(0deg)";
  }
}

function onVirtualFitChange() {
  const hInput = document.getElementById("vfHeightInput");
  const wInput = document.getElementById("vfWeightInput");
  const hBubble = document.getElementById("vfHeightBubble");
  const wBubble = document.getElementById("vfWeightBubble");

  if (hInput) {
    vfState.height = parseInt(hInput.value, 10);
    if (hBubble) hBubble.innerText = `${vfState.height} cm`;
  }
  if (wInput) {
    vfState.weight = parseInt(wInput.value, 10);
    if (wBubble) wBubble.innerText = `${vfState.weight} kg`;
  }

  calcVirtualFitSize();
}

function setVirtualFitBuild(val) {
  vfState.build = val;
  const container = document.getElementById("vfBuildSelector");
  if (container) {
    container.querySelectorAll(".vf-pill-btn").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-val") === val);
    });
  }
  calcVirtualFitSize();
}

function setVirtualFitFitPref(val) {
  vfState.fitPref = val;
  const container = document.getElementById("vfFitPrefSelector");
  if (container) {
    container.querySelectorAll(".vf-pill-btn").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-val") === val);
    });
  }
  calcVirtualFitSize();
}

function calcVirtualFitSize() {
  const { height, weight, build, fitPref } = vfState;
  const hM = height / 100;
  let bmi = weight / (hM * hM);

  if (build === "slim") bmi -= 1.3;
  else if (build === "solid") bmi += 2.0;

  if (fitPref === "slim") bmi -= 0.8;
  else if (fitPref === "relaxed") bmi += 1.2;

  let recSize = "L";
  let accuracy = "98%";
  let advice = "";

  if (bmi < 20 || (height < 165 && weight < 56)) {
    recSize = "S";
    accuracy = "97%";
    advice = "Form S ôm gọn gàng, tôn chiều cao, tay áo và vai áo vừa vặn không bị thùng thình.";
  } else if (bmi < 22.8 || (height <= 172 && weight <= 67)) {
    recSize = "M";
    accuracy = "99%";
    advice = "Form M ôm nhẹ vừa vặn ở vai và ngực, chiều dài thân áo chạm ngang thắt lưng rất chuẩn.";
  } else if (bmi < 25.8 || (height <= 178 && weight <= 76)) {
    recSize = "L";
    accuracy = "98%";
    advice = "Form L vừa vặn tuyệt đối ở vai và ngực, chiều dài vạt áo ngang hông thanh lịch, dễ sơ vin hoặc thả ngoài.";
  } else if (bmi < 28.5 || (height <= 184 && weight <= 86)) {
    recSize = "XL";
    accuracy = "98%";
    advice = "Form XL có độ rộng vai và bắp tay thoải mái, che khuyết điểm vùng bụng cực tốt, cử động linh hoạt.";
  } else {
    recSize = "2XL";
    accuracy = "96%";
    advice = "Form 2XL thiết kế form rộng thoáng khí, vai và vòng ngực rộng rãi tối đa, thoải mái cả ngày.";
  }

  // Khớp với size có sẵn của sản phẩm
  if (selectedDetailProduct && Array.isArray(selectedDetailProduct.sizes) && selectedDetailProduct.sizes.length > 0) {
    if (!selectedDetailProduct.sizes.includes(recSize)) {
      if (recSize === "S" && selectedDetailProduct.sizes.includes("M")) recSize = "M";
      else if (selectedDetailProduct.sizes.includes("L")) recSize = "L";
      else recSize = selectedDetailProduct.sizes[0];
    }
  }

  const targetEl = document.getElementById("vfTargetSize");
  const accEl = document.getElementById("vfAccuracy");
  const adviceEl = document.getElementById("vfAdviceText");
  const applyBtn = document.getElementById("vfApplyBtn");

  if (targetEl) targetEl.innerText = `SIZE ${recSize}`;
  if (accEl) accEl.innerText = `Độ chuẩn xác ${accuracy}`;
  if (adviceEl) adviceEl.innerText = advice;
  if (applyBtn) {
    applyBtn.innerText = `✓ Áp Dụng Size ${recSize} Này`;
    applyBtn.setAttribute("data-size", recSize);
  }
}

function applyVirtualFitSize() {
  const applyBtn = document.getElementById("vfApplyBtn");
  const size = applyBtn?.getAttribute("data-size") || "L";

  const sizePills = document.querySelectorAll("#productDetailContent .size-selector .size-pill");
  let found = false;
  sizePills.forEach((btn) => {
    if (btn.innerText.trim() === size) {
      selectSize(btn, size);
      found = true;
    }
  });

  if (!found && sizePills.length > 0) {
    selectSize(sizePills[0], sizePills[0].innerText.trim());
  }

  showToast(`🎉 Đã áp dụng Size ${size} chuẩn theo vóc dáng của bạn!`);
}

// ================= SMART OUTFIT MIX & MATCH LOGIC =================
window.activeComboItems = [];

function buildMixMatchHtml(mainProd) {
  const all = window.cachedProducts || [];
  if (!all || all.length < 2) return "";

  const mainCat = (mainProd.category?.name || mainProd.category || "").toLowerCase();
  const mainName = mainProd.name.toLowerCase();

  let comp1 = null;
  let comp2 = null;

  if (mainName.includes("áo") || mainCat.includes("áo")) {
    comp1 = all.find((p) => p._id !== mainProd._id && (p.name.toLowerCase().includes("quần") || (p.category?.name || "").toLowerCase().includes("quần")));
    comp2 = all.find((p) => p._id !== mainProd._id && p._id !== comp1?._id && (p.name.toLowerCase().includes("thắt lưng") || p.name.toLowerCase().includes("ví") || p.name.toLowerCase().includes("blazer") || p.name.toLowerCase().includes("khoác")));
  } else if (mainName.includes("quần") || mainCat.includes("quần")) {
    comp1 = all.find((p) => p._id !== mainProd._id && (p.name.toLowerCase().includes("sơ mi") || p.name.toLowerCase().includes("polo")));
    comp2 = all.find((p) => p._id !== mainProd._id && p._id !== comp1?._id && (p.name.toLowerCase().includes("thắt lưng") || p.name.toLowerCase().includes("khoác") || p.name.toLowerCase().includes("blazer")));
  } else {
    comp1 = all.find((p) => p._id !== mainProd._id && p.name.toLowerCase().includes("sơ mi"));
    comp2 = all.find((p) => p._id !== mainProd._id && p._id !== comp1?._id && p.name.toLowerCase().includes("quần"));
  }

  if (!comp1) comp1 = all.find((p) => p._id !== mainProd._id);
  if (!comp2) comp2 = all.find((p) => p._id !== mainProd._id && p._id !== comp1?._id);

  if (!comp1 || !comp2) return "";

  window.activeComboItems = [
    { ...mainProd, isAnchor: true, checked: true, chosenSize: selectedDetailSize || "L" },
    { ...comp1, isAnchor: false, checked: true, chosenSize: comp1.sizes?.[0] || "L" },
    { ...comp2, isAnchor: false, checked: true, chosenSize: comp2.sizes?.[0] || "L" },
  ];

  const totalRaw = mainProd.salePrice + comp1.salePrice + comp2.salePrice;
  const comboPrice = Math.round((totalRaw * 0.90) / 1000) * 1000;
  const savings = totalRaw - comboPrice;

  return `
    <div class="mix-match-section">
      <div class="mix-match-header">
        <div class="mix-match-title">
          <span>🎩</span>
          <span>Hoàn Thiện Phong Thái Quý Ông (Mix & Match)</span>
        </div>
        <span class="mix-match-badge">TIẾT KIỆM 10% + FREESHIP</span>
      </div>

      <div class="mix-match-grid">
        <!-- Món 1: Sản phẩm chính -->
        <div class="mix-item-card">
          <input type="checkbox" checked disabled class="mix-item-checkbox" title="Sản phẩm đang chọn">
          <img src="${mainProd.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200'}" alt="${escapeHtml(mainProd.name)}" class="mix-item-img" loading="lazy">
          <div class="mix-item-name">${escapeHtml(mainProd.name)}</div>
          <div class="mix-item-price">${Number(mainProd.salePrice).toLocaleString("vi-VN")} đ</div>
          <div style="font-size:11px; color:#64748b; font-weight:700;">Size: <span id="mixItemSize0">${selectedDetailSize || "L"}</span></div>
        </div>

        <!-- Món 2: Phối kèm 1 -->
        <div class="mix-item-card">
          <input type="checkbox" id="mixCheck1" checked class="mix-item-checkbox" onchange="recalculateMixMatchCombo()">
          <img src="${comp1.image || 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=200'}" alt="${escapeHtml(comp1.name)}" class="mix-item-img" loading="lazy">
          <div class="mix-item-name">${escapeHtml(comp1.name)}</div>
          <div class="mix-item-price">${Number(comp1.salePrice).toLocaleString("vi-VN")} đ</div>
          <select class="mix-item-size-select" id="mixSelectSize1" onchange="updateMixItemSize(1, this.value)">
            ${(comp1.sizes || ["M", "L", "XL", "2XL"]).map((s) => `<option value="${s}" ${s === 'L' ? 'selected' : ''}>Size ${s}</option>`).join("")}
          </select>
        </div>

        <!-- Món 3: Phối kèm 2 -->
        <div class="mix-item-card">
          <input type="checkbox" id="mixCheck2" checked class="mix-item-checkbox" onchange="recalculateMixMatchCombo()">
          <img src="${comp2.image || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200'}" alt="${escapeHtml(comp2.name)}" class="mix-item-img" loading="lazy">
          <div class="mix-item-name">${escapeHtml(comp2.name)}</div>
          <div class="mix-item-price">${Number(comp2.salePrice).toLocaleString("vi-VN")} đ</div>
          <select class="mix-item-size-select" id="mixSelectSize2" onchange="updateMixItemSize(2, this.value)">
            ${(comp2.sizes || ["M", "L", "XL", "2XL"]).map((s) => `<option value="${s}" ${s === 'L' ? 'selected' : ''}>Size ${s}</option>`).join("")}
          </select>
        </div>
      </div>

      <!-- Thanh tổng kết Combo -->
      <div class="mix-match-summary-bar">
        <div class="mix-summary-left">
          <span class="mix-summary-old-price" id="mixOldPrice">${Number(totalRaw).toLocaleString("vi-VN")} đ</span>
          <div style="display:flex; align-items:baseline; gap:8px;">
            <span class="mix-summary-combo-price" id="mixComboPrice">${Number(comboPrice).toLocaleString("vi-VN")} đ</span>
            <span class="mix-summary-perk" id="mixSavings">Tiết kiệm ${Number(savings).toLocaleString("vi-VN")} đ</span>
          </div>
          <span style="font-size:11px; color:#94a3b8;">🚚 Áp dụng Miễn Phí Vận Chuyển toàn quốc</span>
        </div>

        <button type="button" class="btn-buy-combo" onclick="buyMixMatchCombo()">
          🛍️ Mua Cả Combo Tiết Kiệm ➔
        </button>
      </div>
    </div>
  `;
}

function updateMixItemSize(idx, size) {
  if (window.activeComboItems && window.activeComboItems[idx]) {
    window.activeComboItems[idx].chosenSize = size;
  }
}

function recalculateMixMatchCombo() {
  if (!window.activeComboItems || window.activeComboItems.length < 3) return;

  const chk1 = document.getElementById("mixCheck1")?.checked ?? true;
  const chk2 = document.getElementById("mixCheck2")?.checked ?? true;

  window.activeComboItems[1].checked = chk1;
  window.activeComboItems[2].checked = chk2;

  let totalRaw = window.activeComboItems[0].salePrice;
  let count = 1;

  if (chk1) {
    totalRaw += window.activeComboItems[1].salePrice;
    count++;
  }
  if (chk2) {
    totalRaw += window.activeComboItems[2].salePrice;
    count++;
  }

  const discountRate = count >= 2 ? 0.10 : 0;
  const comboPrice = Math.round((totalRaw * (1 - discountRate)) / 1000) * 1000;
  const savings = totalRaw - comboPrice;

  const oldPriceEl = document.getElementById("mixOldPrice");
  const comboPriceEl = document.getElementById("mixComboPrice");
  const savingsEl = document.getElementById("mixSavings");

  if (oldPriceEl) oldPriceEl.innerText = `${Number(totalRaw).toLocaleString("vi-VN")} đ`;
  if (comboPriceEl) comboPriceEl.innerText = `${Number(comboPrice).toLocaleString("vi-VN")} đ`;
  if (savingsEl) {
    savingsEl.innerText = discountRate > 0 ? `Tiết kiệm ${Number(savings).toLocaleString("vi-VN")} đ` : `Mua lẻ`;
  }
}

function buyMixMatchCombo() {
  if (!window.activeComboItems || window.activeComboItems.length === 0) return;

  window.activeComboItems[0].chosenSize = selectedDetailSize || "L";

  const checkedItems = window.activeComboItems.filter((item) => item.checked);
  if (checkedItems.length === 0) return;

  const discountRate = checkedItems.length >= 2 ? 0.90 : 1.0;
  let addedCount = 0;

  checkedItems.forEach((item) => {
    const finalPrice = Math.round((Number(item.salePrice) * discountRate) / 1000) * 1000;
    const tag = checkedItems.length >= 2 ? ` (Combo -10%)` : ``;
    addToCart(
      item._id,
      `${item.name}${tag}`,
      finalPrice,
      item.image,
      item.chosenSize || "L"
    );
    addedCount++;
  });

  closeProductDetailModal();
  openCartDrawer();
  showToast(`🎉 Đã thêm ${addedCount} món Combo vào giỏ! Tiết kiệm ngay 10%!`);
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
    openOrderTrackingModal(createdOrder.orderCode);
  }
}

// Gọi API Backend sinh mã VietQR động chuẩn tài khoản MB Bank - 0862583284 - MÀN MỘC SÁNG
window.activeQROrder = null;
window.activeTransferNote = "";

async function showDynamicQRModal(order, paymentMethod) {
  const modal = document.getElementById("qrModal");
  const qrImg = document.getElementById("qrImage");
  const orderCodeEl = document.getElementById("qrOrderCode");
  const totalEl = document.getElementById("qrTotalAmount");
  const infoEl = document.getElementById("qrNoteInfo");

  window.activeQROrder = typeof order === "object" ? order : { _id: order, orderCode: String(order).slice(-8) };
  const orderId = order._id || order;
  const orderCode = order.orderCode || (typeof order === "string" ? order.slice(-8) : "DH");
  const totalAmount = order.totalAmount || 0;

  if (modal) modal.classList.remove("hidden");
  if (orderCodeEl) orderCodeEl.innerText = `#${orderCode}`;
  if (totalEl) totalEl.innerText = `${Number(totalAmount).toLocaleString("vi-VN")} đ`;

  window.activeTransferNote = `DH ${orderCode}`;

  // Mã QR chuẩn tài khoản cá nhân: MB Bank - STK 0862583284 - MÀN MỘC SÁNG
  const defaultQrUrl =
    paymentMethod === "MOMO_QR"
      ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
          `2|99|0862583284|MÀN MỘC SÁNG||0|0|${totalAmount}|DH ${orderCode}|transfer_myqr`
        )}`
      : `https://img.vietqr.io/image/MB-0862583284-compact2.png?amount=${totalAmount}&addInfo=DH%20${orderCode}&accountName=M%C3%80N%20M%E1%BB%98C%20S%C3%81NG`;

  if (qrImg) qrImg.src = defaultQrUrl;
  if (infoEl) infoEl.innerText = `📝 Nội dung: DH ${orderCode}`;

  // Gọi API Backend lấy mã VietQR đồng bộ
  try {
    const res = await API.createPaymentQR(orderId, paymentMethod);
    if (res.success && res.data && res.data.qrUrl) {
      if (qrImg) qrImg.src = res.data.qrUrl;
      window.activeTransferNote = res.data.transferNote;
      if (infoEl) {
        infoEl.innerText = `📝 Nội dung: ${res.data.transferNote}`;
      }
    }
  } catch (err) {
    console.warn("Lỗi gọi API VietQR:", err);
  }
}

function copyTextToClipboard(text, successMsg = "Đã sao chép vào bộ nhớ tạm!") {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      alert(`📋 ${successMsg}`);
    }).catch(() => {
      fallbackCopyText(text, successMsg);
    });
  } else {
    fallbackCopyText(text, successMsg);
  }
}

function fallbackCopyText(text, successMsg) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    alert(`📋 ${successMsg}`);
  } catch (err) {
    prompt("Vui lòng nhấn Ctrl+C để sao chép:", text);
  }
  document.body.removeChild(textArea);
}

function copyCurrentTransferNote() {
  const note = window.activeTransferNote || (window.activeQROrder ? `DH ${window.activeQROrder.orderCode}` : "DH");
  copyTextToClipboard(note, `Đã sao chép nội dung chuyển khoản: "${note}"!`);
}

function confirmCompletedTransfer() {
  const modal = document.getElementById("qrModal");
  if (modal) modal.classList.add("hidden");
  const orderCode = window.activeQROrder?.orderCode || "";
  openOrderTrackingModal(orderCode);
}

function closeQRModal() {
  const modal = document.getElementById("qrModal");
  if (modal) modal.classList.add("hidden");
}

// ================= HÀM XỬ LÝ AN TOÀN HTML XSS =================
function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ================= TRA CỨU ĐƠN HÀNG THỜI GIAN THỰC (ORDER TRACKING) =================
function openOrderTrackingModal(prefillQuery = "") {
  const modal = document.getElementById("orderTrackingModal");
  if (!modal) return;
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  if (prefillQuery) {
    const input = document.getElementById("trackingSearchInput");
    if (input) {
      input.value = prefillQuery;
      handleTrackOrderSearch();
    }
  }
}

function closeOrderTrackingModal() {
  const modal = document.getElementById("orderTrackingModal");
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }
}

async function handleTrackOrderSearch() {
  const input = document.getElementById("trackingSearchInput");
  const container = document.getElementById("trackingResultArea");
  if (!input || !container) return;

  const rawQuery = input.value.trim();
  if (!rawQuery) {
    container.innerHTML = `<div style="text-align:center; padding:20px; color:#ef4444; font-weight:bold;">⚠️ Vui lòng nhập mã đơn hàng (MS...) hoặc số điện thoại!</div>`;
    return;
  }

  // Tự động xử lý bỏ ký tự '#' nếu người dùng nhập kèm (VD: #MS33018786 -> MS33018786)
  const query = rawQuery.replace(/^#+/, "").trim() || rawQuery;

  container.innerHTML = `<div style="text-align:center; padding:35px; color:#64748b;">⏳ Đang tra cứu thông tin đơn hàng trên hệ thống...</div>`;

  try {
    const res = await API.trackOrder(query);
    if (!res.success || !res.data || res.data.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:35px; background:#fff1f2; border:1px solid #fecdd3; border-radius:10px; color:#9f1239;">
          <span style="font-size:32px; display:block; margin-bottom:8px;">🔎</span>
          <strong style="font-size:16px;">Không tìm thấy đơn hàng khớp với "${escapeHtml(rawQuery)}"!</strong>
          <p style="font-size:13px; color:#be123c; margin-top:8px;">Vui lòng kiểm tra lại Mã đơn hàng (VD: MS33018786) hoặc Số điện thoại bạn đã dùng khi đặt hàng.</p>
        </div>
      `;
      return;
    }

    const orders = res.data;
    container.innerHTML = `
      <div style="font-size:13px; color:#64748b; margin-bottom:14px;">
        Đã tìm thấy <strong>${orders.length}</strong> đơn hàng tương ứng:
      </div>
      ${orders.map(renderTrackingCard).join("")}
    `;
  } catch (err) {
    container.innerHTML = `<div style="text-align:center; padding:20px; color:#ef4444;">❌ Lỗi kết nối: ${escapeHtml(err.message)}</div>`;
  }
}

function renderTrackingCard(ord) {
  const dateStr = new Date(ord.createdAt).toLocaleString("vi-VN");
  const isPaid = ord.paymentStatus === "PAID";
  const isCancelled = ord.orderStatus === "CANCELLED";

  // Xác định trạng thái tiến trình (5 bước)
  // PENDING -> CONFIRMED -> PROCESSING -> SHIPPING -> COMPLETED
  let activeStep = 1;
  if (ord.orderStatus === "CONFIRMED") activeStep = 2;
  else if (ord.orderStatus === "PROCESSING") activeStep = 3;
  else if (ord.orderStatus === "SHIPPING") activeStep = 4;
  else if (ord.orderStatus === "COMPLETED") activeStep = 5;

  const stepsHtml = isCancelled
    ? `
      <div class="tracking-stepper">
        <div class="tracking-step cancelled">
          <div class="step-icon-bubble">✕</div>
          <div class="step-label">Đã Hủy Đơn</div>
        </div>
      </div>
    `
    : `
      <div class="tracking-stepper">
        <div class="tracking-step ${activeStep >= 1 ? (activeStep === 1 ? 'active' : 'completed') : ''}">
          <div class="step-icon-bubble">${activeStep > 1 ? '✓' : '📝'}</div>
          <div class="step-label">Đã Tiếp Nhận</div>
        </div>
        <div class="tracking-step ${activeStep >= 2 ? (activeStep === 2 ? 'active' : 'completed') : ''}">
          <div class="step-icon-bubble">${activeStep > 2 ? '✓' : '💳'}</div>
          <div class="step-label">Xác Nhận Đơn</div>
        </div>
        <div class="tracking-step ${activeStep >= 3 ? (activeStep === 3 ? 'active' : 'completed') : ''}">
          <div class="step-icon-bubble">${activeStep > 3 ? '✓' : '📦'}</div>
          <div class="step-label">Đang Đóng Gói</div>
        </div>
        <div class="tracking-step ${activeStep >= 4 ? (activeStep === 4 ? 'active' : 'completed') : ''}">
          <div class="step-icon-bubble">${activeStep > 4 ? '✓' : '🚚'}</div>
          <div class="step-label">Đang Giao Hàng</div>
        </div>
        <div class="tracking-step ${activeStep >= 5 ? 'active completed' : ''}">
          <div class="step-icon-bubble">🎉</div>
          <div class="step-label">Giao Thành Công</div>
        </div>
      </div>
    `;

  return `
    <div class="tracking-order-card">
      <div class="tracking-header-row">
        <div>
          <div class="tracking-order-code">#${ord.orderCode || ord._id.slice(-8).toUpperCase()}</div>
          <div style="font-size:12px; color:#64748b; margin-top:2px;">📅 Đặt lúc: ${dateStr}</div>
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <span class="badge-status status-${ord.paymentStatus}">
            ${isPaid ? '✓ ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'} (${ord.paymentMethod})
          </span>
          <span class="badge-status status-${ord.orderStatus}">
            ${ord.orderStatus}
          </span>
        </div>
      </div>

      <!-- Hành trình vận chuyển (Timeline Stepper) -->
      ${stepsHtml}

      <!-- Thông tin nhận hàng -->
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 14px; margin-bottom:14px; font-size:13px; line-height:1.6;">
        <div>👤 <strong>Người nhận:</strong> ${escapeHtml(ord.customerName)} (${ord.customerPhoneMasked || ord.customerPhone})</div>
        <div>📍 <strong>Địa chỉ giao:</strong> ${escapeHtml(ord.shippingAddress)}</div>
        ${ord.note ? `<div style="color:#64748b;">📝 <strong>Ghi chú:</strong> ${escapeHtml(ord.note)}</div>` : ''}
      </div>

      <!-- Danh sách sản phẩm -->
      <div style="margin-bottom:14px;">
        <h5 style="font-size:13px; font-weight:800; text-transform:uppercase; color:#0f172a; margin-bottom:8px;">Sản phẩm (${(ord.items || []).length}):</h5>
        ${(ord.items || []).map(item => `
          <div class="tracking-item-row">
            <img src="${item.image || 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=200'}" alt="${escapeHtml(item.name)}" class="tracking-item-thumb">
            <div class="tracking-item-info">
              <div class="tracking-item-name">${escapeHtml(item.name)}</div>
              <div class="tracking-item-meta">Size: <strong>${item.size || 'L'}</strong> • SL: <strong>x${item.quantity}</strong></div>
            </div>
            <div style="text-align:right; font-size:13.5px; font-weight:700; color:#0f172a;">
              ${Number(item.price * item.quantity).toLocaleString('vi-VN')} đ
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Tổng tiền & Nút thao tác -->
      <div class="tracking-footer-summary">
        <div>
          <div style="font-size:12px; color:#64748b;">
            Tạm tính: ${Number((ord.totalAmount || 0) - (ord.shippingFee || 0) + (ord.discountAmount || 0)).toLocaleString('vi-VN')} đ | Phí ship: ${Number(ord.shippingFee || 0).toLocaleString('vi-VN')} đ
          </div>
          <div style="font-size:16px; font-weight:900; color:var(--danger); margin-top:2px;">
            Tổng thanh toán: ${Number(ord.totalAmount).toLocaleString('vi-VN')} đ
          </div>
        </div>
        <div style="display:flex; gap:8px;">
          ${!isPaid && ord.paymentMethod === 'VIETQR' && !isCancelled ? `
            <button type="button" class="btn-checkout-start" style="width:auto; padding:8px 14px; font-size:12.5px; background:#2563eb;" onclick="closeOrderTrackingModal(); showDynamicQRModal('${ord._id}', 'VIETQR');">
              📲 Xem Lại Mã VietQR
            </button>
          ` : ''}
          <a href="tel:0862583284" class="btn-checkout-start" style="width:auto; padding:8px 14px; font-size:12.5px; background:#0f172a; text-decoration:none;">
            📞 Hỗ Trợ Đơn
          </a>
        </div>
      </div>
    </div>
  `;
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

  // Quản lý hiển thị nút Quản trị viên: Chỉ tài khoản có role 'admin' mới được nhìn thấy
  const adminBtn = document.getElementById("headerAdminBtn");
  if (adminBtn) {
    if (currentUser && authToken && currentUser.role === "admin") {
      adminBtn.style.display = "inline-flex";
    } else {
      adminBtn.style.display = "none";
    }
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

async function handleContactSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("contactName")?.value.trim() || "";
  const phone = document.getElementById("contactPhone")?.value.trim() || "";
  const email = document.getElementById("contactEmail")?.value.trim() || "";
  const topic = document.getElementById("contactTopic")?.value || "Tư vấn";
  const message = document.getElementById("contactMessage")?.value.trim() || "";

  if (!name || !phone || !message) {
    alert("Vui lòng nhập đầy đủ họ tên, số điện thoại và nội dung lời nhắn!");
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = "⏳ Đang gửi yêu cầu...";
  }

  try {
    const res = await API.sendContact({ name, phone, email, topic, message });
    if (res && res.success) {
      closeContactModal();
      showToast(`🎉 Cảm ơn anh ${name}! MENSTYLE đã tiếp nhận yêu cầu và sẽ gọi điện hỗ trợ sớm nhất.`);
      const form = document.getElementById("contactForm");
      if (form) form.reset();
    } else {
      alert("❌ " + (res?.message || "Không thể gửi liên hệ, vui lòng thử lại sau"));
    }
  } catch (err) {
    console.error("Lỗi gửi liên hệ:", err);
    alert("❌ Lỗi kết nối đến máy chủ.");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = "Gửi Yêu Cầu Liên Hệ ➔";
    }
  }
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
