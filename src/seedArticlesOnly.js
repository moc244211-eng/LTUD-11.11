/**
 * SEEDER BÀI VIẾT TẠP CHÍ THỜI TRANG MENSTYLE CHUẨN SEO TOP 1 GOOGLE & GOOGLE AI OVERVIEWS
 * Viết chuyên sâu 800-1200 từ/bài, cấu trúc AI Quick-Answer, bảng dữ liệu so sánh, FAQ Schema và Call-to-Action.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Article = require("./models/Article");
const articlesData = require("./data/articlesData");

async function seedArticles() {
  console.log("====================================================");
  console.log("🚀 BẮT ĐẦU SEED 8 BÀI VIẾT CHUẨN SEO TOP 1 GOOGLE");
  console.log("====================================================");

  try {
    await connectDB();

    console.log("🗑️ Đang xóa các bài viết cũ trong MongoDB Atlas...");
    await Article.deleteMany({});

    console.log("📝 Đang nạp 8 bài viết chuyên sâu cao cấp...");
    const createdArticles = await Article.insertMany(articlesData);

    console.log(`✅ ĐÃ NẠP THÀNH CÔNG ${createdArticles.length} BÀI VIẾT LÊN MONGODB ATLAS:`);
    createdArticles.forEach((art, idx) => {
      console.log(` ${idx + 1}. [${art.category}] ${art.title} (${art.views} lượt xem)`);
    });

    console.log("====================================================");
    console.log("🎉 HOÀN TẤT SEED DỮ LIỆU TẠP CHÍ TIN TỨC CHUẨN GOOGLE AI!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi nạp bài viết:", error.message);
    process.exit(1);
  }
}

seedArticles();
