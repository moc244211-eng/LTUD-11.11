/**
 * MENSTYLE MAGAZINE - EDITORIAL JAVASCRIPT LOGIC (news.js)
 * Modern Premium Fashion Magazine Client-Side Controller
 */

let currentCategory = 'Tất cả';
let currentSearch = '';
let currentSort = 'newest';
let currentPage = 1;
const PAGE_LIMIT = 6;

document.addEventListener('DOMContentLoaded', async () => {
  initUrlParams();
  initCategoryPills();
  initSearchAndSort();
  initNewsletter();

  // Load featured and grid
  await loadFeaturedEditorial();
  await loadArticles();

  // Check if direct slug in URL
  const urlParams = new URLSearchParams(window.location.search);
  const slugParam = urlParams.get('slug');
  if (slugParam) {
    openArticleDetail(slugParam, false);
  }

  // Update header badges
  updateHeaderCartAndWishlist();
  renderUserHeader();
});

// 1. Phân tích tham số URL
function initUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const cat = urlParams.get('category');
  if (cat) {
    currentCategory = cat;
    setActiveCategoryPill(cat);
  }
}

// 2. Tải và hiển thị bài viết nổi bật "ĐÁNG CHÚ Ý"
async function loadFeaturedEditorial() {
  const leadContainer = document.getElementById('magLeadArticle');
  const sideContainer = document.getElementById('magSideArticles');

  if (!leadContainer || !sideContainer) return;

  try {
    const res = await API.getFeaturedArticles();
    let articles = res && res.data && res.data.length > 0 ? res.data : API.getDefaultMockArticles().slice(0, 3);

    if (!articles || articles.length === 0) {
      articles = API.getDefaultMockArticles().slice(0, 3);
    }

    // Bài 1: Lead Article (Lớn bên trái)
    const lead = articles[0];
    leadContainer.innerHTML = `
      <div class="mag-card-lead" onclick="openArticleDetail('${lead.slug}')">
        <div class="mag-card-lead-thumb">
          <img src="${lead.image}" alt="${escapeHtml(lead.title)}" loading="lazy">
        </div>
        <div class="mag-card-lead-body">
          <span class="mag-card-badge">${escapeHtml(lead.category)}</span>
          <h3 class="mag-card-lead-title">${escapeHtml(lead.title)}</h3>
          <p class="mag-card-lead-excerpt">${escapeHtml(lead.excerpt)}</p>
          <div class="mag-card-meta">
            <div class="mag-card-meta-left">
              <span>✍️ <strong>${escapeHtml(lead.author || 'MENSTYLE')}</strong></span>
              <span>•</span>
              <span>📅 ${formatDate(lead.createdAt)}</span>
              <span>•</span>
              <span>⏱️ ${lead.readTime || '5 phút đọc'}</span>
            </div>
            <a href="javascript:void(0)" class="mag-card-btn-read">Đọc tiếp ➔</a>
          </div>
        </div>
      </div>
    `;

    // Bài 2 & 3: Side Articles (2 bài nhỏ bên phải)
    const sideArticles = articles.slice(1, 3);
    sideContainer.innerHTML = sideArticles.map(art => `
      <div class="mag-card-side" onclick="openArticleDetail('${art.slug}')">
        <div class="mag-card-side-thumb">
          <img src="${art.image}" alt="${escapeHtml(art.title)}" loading="lazy">
        </div>
        <div class="mag-card-side-body">
          <span class="mag-card-badge" style="background:#1e293b; font-size:10px; padding:3px 10px;">${escapeHtml(art.category)}</span>
          <h4 class="mag-card-side-title">${escapeHtml(art.title)}</h4>
          <p class="mag-card-side-excerpt">${escapeHtml(art.excerpt)}</p>
          <div class="mag-card-meta">
            <span style="font-size:11.5px; color:#64748b;">📅 ${formatDate(art.createdAt)} • 👁️ ${art.views || 0}</span>
            <a href="javascript:void(0)" class="mag-card-btn-read">Đọc tiếp ➔</a>
          </div>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Lỗi loadFeaturedEditorial:', err);
  }
}

// 3. Tải danh sách bài viết theo bộ lọc và phân trang
async function loadArticles() {
  const grid = document.getElementById('articlesGrid');
  const pagination = document.getElementById('newsPagination');
  const emptyState = document.getElementById('articlesEmptyState');

  if (!grid) return;

  grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #64748b;">⏳ Đang cập nhật những câu chuyện thời trang mới nhất...</div>';
  if (emptyState) emptyState.style.display = 'none';

  try {
    const res = await API.getArticles({
      category: currentCategory,
      search: currentSearch,
      sort: currentSort,
      page: currentPage,
      limit: PAGE_LIMIT,
    });

    let articles = res && res.data && res.data.length > 0 ? res.data : [];
    if (articles.length === 0 && (!currentSearch || currentSearch.trim() === '')) {
      let defaultList = API.getDefaultMockArticles();
      if (currentCategory && currentCategory !== 'Tất cả') {
        defaultList = defaultList.filter(a => a.category && a.category.toLowerCase().includes(currentCategory.toLowerCase()));
      }
      articles = defaultList;
    }
    const totalPages = res && res.totalPages ? res.totalPages : Math.ceil(articles.length / PAGE_LIMIT) || 1;

    if (articles.length === 0) {
      grid.innerHTML = '';
      if (emptyState) {
        emptyState.style.display = 'block';
        document.getElementById('emptySearchTerm').textContent = currentSearch ? `"${currentSearch}"` : currentCategory;
      }
      if (pagination) pagination.innerHTML = '';
      return;
    }

    grid.innerHTML = articles.map(art => `
      <div class="mag-card-grid" onclick="openArticleDetail('${art.slug}')">
        <div class="mag-card-grid-thumb">
          <img src="${art.image}" alt="${escapeHtml(art.title)}" loading="lazy">
          <span class="mag-card-grid-badge">${escapeHtml(art.category)}</span>
        </div>
        <div class="mag-card-grid-body">
          <h4 class="mag-card-grid-title">${escapeHtml(art.title)}</h4>
          <p class="mag-card-grid-excerpt">${escapeHtml(art.excerpt)}</p>
          <div class="mag-card-meta" style="margin-top: auto;">
            <div style="font-size: 11.5px; color: #64748b;">
              <span>📅 ${formatDate(art.createdAt)}</span>
              <span style="margin: 0 4px;">•</span>
              <span>⏱️ ${art.readTime || '4 phút'}</span>
            </div>
            <a href="javascript:void(0)" class="mag-card-btn-read">Đọc tiếp ➔</a>
          </div>
        </div>
      </div>
    `).join('');

    renderPagination(totalPages);

  } catch (err) {
    console.error('Lỗi loadArticles:', err);
    grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #dc2626; padding: 40px;">Không thể kết nối đến máy chủ bài viết. Vui lòng thử lại sau!</div>';
  }
}

// 4. Render phân trang
function renderPagination(totalPages) {
  const container = document.getElementById('newsPagination');
  if (!container || totalPages <= 1) {
    if (container) container.innerHTML = '';
    return;
  }

  let html = '';
  if (currentPage > 1) {
    html += `<button class="mag-page-btn" onclick="changePage(${currentPage - 1})">‹</button>`;
  }

  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="mag-page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
  }

  if (currentPage < totalPages) {
    html += `<button class="mag-page-btn" onclick="changePage(${currentPage + 1})">›</button>`;
  }

  container.innerHTML = html;
}

function changePage(page) {
  currentPage = page;
  loadArticles();
  document.getElementById('magazineLatestSection')?.scrollIntoView({ behavior: 'smooth' });
}

// 5. Thanh danh mục bài viết
function initCategoryPills() {
  const pills = document.querySelectorAll('.mag-cat-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.getAttribute('data-cat') || 'Tất cả';
      currentPage = 1;
      loadArticles();

      // Update URL without page refresh
      const url = new URL(window.location);
      if (currentCategory === 'Tất cả') {
        url.searchParams.delete('category');
      } else {
        url.searchParams.set('category', currentCategory);
      }
      window.history.pushState({}, '', url);
    });
  });
}

function setActiveCategoryPill(catName) {
  const pills = document.querySelectorAll('.mag-cat-pill');
  pills.forEach(p => {
    if (p.getAttribute('data-cat') === catName) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });
}

// 6. Tìm kiếm & Sắp xếp bài viết
function initSearchAndSort() {
  const searchInput = document.getElementById('magSearchInput');
  const sortSelect = document.getElementById('magSortSelect');

  let debounceTimer;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        currentSearch = e.target.value.trim();
        currentPage = 1;
        loadArticles();
      }, 350);
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      currentPage = 1;
      loadArticles();
    });
  }
}

// 7. Mở và hiển thị chi tiết bài viết (Article Reader)
async function openArticleDetail(slug, pushHistory = true) {
  const modal = document.getElementById('articleDetailModal');
  if (!modal) return;

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // Hiển thị skeleton loading
  document.getElementById('readerTitle').textContent = 'Đang tải bài viết...';
  document.getElementById('readerBreadcrumbCategory').textContent = '...';
  document.getElementById('readerBreadcrumbTitle').textContent = '...';
  document.getElementById('readerExcerpt').textContent = '';
  document.getElementById('readerBody').innerHTML = '<p style="color:#64748b;">Đang tải nội dung thời trang cao cấp...</p>';
  document.getElementById('readerTOC').innerHTML = '';

  try {
    const res = await API.getArticleBySlug(slug);
    if (!res || !res.success || !res.data) {
      alert('Không tìm thấy bài viết này!');
      closeArticleDetail();
      return;
    }

    const art = res.data;
    const related = res.related || [];

    // Cập nhật Breadcrumb
    document.getElementById('readerBreadcrumbCategory').textContent = art.category;
    document.getElementById('readerBreadcrumbCategory').href = `javascript:filterAndScrollToCategory('${escapeHtml(art.category)}')`;
    document.getElementById('readerBreadcrumbTitle').textContent = art.title;

    // Cập nhật Header bài viết
    document.getElementById('readerCategoryBadge').textContent = art.category;
    document.getElementById('readerTitle').textContent = art.title;
    document.getElementById('readerExcerpt').textContent = art.excerpt;
    document.getElementById('readerAuthor').textContent = art.author || 'MENSTYLE Editorial Team';
    document.getElementById('readerDate').textContent = formatDate(art.createdAt);
    document.getElementById('readerReadTime').textContent = art.readTime || '5 phút đọc';
    document.getElementById('readerViews').textContent = (art.views || 1).toLocaleString('vi-VN');

    // Cập nhật Ảnh Hero
    const heroImg = document.getElementById('readerHeroImg');
    if (heroImg) {
      heroImg.src = art.image;
      heroImg.alt = art.title;
    }

    // Parse and render TOC from H2 tags
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = art.content;
    const h2Elements = tempDiv.querySelectorAll('h2');
    const tocList = document.getElementById('readerTOC');
    const tocBox = document.getElementById('readerTOCBox');

    if (h2Elements.length > 0 && tocList) {
      tocBox.style.display = 'block';
      let tocHtml = '';
      h2Elements.forEach((h2, idx) => {
        const anchorId = `section-${idx + 1}`;
        h2.setAttribute('id', anchorId);
        tocHtml += `<li><a href="#${anchorId}" class="mag-toc-link" onclick="scrollToTOCSection(event, '${anchorId}')">📌 ${escapeHtml(h2.textContent)}</a></li>`;
      });
      tocList.innerHTML = tocHtml;
      document.getElementById('readerBody').innerHTML = tempDiv.innerHTML;
    } else {
      if (tocBox) tocBox.style.display = 'none';
      document.getElementById('readerBody').innerHTML = art.content;
    }

    // Render bài viết liên quan
    const relatedContainer = document.getElementById('readerRelatedGrid');
    if (relatedContainer) {
      if (related.length > 0) {
        relatedContainer.innerHTML = related.map(rel => `
          <div class="mag-related-card" onclick="openArticleDetail('${rel.slug}')">
            <div class="mag-related-thumb">
              <img src="${rel.image}" alt="${escapeHtml(rel.title)}" loading="lazy">
            </div>
            <div class="mag-related-info">
              <span style="font-size: 10.5px; font-weight: 700; color: #64748b; text-transform: uppercase;">${escapeHtml(rel.category)}</span>
              <h5 class="mag-related-card-title">${escapeHtml(rel.title)}</h5>
            </div>
          </div>
        `).join('');
      } else {
        relatedContainer.innerHTML = '<p style="color:#64748b; font-size:13px; grid-column:1/-1;">Đang cập nhật bài viết liên quan...</p>';
      }
    }

    // Cập nhật danh sách bài viết được quan tâm ở Sidebar
    loadSidebarPopular();

    // Cập nhật SEO Head & Schema cho Google Crawler / AI Search
    updateArticleSeoMeta(art);

    // Push URL History
    if (pushHistory) {
      const url = new URL(window.location);
      url.searchParams.set('slug', slug);
      window.history.pushState({ slug }, '', url);
    }

  } catch (err) {
    console.error('Lỗi openArticleDetail:', err);
    alert('Có lỗi xảy ra khi tải bài viết!');
  }
}

function closeArticleDetail() {
  const modal = document.getElementById('articleDetailModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';

    // Remove slug param from URL
    const url = new URL(window.location);
    url.searchParams.delete('slug');
    window.history.pushState({}, '', url);

    // Reset SEO title & dynamic schema
    resetArticleSeoMeta();
  }
}

// Cập nhật thẻ meta & Schema JSON-LD động phục vụ Google AI & Bot tìm kiếm
function updateArticleSeoMeta(art) {
  document.title = `${art.title} | MENSTYLE Magazine`;
  
  const descMeta = document.querySelector('meta[name="description"]');
  if (descMeta) descMeta.setAttribute('content', art.excerpt);

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', art.title);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', art.excerpt);

  const ogImg = document.querySelector('meta[property="og:image"]');
  if (ogImg) ogImg.setAttribute('content', art.image);

  // Cập nhật Canonical & OG:URL chuẩn xác cho từng bài viết tránh lỗi trùng lặp nội dung
  const articleUrl = `https://men-style.onrender.com/news.html?slug=${art.slug}`;
  let canonicalTag = document.querySelector('link[rel="canonical"]');
  if (!canonicalTag) {
    canonicalTag = document.createElement('link');
    canonicalTag.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalTag);
  }
  canonicalTag.setAttribute('href', articleUrl);

  let ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute('content', articleUrl);

  let schemaScript = document.getElementById('articleJsonLd');
  if (!schemaScript) {
    schemaScript = document.createElement('script');
    schemaScript.id = 'articleJsonLd';
    schemaScript.type = 'application/ld+json';
    document.head.appendChild(schemaScript);
  }

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": art.title,
    "description": art.excerpt,
    "image": [art.image],
    "datePublished": art.createdAt,
    "dateModified": art.updatedAt || art.createdAt,
    "author": [{
      "@type": "Person",
      "name": art.author || "MENSTYLE Editorial Team"
    }],
    "publisher": {
      "@type": "Organization",
      "name": "MENSTYLE – FASHION FOR MEN",
      "logo": {
        "@type": "ImageObject",
        "url": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl
    }
  };
  schemaScript.textContent = JSON.stringify(jsonLdData);
}

function resetArticleSeoMeta() {
  document.title = 'MENSTYLE Magazine – Tạp Chí Xu Hướng & Cẩm Nang Thời Trang Nam';
  const defaultUrl = 'https://men-style.onrender.com/news.html';
  const canonicalTag = document.querySelector('link[rel="canonical"]');
  if (canonicalTag) canonicalTag.setAttribute('href', defaultUrl);
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute('content', defaultUrl);

  const schemaScript = document.getElementById('articleJsonLd');
  if (schemaScript) schemaScript.remove();
}

// Cuộn mượt đến mục lục bài viết
function scrollToTOCSection(event, anchorId) {
  event.preventDefault();
  const el = document.getElementById(anchorId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Tải bài viết xem nhiều cho Sidebar Reader
async function loadSidebarPopular() {
  const container = document.getElementById('readerSidebarPopular');
  if (!container) return;

  try {
    const res = await API.getArticles({ sort: 'popular', limit: 4 });
    const populars = res && res.data ? res.data : [];
    container.innerHTML = populars.map(art => `
      <div class="mag-popular-item" onclick="openArticleDetail('${art.slug}')">
        <div class="mag-popular-thumb">
          <img src="${art.image}" alt="${escapeHtml(art.title)}" loading="lazy">
        </div>
        <div class="mag-popular-info">
          <h5 class="mag-popular-title">${escapeHtml(art.title)}</h5>
          <div class="mag-popular-meta">👁️ ${(art.views || 0).toLocaleString()} lượt xem</div>
        </div>
      </div>
    `).join('');
  } catch (err) {}
}

// 8. Chia sẻ bài viết & Sao chép liên kết
function shareFacebook() {
  const url = encodeURIComponent(window.location.href);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
}

function shareZalo() {
  const url = encodeURIComponent(window.location.href);
  window.open(`https://sp.zalo.me/plugins/share?url=${url}`, '_blank', 'width=600,height=400');
}

function copyArticleLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    alert('📋 Đã sao chép liên kết bài viết thành công! Bạn có thể dán để chia sẻ cho bạn bè.');
  }).catch(() => {
    prompt('Sao chép đường dẫn bài viết:', window.location.href);
  });
}

