const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// Công khai xem danh sách & chi tiết sản phẩm
router.get("/", getProducts);
router.get("/:id", getProductById);

// Phân quyền Quản trị viên (Admin)
router.post("/", protect, authorize("admin"), createProduct);
router.put("/:id", protect, authorize("admin"), updateProduct);
router.delete("/:id", protect, authorize("admin"), deleteProduct);

module.exports = router;
