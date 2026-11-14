const mongoose = require("mongoose");
const { sendServerError } = require("../utils/errorResponse");
const Product = require("../models/Product");
const Category = require("../models/Category");

// BUG-15: kiểm tra dữ liệu sản phẩm (dùng cho tạo/sửa)
function validateProductFields(b, isUpdate) {
  const has = (k) => b[k] !== undefined;
  if (!isUpdate || has("name")) {
    if (typeof b.name !== "string" || !b.name.trim() || b.name.length > 200) return "Tên sản phẩm không hợp lệ (tối đa 200 ký tự)!";
  }
  if (!isUpdate || has("category")) {
    if (typeof b.category !== "string" || !mongoose.isValidObjectId(b.category)) return "Danh mục không hợp lệ!";
  }
  if (has("brand") && b.brand !== null && (typeof b.brand !== "string" || b.brand.length > 100)) return "Thương hiệu không hợp lệ!";
  for (const k of ["originalPrice", "salePrice"]) {
    if (!isUpdate || has(k)) {
      const n = Number(b[k]);
      if (b[k] === "" || b[k] === null || !Number.isFinite(n) || n < 0) return "Giá sản phẩm phải là số không âm!";
    }
  }
  if (has("stock")) {
    const s = Number(b.stock);
    if (!Number.isInteger(s) || s < 0 || s > 1000000) return "Tồn kho phải là số nguyên không âm!";
  }
  if (has("sizes")) {
    if (!Array.isArray(b.sizes) || b.sizes.length > 12 || b.sizes.some((x) => typeof x !== "string" || !x.trim() || x.length > 20)) {
      return "Danh sách size không hợp lệ!";
    }
  }
  if (has("image") && b.image) {
    if (typeof b.image !== "string" || b.image.length > 2000 || !/^(https?:\/\/|\/)/i.test(b.image)) return "Ảnh sản phẩm phải là đường dẫn http(s)!";
  }
  if (has("description") && b.description !== null && (typeof b.description !== "string" || b.description.length > 5000)) {
    return "Mô tả sản phẩm không hợp lệ (tối đa 5000 ký tự)!";
  }
  return null;
}

