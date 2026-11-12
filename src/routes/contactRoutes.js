const express = require("express");
const router = express.Router();
const {
  createContact,
  getContacts,
  updateContactStatus,
  deleteContact,
} = require("../controllers/contactController");
const { protect, authorize } = require("../middlewares/authMiddleware");

// 1. Gửi yêu cầu liên hệ (Công khai cho toàn bộ khách hàng ghé thăm website)
router.post("/", createContact);

// 2. Các thao tác quản trị hộp thư liên hệ (Yêu cầu xác thực tài khoản Admin)
router.get("/", protect, authorize("admin"), getContacts);
router.put("/:id", protect, authorize("admin"), updateContactStatus);
router.delete("/:id", protect, authorize("admin"), deleteContact);

module.exports = router;
