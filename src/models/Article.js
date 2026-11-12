const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Vui lòng nhập tiêu đề bài viết"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Vui lòng chọn danh mục bài viết"],
      enum: [
        "Xu hướng thời trang",
        "Bí quyết phối đồ",
        "Phong cách nam",
        "Mẹo chọn trang phục",
        "Chăm sóc và bảo quản",
        "Tin tức MENSTYLE",
      ],
      default: "Xu hướng thời trang",
    },
    excerpt: {
      type: String,
      required: [true, "Vui lòng nhập mô tả ngắn tóm tắt bài viết"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Vui lòng nhập nội dung chi tiết bài viết"],
    },
    image: {
      type: String,
      required: [true, "Vui lòng cung cấp link ảnh đại diện bài viết"],
    },
    author: {
      type: String,
      default: "MENSTYLE Editorial Team",
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    readTime: {
      type: String,
      default: "5 phút đọc",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["PUBLISHED", "DRAFT"],
      default: "PUBLISHED",
    },
  },
  {
    timestamps: true,
  }
);

// Tạo index hỗ trợ tìm kiếm nhanh theo tiêu đề và mô tả
articleSchema.index({ title: "text", excerpt: "text" });

module.exports = mongoose.model("Article", articleSchema);
