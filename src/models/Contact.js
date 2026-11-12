const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập họ và tên"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Vui lòng nhập số điện thoại"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    topic: {
      type: String,
      default: "Tư vấn phối đồ & Chọn size",
    },
    message: {
      type: String,
      required: [true, "Vui lòng nhập nội dung liên hệ"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "CONTACTED", "RESOLVED"],
      default: "PENDING",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Contact", contactSchema);
