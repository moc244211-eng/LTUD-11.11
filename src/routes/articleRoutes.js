const express = require("express");
const router = express.Router();
const {
  getArticles,
  getFeaturedArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  getAdminArticles,
} = require("../controllers/articleController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

// 1. Quản trị bài viết (Admin) - đặt trước :slug để tránh nuốt URL
router.get("/admin/all", protect, adminOnly, getAdminArticles);

// 2. Lấy top bài viết nổi bật (Magazine Top Editorial)
router.get("/featured", getFeaturedArticles);

// 3. Lấy danh sách bài viết công khai (Phân trang, Lọc, Tìm kiếm, Sắp xếp)
router.get("/", getArticles);

// 4. Admin CRUD bài viết
router.post("/", protect, adminOnly, createArticle);
router.put("/:id", protect, adminOnly, updateArticle);
router.delete("/:id", protect, adminOnly, deleteArticle);

// 5. Chi tiết bài viết theo Slug (đặt cuối cùng)
router.get("/:slug", getArticleBySlug);

module.exports = router;
