const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, unique: true, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true },
    shippingAddress: { type: String, required: true, trim: true },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        size: { type: String, default: "L" },
        image: { type: String, default: "" },
      },
    ],
    shippingFee: { type: Number, default: 25000 },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String, default: "" },
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["COD", "VIETQR", "MOMO_QR"],
      default: "COD",
    },
    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PAID"],
      default: "UNPAID",
    },
    orderStatus: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

// Tối ưu hóa truy vấn & báo cáo hiệu năng cao
orderSchema.index({ customerPhone: 1 });
orderSchema.index({ customerEmail: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