// 9. Lọc theo chuyên mục và cuộn xuống
function filterAndScrollToCategory(catName) {
  closeArticleDetail();
  currentCategory = catName;
  setActiveCategoryPill(catName);
  currentPage = 1;
  loadArticles();
  document.getElementById('magazineLatestSection')?.scrollIntoView({ behavior: 'smooth' });
}

// 10. Form đăng ký nhận tin
function initNewsletter() {
  const form = document.getElementById('magNewsletterForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('magNewsletterEmail');
    const email = input ? input.value.trim() : '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Vui lòng nhập địa chỉ email hợp lệ (ví dụ: yourname@gmail.com)!');
      return;
    }

    alert(`🎉 Cảm ơn quý anh đã đồng hành cùng MENSTYLE Magazine!\nBản tin thời trang nam và mã ưu đãi độc quyền đã được gửi tới hòm thư: ${email}`);
    if (input) input.value = '';
  });
}

// 11. Tiện ích định dạng ngày & escape HTML
function formatDate(dateString) {
  if (!dateString) return 'Mới đăng';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'Mới đăng';
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 12. Tích hợp Header (Giỏ hàng & User profile)
function updateHeaderCartAndWishlist() {
  try {
    const cart = JSON.parse(localStorage.getItem('MENSTYLE_CART') || '[]');
    const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const badge = document.getElementById('cartBadge');
    if (badge) {
      badge.textContent = totalCount;
      badge.style.display = totalCount > 0 ? 'flex' : 'none';
    }
  } catch (e) {}
}

function renderUserHeader() {
  const authArea = document.getElementById('authHeaderArea');
  const adminBtn = document.getElementById('newsHeaderAdminBtn');

  try {
    const userStr = localStorage.getItem('MENSTYLE_USER') || localStorage.getItem('MENSTYLE_USER');
    const token = localStorage.getItem('MENSTYLE_TOKEN') || localStorage.getItem('MENSTYLE_TOKEN');
    if (userStr && token) {
      const user = JSON.parse(userStr);
      if (authArea) {
        authArea.innerHTML = `
          <div class="user-profile-chip" onclick="handleUserAccountClick()" title="${user.name}">
            <div class="user-avatar-circle">${(user.name || 'U').charAt(0).toUpperCase()}</div>
            <span class="user-chip-name">${user.name.split(' ').slice(-1)[0]}</span>
          </div>
        `;
      }
      if (adminBtn) {
        adminBtn.style.display = user.role === 'admin' ? 'inline-flex' : 'none';
      }
    } else {
      if (adminBtn) adminBtn.style.display = 'none';
    }
  } catch (e) {}
}

function handleUserAccountClick() {
  const token = localStorage.getItem('MENSTYLE_TOKEN');
  if (token) {
    if (confirm('Quý khách muốn xem lịch sử đơn hàng hay Đăng xuất khỏi tài khoản?\n\n• Bấm OK: Về trang chủ xem đơn hàng\n• Bấm Cancel: Đăng xuất')) {
      window.location.href = 'index.html#myOrdersModal';
    } else {
      localStorage.removeItem('MENSTYLE_TOKEN');
      localStorage.removeItem('MENSTYLE_USER');
      window.location.reload();
    }
  } else {
    window.location.href = 'index.html#authModal';
  }
}

function openOrderTrackingModal() {
  sessionStorage.setItem("openTrackOrder", "true");
  window.location.href = "index.html";
}