function escapeRegex(text) {
  if (typeof text !== "string") return "";
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// [GET] /api/products - Lấy danh sách sản phẩm (Phân trang an toàn, Lọc danh mục, Lọc khoảng giá, Chống ReDoS)
exports.getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort, all } = req.query;
    const filter = {};

    // 1. Lọc theo danh mục (Kiểm tra kiểu dữ liệu chuỗi để chống NoSQL Injection)
    if (category && typeof category === "string") {
      if (!mongoose.isValidObjectId(category.trim())) {
        return res.status(400).json({ success: false, message: "Mã danh mục không hợp lệ!" });
      }
      filter.category = category.trim();
    }

    // 2. Tìm kiếm Regex an toàn chống ReDoS
    if (search && typeof search === "string" && search.trim()) {
      const safeSearch = escapeRegex(search.trim());
      const searchRegex = { $regex: safeSearch, $options: "i" };
      const matchedCats = await Category.find({ name: searchRegex }).select("_id");
      const matchedCatIds = matchedCats.map((c) => c._id);

      filter.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { description: searchRegex },
        ...(matchedCatIds.length > 0 ? [{ category: { $in: matchedCatIds } }] : []),
      ];
    }

    // 3. Lọc theo khoảng giá (salePrice $gte / $lte)
    const priceFilter = {};
    if (minPrice !== undefined && minPrice !== "" && !isNaN(Number(minPrice))) {
      priceFilter.$gte = Math.max(0, Number(minPrice));
    }
    if (maxPrice !== undefined && maxPrice !== "" && !isNaN(Number(maxPrice))) {
      priceFilter.$lte = Math.max(0, Number(maxPrice));
    }
    if (Object.keys(priceFilter).length > 0) {
      filter.salePrice = priceFilter;
    }
    // 4. Sắp xếp
    let sortQuery = { createdAt: -1 };
    if (sort === "price_asc") sortQuery = { salePrice: 1 };
    if (sort === "price_desc") sortQuery = { salePrice: -1 };
    if (sort === "rating") sortQuery = { rating: -1 };

    // 5. Nếu yêu cầu lấy toàn bộ (dành cho Admin hoặc AI RAG, giới hạn trần 100 sản phẩm để bảo vệ RAM)
    if (all === "true") {
      const products = await Product.find(filter)
        .populate("category", "name slug")
        .sort(sortQuery)
        .limit(500);

      return res.status(200).json({
        success: true,
        message: "Lấy tất cả sản phẩm thành công",
        total: products.length,
        totalPages: 1,
        page: 1,
        limit: products.length,
        data: products,
      });
    }

    // 6. Phân trang có kiểm soát giới hạn trần tối đa 50 sản phẩm/trang
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(req.query.limit, 10) || 8), 50);
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;

    const products = await Product.find(filter)
      .populate("category", "name slug")
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: "Lấy danh sách sản phẩm thành công",
      total,
      totalPages,
      page,
      limit,
      count: products.length,
      data: products,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// [GET] /api/products/:id - Lấy chi tiết 1 sản phẩm
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name slug"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm yêu cầu!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy chi tiết sản phẩm thành công",
      data: product,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// [POST] /api/products - Thêm sản phẩm mới (Yêu cầu Admin)
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      brand,
      originalPrice,
      salePrice,
      stock,
      sizes,
      image,
      description,
      isFeatured,
    } = req.body;

    if (!name || !category || originalPrice === undefined || salePrice === undefined) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ: Tên sản phẩm, Danh mục, Giá gốc và Giá bán!",
      });
    }
    const invalidMsg = validateProductFields(req.body, false);
    if (invalidMsg) return res.status(400).json({ success: false, message: invalidMsg });
    if (Number(salePrice) > Number(originalPrice)) {
      return res.status(400).json({ success: false, message: "Giá bán không được cao hơn giá gốc!" });
    }

    const newProduct = await Product.create({
      name,
      category,
      brand: brand || "MENSTYLE",
      originalPrice: Number(originalPrice),
      salePrice: Number(salePrice),
      stock: stock !== undefined ? Number(stock) : 20,
      sizes: sizes && Array.isArray(sizes) ? sizes : ["M", "L", "XL", "2XL"],
      image: image || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600",
      description: description || "",
      isFeatured: !!isFeatured,
    });

    const populated = await Product.findById(newProduct._id).populate(
      "category",
      "name"
    );

    res.status(201).json({
      success: true,
      message: "Thêm sản phẩm mới thành công",
      data: populated,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// [PUT] /api/products/:id - Cập nhật sản phẩm (Yêu cầu Admin)
exports.updateProduct = async (req, res) => {
  try {
    const body = req.body || {};
    const invalidMsg = validateProductFields(body, true);
    if (invalidMsg) return res.status(400).json({ success: false, message: invalidMsg });

    // Chỉ cho phép sửa các trường được liệt kê (chống mass-assignment)
    const ALLOWED = ["name", "category", "brand", "originalPrice", "salePrice", "stock", "sizes", "image", "description", "isFeatured"];
    const updateData = {};
    for (const k of ALLOWED) if (body[k] !== undefined) updateData[k] = body[k];
    if (updateData.originalPrice !== undefined) updateData.originalPrice = Number(updateData.originalPrice);
    if (updateData.salePrice !== undefined) updateData.salePrice = Number(updateData.salePrice);
    if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);
    if (updateData.isFeatured !== undefined) updateData.isFeatured = !!updateData.isFeatured;

    if (updateData.originalPrice !== undefined || updateData.salePrice !== undefined) {
      const current = await Product.findById(req.params.id).select("originalPrice salePrice");
      if (current) {
        const o = updateData.originalPrice !== undefined ? updateData.originalPrice : current.originalPrice;
        const s = updateData.salePrice !== undefined ? updateData.salePrice : current.salePrice;
        if (s > o) return res.status(400).json({ success: false, message: "Giá bán không được cao hơn giá gốc!" });
      }
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("category", "name");

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm để cập nhật!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
      data: updated,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// [DELETE] /api/products/:id - Xóa sản phẩm (Yêu cầu Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm để xóa!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Đã xóa sản phẩm thành công",
      data: product,
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};
