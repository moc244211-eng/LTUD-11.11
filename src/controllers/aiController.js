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
1. Xưng hô lịch lãm, tinh tế: "Dạ em chào anh", "Em là MENSTYLE AI Stylist".
2. BẢNG TƯ VẤN CHỌN SIZE CHUẨN NAM:
   - Dưới 1m68, cân nặng 50 - 59kg: Size M
   - Từ 1m68 - 1m74, cân nặng 60 - 69kg: Size L
   - Từ 1m74 - 1m80, cân nặng 70 - 79kg: Size XL
   - Trên 1m80 hoặc trên 80kg: Size 2XL
3. NGHỆ THUẬT PHỐI ĐỒ (OUTFIT COMBO):
   - Công sở, lịch sự, gặp đối tác: Áo Sơ mi Oxford / Sơ mi lụa + Quần Tây âu + Thắt lưng da.
   - Năng động, dạo phố, đi chơi: Áo Polo dệt kim hoặc Áo thun Cotton basic + Quần Kaki / Quần Short.
   - Hẹn hò, tiệc tùng: Áo Blazer nam + Áo thun trơn bên trong + Quần tây âu / Jeans đen.
4. ĐẶC BIỆT KHI GỢI Ý PHỐI OUTFIT:
   Ở cuối câu trả lời, hãy đính kèm cú pháp OUTFIT COMBO chứa chính xác tên 2 hoặc 3 sản phẩm có trong danh mục để hệ thống tự động hiển thị thẻ tương tác mua trọn bộ:
   [OUTFIT_COMBO: Tên Phong Cách | Tên sản phẩm 1 | Tên sản phẩm 2 | Tên sản phẩm 3]
   Ví dụ:
   [OUTFIT_COMBO: Quý Ông Thành Đạt Gặp Đối Tác | Áo Sơ Mi Nam Oxford Slimfit Chống Nhăn | Quần Tây Nam Ống Đứng Cạp Chun Thông Minh | Thắt Lưng Da Nam Khóa Tự Động Cao Cấp]
