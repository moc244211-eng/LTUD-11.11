const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên sản phẩm không được để trống"],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Sản phẩm phải thuộc về một danh mục"],
    },
    brand: {
      type: String,
      default: "MENSTYLE",
      trim: true,
    },
    originalPrice: {
      type: Number,
      required: [true, "Giá gốc không được để trống"],
      min: [0, "Giá tiền không được nhỏ hơn 0"],
    },
    salePrice: {
      type: Number,
      required: [true, "Giá bán không được để trống"],
      min: [0, "Giá tiền không được nhỏ hơn 0"],
    },
    stock: {
      type: Number,
      default: 20,
      min: [0, "Số lượng kho không thể âm"],
    },
    sizes: {
      type: [String],
      default: ["M", "L", "XL", "2XL"],
    },
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600",
    },
    description: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Tối ưu hóa truy vấn danh mục, lọc giá và tìm kiếm
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ salePrice: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Product", productSchema);
