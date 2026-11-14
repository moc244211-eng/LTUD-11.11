/**
 * LOGIC WIDGET TRỢ LÝ AI GEMINI STYLIST 24/7 SIÊU CÁ NHÂN HÓA (RAG LIVE)
 * Tự động phân tích nhu cầu, trích xuất Catalog sản phẩm thực tế và ghép Outfit 1 Chạm.
 */

if (typeof escapeHtml !== "function") {
  window.escapeHtml = function (text) {
    if (!text) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };
}

let isChatOpen = false;

function toggleAIChat() {
  const windowEl = document.getElementById("aiChatWindow");
  if (!windowEl) return;

  isChatOpen = !isChatOpen;
  if (isChatOpen) {
    windowEl.classList.remove("hidden");
    document.getElementById("aiInput")?.focus();
  } else {
    windowEl.classList.add("hidden");
  }
}

function quickAskAI(promptText) {
  const input = document.getElementById("aiInput");
  if (!input) return;
  input.value = promptText;
  sendAIMessage();
}

async function sendAIMessage(e) {
  if (e) e.preventDefault();
  const input = document.getElementById("aiInput");
  const messagesContainer = document.getElementById("aiMessages");
  if (!input || !messagesContainer) return;

  const text = input.value.trim();
  if (!text) return;

  // 1. Render tin nhắn khách hàng
  appendMessage(text, "user");
  input.value = "";

  // 2. Render trạng thái AI đang phân tích dữ liệu RAG
  const typingId = "typing-" + Date.now();
  const typingEl = document.createElement("div");
  typingEl.className = "msg msg-ai";
  typingEl.id = typingId;
  typingEl.innerText = "🤵 AI Stylist đang tra cứu kho sản phẩm và thiết kế outfit...";
  messagesContainer.appendChild(typingEl);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // 3. Gọi API Backend (Gemini RAG)
  const res = await API.askAI(text);

  // 4. Xóa trạng thái gõ và hiển thị lời tư vấn
  const activeTyping = document.getElementById(typingId);
  if (activeTyping) activeTyping.remove();

  const replyText = res.success
    ? res.reply
    : res.message || "Dạ em xin lỗi anh, trợ lý AI đang quá tải. Anh vui lòng thử lại sau giây lát nhé!";
  appendMessage(replyText, "ai");
}

function appendMessage(text, sender) {
  const messagesContainer = document.getElementById("aiMessages");
  if (!messagesContainer) return;

  const msg = document.createElement("div");
  msg.className = `msg ${sender === "user" ? "msg-user" : "msg-ai"}`;

  // Kiểm tra cú pháp OUTFIT COMBO từ AI Stylist
  let comboMatch = text.match(/\[OUTFIT_COMBO:\s*(.*?)\s*\]/);
  let cleanText = text;
  let comboHtml = "";

  if (comboMatch && sender === "ai") {
    cleanText = text.replace(/\[OUTFIT_COMBO:\s*(.*?)\s*\]/g, "").trim();
    const parts = comboMatch[1].split("|").map((s) => s.trim());
    const outfitTitle = parts[0] || "Bộ Phối Quý Ông Thời Thượng";
    const productNames = parts.slice(1);

    // Tìm kiếm các sản phẩm trong kho bộ nhớ cachedProducts
    const allProds = window.cachedProducts || [];
    const matchedProducts = [];

    productNames.forEach((name) => {
      const found = allProds.find(
        (p) =>
          p.name.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(p.name.toLowerCase())
      );
      if (found) {
        matchedProducts.push(found);
      }
    });

    // Nếu không tìm thấy trong cache, tìm theo từ khóa phổ thông
    if (matchedProducts.length === 0 && allProds.length >= 2) {
      matchedProducts.push(allProds[0], allProds[1]);
    }

    if (matchedProducts.length > 0) {
      let rawTotal = 0;
      const itemsHtml = matchedProducts
        .map((p) => {
          rawTotal += Number(p.salePrice || 0);
          return `
            <div class="ai-outfit-item-row">
              <img src="${p.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200'}" class="ai-outfit-thumb" alt="${escapeHtml(p.name)}">
              <div class="ai-outfit-info">
                <div class="ai-outfit-item-name" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</div>
                <div class="ai-outfit-item-price">${Number(p.salePrice).toLocaleString("vi-VN")} đ</div>
              </div>
            </div>
          `;
        })
        .join("");

      const comboTotal = Math.round(rawTotal);
      const idsStr = matchedProducts.map((p) => p._id).join(",");

      comboHtml = `
        <div class="ai-outfit-card">
          <div class="ai-outfit-header">
            <div class="ai-outfit-title">🎩 ${escapeHtml(outfitTitle)}</div>
            <span class="ai-outfit-badge">GỢI Ý PHỐI ĐỒ</span>
          </div>
          <div class="ai-outfit-items">
            ${itemsHtml}
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; font-size:12px;">
            <span style="color:#64748b;">Tổng combo:</span>
            <strong style="font-size:15px; color:#dc2626;">${comboTotal.toLocaleString("vi-VN")} đ</strong>
          </div>
          <button type="button" class="btn-ai-add-outfit" onclick="addEntireOutfitToCart('${escapeHtml(outfitTitle)}', '${idsStr}')">
            🛍️ Thêm Toàn Bộ Outfit Vào Giỏ (1 Chạm) ➔
          </button>
        </div>
      `;
    }
  }

  // Chống XSS: Thoát toàn bộ ký tự HTML đặc biệt trước khi định dạng Markdown
  const safeText = escapeHtml(cleanText);
  let formatted = safeText
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");

  msg.innerHTML = formatted + comboHtml;
  messagesContainer.appendChild(msg);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Hàm thêm trọn bộ Outfit vào giỏ hàng 1 chạm
function addEntireOutfitToCart(outfitTitle, idListStr) {
  if (!idListStr) return;
  const ids = idListStr.split(",").filter(Boolean);
  const allProds = window.cachedProducts || [];
  let addedCount = 0;

  ids.forEach((id) => {
    const p = allProds.find((prod) => prod._id === id);
    if (p) {
      const defaultSize = p.sizes && p.sizes.length > 0 ? p.sizes[0] : "L";
      const discountedPrice = Math.round(Number(p.salePrice));
      if (typeof addToCart === "function") {
        addToCart(p._id, `${p.name} (Combo Outfit)`, discountedPrice, p.image, defaultSize);
        addedCount++;
      }
    }
  });

  if (addedCount > 0) {
    if (typeof showToast === "function") {
      showToast(`🎉 Đã thêm trọn bộ "${outfitTitle}" (${addedCount} món) vào giỏ hàng!`);
    } else {
      alert(`🎉 Đã thêm trọn bộ "${outfitTitle}" (${addedCount} món) vào giỏ hàng!`);
    }
    if (typeof openCartDrawer === "function") {
      openCartDrawer();
    }
  }
}
