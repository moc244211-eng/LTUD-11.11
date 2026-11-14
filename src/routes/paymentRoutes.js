const express = require("express");
const router = express.Router();
const { createPaymentQR } = require("../controllers/paymentController");

// [POST] /api/payment/create-qr - Tạo mã thanh toán QR động chuẩn VietQR
router.post("/create-qr", createPaymentQR);

module.exports = router;
