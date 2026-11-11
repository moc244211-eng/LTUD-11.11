const { GoogleGenerativeAI } = require("@google/generative-ai");
require("../models/Category"); // Đảm bảo Schema Category được đăng ký trước khi populate
const Product = require("../models/Product");

// [POST] /api/ai/chat - Trợ lý ảo AI Stylist Thời trang Nam (Gemini RAG)
exports.chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập câu hỏi!",
      });
    }

    // 1. Kỹ thuật RAG: Truy vấn thời gian thực danh mục & sản phẩm từ MongoDB Atlas
    const products = await Product.find()
      .populate("category", "name")
      .select("name salePrice originalPrice stock rating sizes description category brand");

    const productCatalog = products
      .map(
        (p, idx) =>
          `${idx + 1}. [${p.brand || "MENSTYLE"}] "${p.name}" | Danh mục: ${p.category ? p.category.name : "Thời trang"} | Giá: ${Number(p.salePrice).toLocaleString("vi-VN")} đ | Kho: ${p.stock} cái | Size: ${(p.sizes || []).join(", ") || "M, L, XL"} | Đánh giá: ${p.rating}⭐ | Đặc tính: ${p.description}`
      )
      .join("\n");

    const systemInstruction = `
Bạn là "MENSTYLE AI Fashion Stylist" - Chuyên gia tư vấn thời trang & định hình phong cách phái mạnh của Cửa hàng Thời trang Nam MENSTYLE.
DƯỚI ĐÂY LÀ DANH MỤC SẢN PHẨM HIỆN CÓ THẬT TRONG CƠ SỞ DỮ LIỆU CỦA SHOP (RAG CONTEXT):
${productCatalog}

QUY TẮC TƯ VẤN CỦA STYLIST:
1. Xưng hô lịch lãm, tinh tế: "Dạ em chào anh/bạn", "Em là Stylist của MENSTYLE".
2. BẢNG TƯ VẤN CHỌN SIZE CHUẨN NAM:
   - Dưới 1m68, cân nặng 50 - 59kg: Size M
   - Từ 1m68 - 1m74, cân nặng 60 - 69kg: Size L
   - Từ 1m74 - 1m80, cân nặng 70 - 79kg: Size XL
   - Trên 1m80 hoặc trên 80kg: Size 2XL
3. NGHỆ THUẬT PHỐI ĐỒ (OUTFIT COMBO):
   - Công sở, lịch sự: Áo Sơ mi Oxford / Sơ mi lụa + Quần Tây âu + Thắt lưng da.
   - Năng động, dạo phố, đi chơi: Áo Polo dệt kim hoặc Áo thun Cotton basic + Quần Kaki / Quần Short.
   - Hẹn hò, tiệc tùng: Áo Blazer nam + Áo thun trơn bên trong + Quần tây âu / Jeans đen.
4. CHỈ giới thiệu các sản phẩm có thật trong danh sách trên, nêu chính xác giá bán và số lượng size còn lại.
5. Luôn kết thúc bằng lời mời thân thiện: mời khách bấm vào nút "Thêm giỏ" trên giao diện để đặt hàng.
`;

    const apiKey = process.env.GEMINI_API_KEY;

    // 2. Gọi Google Gemini AI Model
    if (apiKey && apiKey !== "AIzaSyDemoKeyYourGeminiApiKeyHere12345") {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          systemInstruction,
        });

        const result = await model.generateContent(
          `Khách hàng hỏi: "${message}". Hãy tư vấn chi tiết, lịch lãm và gợi ý combo sản phẩm phù hợp.`
        );

        return res.status(200).json({
          success: true,
          provider: "Google Gemini 1.5 Flash (RAG)",
          reply: result.response.text(),
        });
      } catch (err) {
        console.warn("Lỗi Gemini API, tự động kích hoạt Fallback AI:", err.message);
      }
    }

    // 3. Fallback AI thông minh chuyên về Thời trang nam khi mạng chập chờn hoặc hết quota
    const lowerMsg = message.toLowerCase();
    let matched = products.filter((p) => {
      const pName = p.name.toLowerCase();
      const pCat = p.category ? p.category.name.toLowerCase() : "";
      if (lowerMsg.includes("sơ mi") || lowerMsg.includes("so mi")) {
        return pName.includes("sơ mi") || pCat.includes("sơ mi");
      }
      if (lowerMsg.includes("polo")) {
        return pName.includes("polo") || pCat.includes("polo");
      }
      if (lowerMsg.includes("quần") || lowerMsg.includes("tây") || lowerMsg.includes("kaki")) {
        return pName.includes("quần");
      }
      if (lowerMsg.includes("áo khoác") || lowerMsg.includes("blazer")) {
        return pName.includes("khoác") || pName.includes("blazer");
      }
      if (lowerMsg.includes("rẻ") || lowerMsg.includes("sale")) {
        return p.salePrice < 250000;
      }
      return pName.includes(lowerMsg);
    });

    const suggestions = matched.length > 0 ? matched.slice(0, 3) : products.slice(0, 3);

    let reply =
      "Dạ em chào anh! MENSTYLE Stylist xin gợi ý cho anh những mẫu trang phục nam cực kỳ tôn dáng và đang bán chạy nhất tại shop:\n\n";

    suggestions.forEach((p) => {
      reply += `👔 **${p.name}**\n• Giá ưu đãi: **${Number(p.salePrice).toLocaleString("vi-VN")} đ** (Đánh giá ${p.rating}⭐)\n• Size: ${(p.sizes || []).join(", ")}\n• Đặc tính: ${p.description}\n\n`;
    });

    reply += "Anh có thể bấm trực tiếp vào sản phẩm trên giao diện để chọn size và bấm 'Thêm giỏ' đặt mua ngay nhé ạ!";

    res.status(200).json({
      success: true,
      provider: "MENSTYLE Smart Stylist Fallback",
      reply,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
