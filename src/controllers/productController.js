const Product = require("../models/Product");

// 5 Sản phẩm DUY NHẤT được áp dụng chính sách giảm giá khuyến mãi
const DISCOUNTED_PRODUCTS_MAP = {
  "Áo Sơ Mi Nam Oxford Slimfit Chống Nhăn": { originalPrice: 380000, salePrice: 289000 },
  "Áo Polo Nam Bo Cổ Dệt Kim Pique Cao Cấp": { originalPrice: 320000, salePrice: 249000 },
  "Áo Thun Nam Oversize Cotton 100% Định Lượng 250gsm": { originalPrice: 250000, salePrice: 179000 },
  "Quần Tây Nam Ống Đứng Cạp Chun Thông Minh": { originalPrice: 450000, salePrice: 329000 },
  "Áo Khoác Blazer Nam 2 Cúc Phong Cách Hàn Quốc": { originalPrice: 790000, salePrice: 589000 },
};

let hasSyncedDiscounts = false;
async function ensureOnly5DiscountedProducts() {
  if (hasSyncedDiscounts) return;
  try {
    const discountedNames = Object.keys(DISCOUNTED_PRODUCTS_MAP);

    // 1. Cập nhật 5 sản phẩm giảm giá
    for (const name of discountedNames) {
      await Product.updateMany(
        { name },
        {
          $set: {
            originalPrice: DISCOUNTED_PRODUCTS_MAP[name].originalPrice,
            salePrice: DISCOUNTED_PRODUCTS_MAP[name].salePrice,
          },
        }
      );
    }

    // 2. Tất cả các sản phẩm còn lại: đặt originalPrice = salePrice (không giảm giá)
    const otherProducts = await Product.find({ name: { $nin: discountedNames } });
    for (const prod of otherProducts) {
      if (prod.originalPrice !== prod.salePrice) {
        prod.originalPrice = prod.salePrice;
        await prod.save();
      }
    }

    hasSyncedDiscounts = true;
    console.log("✅ Đã đồng bộ chính sách: Chỉ áp dụng giảm giá cho đúng 5 sản phẩm tiêu biểu.");
  } catch (err) {
    console.warn("Lỗi đồng bộ giá sản phẩm (không ảnh hưởng):", err.message);
  }
}

// [GET] /api/products - Lấy danh sách sản phẩm (Phân trang, Lọc danh mục, Lọc khoảng giá, Tìm kiếm Regex)
exports.getProducts = async (req, res) => {
  try {
    await ensureOnly5DiscountedProducts();
    const { category, search, minPrice, maxPrice, sort, all } = req.query;
    const filter = {};

    // 1. Lọc theo danh mục
    if (category) {
      filter.category = category;
    }

    // 2. Tìm kiếm Regex tên sản phẩm không phân biệt hoa thường
    if (search) {
      filter.name = { $regex: search.trim(), $options: "i" };
    }

    // 3. Lọc theo khoảng giá (salePrice $gte / $lte)
    if (minPrice || maxPrice) {
      filter.salePrice = {};
      if (minPrice !== undefined && minPrice !== "") {
        filter.salePrice.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== "") {
        filter.salePrice.$lte = Number(maxPrice);
      }
    }

    // 4. Sắp xếp
    let sortQuery = { createdAt: -1 };
    if (sort === "price_asc") sortQuery = { salePrice: 1 };
    if (sort === "price_desc") sortQuery = { salePrice: -1 };
    if (sort === "rating") sortQuery = { rating: -1 };

    // 5. Nếu yêu cầu lấy toàn bộ (dành cho Admin hoặc AI RAG)
    if (all === "true") {
      const products = await Product.find(filter)
        .populate("category", "name slug")
        .sort(sortQuery);

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

    // 6. Thuật toán Phân trang chuyên nghiệp (Pagination)
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 8);
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
    res.status(500).json({ success: false, message: error.message });
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
    res.status(500).json({ success: false, message: error.message });
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
    res.status(500).json({ success: false, message: error.message });
  }
};

// [PUT] /api/products/:id - Cập nhật sản phẩm (Yêu cầu Admin)
exports.updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.originalPrice) updateData.originalPrice = Number(updateData.originalPrice);
    if (updateData.salePrice) updateData.salePrice = Number(updateData.salePrice);
    if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);

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
    res.status(500).json({ success: false, message: error.message });
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
    res.status(500).json({ success: false, message: error.message });
  }
};
