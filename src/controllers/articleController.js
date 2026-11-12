const Article = require("../models/Article");

// Hàm chuyển tiêu đề tiếng Việt thành slug URL-friendly
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * @desc Lấy danh sách bài viết (Có lọc danh mục, tìm kiếm, sắp xếp & phân trang)
 * @route GET /api/articles
 * @access Public
 */
exports.getArticles = async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 9 } = req.query;

    let query = { status: "PUBLISHED" };

    if (category && category.trim() !== "" && category !== "Tất cả") {
      query.category = category;
    }

    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { author: searchRegex },
      ];
    }

    let sortOptions = { createdAt: -1 }; // Mặc định mới nhất
    if (sort === "popular") {
      sortOptions = { views: -1, createdAt: -1 };
    } else if (sort === "oldest") {
      sortOptions = { createdAt: 1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 9;
    const skip = (pageNum - 1) * limitNum;

    const total = await Article.countDocuments(query);
    const articles = await Article.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: articles,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error) {
    console.error("Lỗi getArticles:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi lấy danh sách bài viết",
      error: error.message,
    });
  }
};

/**
 * @desc Lấy top bài viết nổi bật cho khu vực "ĐÁNG CHÚ Ý" (1 bài lớn + 2 bài nhỏ)
 * @route GET /api/articles/featured
 * @access Public
 */
exports.getFeaturedArticles = async (req, res) => {
  try {
    let featured = await Article.find({ status: "PUBLISHED", isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(3);

    // Nếu chưa đủ 3 bài gắn isFeatured, lấy thêm các bài có lượt xem cao nhất
    if (featured.length < 3) {
      const extraCount = 3 - featured.length;
      const existingIds = featured.map((a) => a._id);
      const extra = await Article.find({
        status: "PUBLISHED",
        _id: { $nin: existingIds },
      })
        .sort({ views: -1, createdAt: -1 })
        .limit(extraCount);

      featured = [...featured, ...extra];
    }

    res.status(200).json({
      success: true,
      data: featured,
    });
  } catch (error) {
    console.error("Lỗi getFeaturedArticles:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy bài viết nổi bật",
      error: error.message,
    });
  }
};

/**
 * @desc Lấy chi tiết bài viết theo Slug + 3 bài viết liên quan cùng chuyên mục
 * @route GET /api/articles/:slug
 * @access Public
 */
exports.getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Tìm bài viết và tăng lượt xem tự động
    const article = await Article.findOneAndUpdate(
      { slug: slug.toLowerCase() },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết theo đường dẫn này",
      });
    }

    // Lấy 3 bài viết liên quan cùng danh mục
    const relatedArticles = await Article.find({
      status: "PUBLISHED",
      category: article.category,
      _id: { $ne: article._id },
    })
      .sort({ createdAt: -1 })
      .limit(3);

    res.status(200).json({
      success: true,
      data: article,
      related: relatedArticles,
    });
  } catch (error) {
    console.error("Lỗi getArticleBySlug:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin chi tiết bài viết",
      error: error.message,
    });
  }
};

/**
 * @desc Tạo bài viết mới (Dành riêng cho Admin)
 * @route POST /api/articles
 * @access Private (Admin)
 */
exports.createArticle = async (req, res) => {
  try {
    const {
      title,
      slug,
      category,
      excerpt,
      content,
      image,
      author,
      tags,
      readTime,
      isFeatured,
      status,
    } = req.body;

    if (!title || !excerpt || !content || !image) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ tiêu đề, mô tả ngắn, nội dung và ảnh đại diện",
      });
    }

    let finalSlug = slug ? slugify(slug) : slugify(title);

    // Kiểm tra trùng slug
    const existing = await Article.findOne({ slug: finalSlug });
    if (existing) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const article = await Article.create({
      title,
      slug: finalSlug,
      category: category || "Xu hướng thời trang",
      excerpt,
      content,
      image,
      author: author || "MENSTYLE Editorial Team",
      tags: Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((t) => t.trim()) : [],
      readTime: readTime || "5 phút đọc",
      isFeatured: Boolean(isFeatured),
      status: status || "PUBLISHED",
    });

    res.status(201).json({
      success: true,
      message: "Tạo bài viết mới thành công!",
      data: article,
    });
  } catch (error) {
    console.error("Lỗi createArticle:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo bài viết",
      error: error.message,
    });
  }
};

/**
 * @desc Cập nhật bài viết (Dành riêng cho Admin)
 * @route PUT /api/articles/:id
 * @access Private (Admin)
 */
exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.title && !updateData.slug) {
      updateData.slug = slugify(updateData.title);
    } else if (updateData.slug) {
      updateData.slug = slugify(updateData.slug);
    }

    if (typeof updateData.tags === "string") {
      updateData.tags = updateData.tags.split(",").map((t) => t.trim());
    }

    const article = await Article.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết để cập nhật",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật bài viết thành công!",
      data: article,
    });
  } catch (error) {
    console.error("Lỗi updateArticle:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật bài viết",
      error: error.message,
    });
  }
};

/**
 * @desc Xóa bài viết (Dành riêng cho Admin)
 * @route DELETE /api/articles/:id
 * @access Private (Admin)
 */
exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findByIdAndDelete(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết để xóa",
      });
    }

    res.status(200).json({
      success: true,
      message: `Đã xóa vĩnh viễn bài viết "${article.title}"`,
    });
  } catch (error) {
    console.error("Lỗi deleteArticle:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa bài viết",
      error: error.message,
    });
  }
};

/**
 * @desc Lấy toàn bộ bài viết trong hệ thống Admin (kể cả DRAFT)
 * @route GET /api/articles/admin/all
 * @access Private (Admin)
 */
exports.getAdminArticles = async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: articles,
      total: articles.length,
    });
  } catch (error) {
    console.error("Lỗi getAdminArticles:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách quản trị bài viết",
      error: error.message,
    });
  }
};