5. CHỈ giới thiệu các sản phẩm có thật trong danh sách trên, nêu chính xác giá bán và số lượng size còn lại.
`;

    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    const isConfiguredKey =
      Boolean(apiKey) &&
      apiKey.length > 20 &&
      !apiKey.toLowerCase().includes("demo") &&
      !apiKey.toLowerCase().includes("your");

    // 2. Gọi Google Gemini AI Model (Nếu có cấu hình GEMINI_API_KEY)
    if (isConfiguredKey) {
      const modelsToTry = ["gemini-3.5-flash", "gemini-3.5-flash-lite"];
      const genAI = new GoogleGenerativeAI(apiKey);

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction,
          });

          const result = await model.generateContent(
            `Khách hàng hỏi: "${message}". Hãy tư vấn chi tiết, lịch lãm và gợi ý combo sản phẩm phù hợp.`
          );

          return res.status(200).json({
            success: true,
            provider: `Google Gemini AI (${modelName}) [RAG Live]`,
            reply: result.response.text(),
          });
        } catch (err) {
          console.warn(`Thử model ${modelName} không thành công:`, err.message);
        }
      }
    }

    // 3. Fallback AI thông minh chuyên sâu Thời trang nam (Offline & High-Speed Stylist Engine)
    const lowerMsg = message.toLowerCase();
    let reply = "";
    let comboTag = "";

    if (lowerMsg.includes("đối tác") || lowerMsg.includes("khách sạn") || lowerMsg.includes("đi làm") || lowerMsg.includes("công sở")) {
      reply = `Dạ em chào anh! Khi đi gặp gỡ đối tác tại khách sạn sang trọng hay môi trường doanh nghiệp cấp cao, phong thái của anh cần toát lên sự đĩnh đạc, chỉn chu và điềm tĩnh của một quý ông thành đạt.\n\n` +
        `Em xin gợi ý cho anh bộ phối **"Executive Smart Classic"** chuẩn mực:\n` +
        `• **Áo Sơ Mi Oxford Slimfit:** Dệt sợi tự nhiên chống nhăn, cổ đứng chuẩn mực tạo ấn tượng sắc nét.\n` +
        `• **Quần Tây May Đo Cạp Chun:** Tôn dáng thẳng thớm, thoải mái tối đa khi ngồi họp hay đàm phán.\n` +
        `• **Thắt Lưng Da Bò Khóa Tự Động:** Điểm nhấn sang trọng hoàn thiện vẻ ngoài phong độ.\n\n` +
        `Anh có thể bấm nút **"Thêm Toàn Bộ Outfit"** bên dưới để đặt mua trọn bộ combo này nhé ạ!`;
      comboTag = `\n\n[OUTFIT_COMBO: Quý Ông Thành Đạt Gặp Đối Tác | Áo Sơ Mi Nam Oxford Slimfit Chống Nhăn | Quần Tây Nam Ống Đứng Cạp Chun Thông Minh | Thắt Lưng Da Nam Khóa Tự Động Cao Cấp]`;
    } else if (lowerMsg.includes("hẹn hò") || lowerMsg.includes("tiệc") || lowerMsg.includes("dạ tiệc") || lowerMsg.includes("lãng mạn")) {
      reply = `Dạ em chào anh! Cho một buổi tối hẹn hò lãng mạn hoặc dạ tiệc sang trọng, bí quyết chính là phong cách **"Relaxed Elegance"** – lịch thiệp nhưng quyến rũ, không gò bó:\n\n` +
        `• **Áo Khoác Blazer Nam 2 Cúc Hàn Quốc:** Phom dáng may đo tôn bờ vai rộng vững chãi.\n` +
        `• **Áo Thun Cotton Định Lượng 250gsm:** Lớp lót mềm mại, tinh tế, vừa trẻ trung vừa tinh tế.\n` +
        `• **Quần Tây Ống Đứng Cạp Chun:** Tạo tỉ lệ cơ thể chuẩn, thanh thoát và tự tin trong từng bước đi.\n\n` +
        `Em đã gom sẵn trọn set đồ này bên dưới để anh diện ngay tối nay!`;
      comboTag = `\n\n[OUTFIT_COMBO: Quý Ông Lịch Lãm Hẹn Hò & Dạ Tiệc | Áo Khoác Blazer Nam 2 Cúc Phong Cách Hàn Quốc | Áo Thun Nam Oversize Cotton 100% Định Lượng 250gsm | Quần Tây Nam Ống Đứng Cạp Chun Thông Minh]`;
    } else if (lowerMsg.includes("dạo phố") || lowerMsg.includes("cuối tuần") || lowerMsg.includes("cafe") || lowerMsg.includes("đi chơi")) {
      reply = `Dạ em chào anh! Một ngày cuối tuần thong dong dạo phố hay hẹn cafe bạn bè sẽ thật hoàn hảo với phong cách **"Modern Casual Weekend"** năng động và mát mẻ:\n\n` +
        `• **Áo Polo Bo Cổ Dệt Kim Pique:** Sang trọng hơn áo thun thông thường, cổ áo đứng phom lịch lãm.\n` +
        `• **Quần Short Đũi Nam Dạo Phố:** Chất đũi tự nhiên thoáng nhiệt tuyệt đối, giải nhiệt ngày nắng.\n` +
        `• **Ví Da Nam Cầm Tay YKK:** Phụ kiện thời thượng giữ chìa khóa, điện thoại gọn gàng.\n\n` +
        `Mời anh xem set đồ phối sẵn bên dưới nhé!`;
      comboTag = `\n\n[OUTFIT_COMBO: Smart Casual Năng Động Dạo Phố | Áo Polo Nam Bo Cổ Dệt Kim Pique Cao Cấp | Quần Short Đũi Nam Dạo Phố Thoáng Khí | Ví Da Nam Cầm Tay Dáng Dài Khóa Kéo YKK]`;
    } else if (lowerMsg.includes("size") || lowerMsg.includes("cao") || lowerMsg.includes("nặng") || lowerMsg.includes("kg")) {
      reply = `Dạ em chào anh! Về việc chọn size chuẩn phom người Việt tại MENSTYLE, em xin tư vấn chuẩn xác cho anh:\n\n` +
        `📏 **BẢNG ĐO THỂ HÌNH CHUẨN:**\n` +
        `• **Size M:** Thích hợp chiều cao dưới 1m68, cân nặng 50 - 59kg (Dáng gầy hoặc vừa vặn).\n` +
        `• **Size L:** Thích hợp chiều cao 1m68 - 1m74, cân nặng 60 - 69kg (Dáng cân đối chuẩn phái mạnh).\n` +
        `• **Size XL:** Thích hợp chiều cao 1m74 - 1m80, cân nặng 70 - 79kg (Vóc dáng cao to, vạm vỡ).\n` +
        `• **Size 2XL:** Thích hợp chiều cao trên 1m80 hoặc cân nặng 80 - 92kg (Thoải mái che khuyết điểm bụng).\n\n` +
        `💡 *Mẹo chuyên gia:* Anh cũng có thể bấm vào sản phẩm bất kỳ và chọn **"Bộ Đo Size 1 Chạm (Virtual Fit 2.0)"** để hệ thống tính toán tự động chuẩn 98% theo từng dáng người nhé!`;
      comboTag = `\n\n[OUTFIT_COMBO: Combo Phối Chuẩn Form Quý Ông | Áo Sơ Mi Nam Oxford Slimfit Chống Nhăn | Quần Tây Nam Ống Đứng Cạp Chun Thông Minh]`;
    } else {
      let matched = products.filter((p) => {
        const pName = p.name.toLowerCase();
        const pCat = p.category ? p.category.name.toLowerCase() : "";
        return pName.includes(lowerMsg) || pCat.includes(lowerMsg);
      });
      const suggestions = matched.length > 0 ? matched.slice(0, 3) : products.slice(0, 3);
      reply = "Dạ em chào anh! MENSTYLE Stylist xin gợi ý cho anh những mẫu trang phục cao cấp tôn dáng hàng đầu tại shop:\n\n";
      suggestions.forEach((p) => {
        reply += `👔 **${p.name}**\n• Giá ưu đãi: **${Number(p.salePrice).toLocaleString("vi-VN")} đ** (Đánh giá ${p.rating}⭐)\n• Size: ${(p.sizes || []).join(", ")}\n• Đặc tính: ${p.description}\n\n`;
      });
      reply += "Anh có thể chọn các nút gợi ý phong cách bên dưới hoặc bấm trực tiếp vào sản phẩm để chọn size nhé!";
    }

    res.status(200).json({
      success: true,
      provider: "MENSTYLE Smart Stylist Fallback",
      reply: reply + comboTag,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
