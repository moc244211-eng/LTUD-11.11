/**
 * LOGIC WIDGET TRỢ LÝ AI GEMINI STYLIST TƯ VẤN PHỐI ĐỒ THỜI TRANG NAM
 */

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
  typingEl.innerText = "🤵 AI Stylist đang tra cứu kho sản phẩm và gợi ý phối đồ...";
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

  // Format cơ bản Markdown: **bold** thành <strong> và xuống dòng
  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");

  msg.innerHTML = formatted;
  messagesContainer.appendChild(msg);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
