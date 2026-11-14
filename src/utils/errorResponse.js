/**
 * Trả lỗi an toàn cho client: ghi log chi tiết ở server, chỉ trả thông điệp chung.
 * Map các lỗi Mongoose/Mongo phổ biến sang mã 4xx phù hợp.
 */
function sendServerError(res, error) {
  console.error("[API Error]", error && (error.stack || error.message || error));

  let status = 500;
  let message = "Đã có lỗi xảy ra trên hệ thống. Vui lòng thử lại sau!";

  if (error && error.name === "CastError") {
    status = 400;
    message = "Dữ liệu hoặc mã định danh không hợp lệ.";
  } else if (error && error.name === "ValidationError") {
    status = 400;
    message = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường đã nhập.";
  } else if (error && error.code === 11000) {
    status = 409;
    message = "Dữ liệu đã tồn tại trong hệ thống.";
  }

  return res.status(status).json({ success: false, message });
}

module.exports = { sendServerError };
