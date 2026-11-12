const Contact = require("../models/Contact");

// Tự động khởi tạo dữ liệu mẫu nếu hộp thư trống để quản trị viên trải nghiệm ngay
let hasSeededContacts = false;
async function ensureSampleContacts() {
  if (hasSeededContacts) return;
  try {
    const count = await Contact.countDocuments();
    if (count === 0) {
      await Contact.insertMany([
        {
          name: "Trần Minh Quang",
          phone: "0912345678",
          email: "quang.tran@gmail.com",
          topic: "Tư vấn phối đồ & Chọn size",
          message: "Tôi cao 1m75, nặng 68kg, chuẩn bị đi dự tiệc cưới thì nên mặc Áo Sơ Mi Oxford hay Blazer? Tư vấn giúp tôi size áo vừa vặn với.",
          status: "PENDING",
        },
        {
          name: "Vũ Hải Đăng",
          phone: "0987654321",
          email: "haidang.vu@gmail.com",
          topic: "Hỗ trợ đơn hàng & Đổi trả",
          message: "Tôi vừa nhận đơn hàng nhưng mặc Áo Polo size L hơi rộng, MENSTYLE có thể hỗ trợ đổi sang size M được không?",
          status: "CONTACTED",
          notes: "Đã liên hệ qua điện thoại, chuẩn bị gửi shipper giao size M đổi tận nơi.",
        },
        {
          name: "Phạm Quốc Tuấn",
          phone: "0909123888",
          email: "tuan.pham@fpt.com",
          topic: "Đặt may số lượng lớn / B2B",
          message: "Công ty chúng tôi cần đặt may 50 áo polo bo dệt pique làm đồng phục team building. Xin MENSTYLE gửi báo giá chiết khấu doanh nghiệp.",
          status: "RESOLVED",
          notes: "Đã gửi email báo giá chiết khấu 15% kèm mẫu vải dệt.",
        },
      ]);
      console.log("✅ Đã tự động khởi tạo dữ liệu mẫu cho Hộp thư liên hệ Admin.");
    }
    hasSeededContacts = true;
  } catch (err) {
    console.warn("Lỗi auto-seed contacts:", err.message);
  }
}

// [POST] /api/contacts - Khách hàng gửi yêu cầu liên hệ hoặc đăng ký nhận tin
exports.createContact = async (req, res) => {
  try {
    const { name, phone, email, topic, message } = req.body;

    if (!name || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ họ tên, số điện thoại và nội dung yêu cầu.",
      });
    }

    const newContact = await Contact.create({
      name: name.trim(),
      phone: phone.trim(),
      email: (email || "").trim(),
      topic: topic || "Tư vấn",
      message: message.trim(),
      status: "PENDING",
    });

    return res.status(201).json({
      success: true,
      message: "Gửi yêu cầu liên hệ thành công! Quản trị viên MENSTYLE sẽ liên hệ hỗ trợ sớm nhất.",
      data: newContact,
    });
  } catch (err) {
    console.error("Lỗi createContact:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi gửi yêu cầu liên hệ",
      error: err.message,
    });
  }
};

// [GET] /api/contacts - Quản trị viên lấy danh sách yêu cầu liên hệ (Lọc trạng thái, Tìm kiếm)
exports.getContacts = async (req, res) => {
  try {
    await ensureSampleContacts();
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== "ALL") {
      filter.status = status;
    }

    if (search) {
      const regex = { $regex: search.trim(), $options: "i" };
      filter.$or = [
        { name: regex },
        { phone: regex },
        { email: regex },
        { topic: regex },
        { message: regex },
      ];
    }

    const contacts = await Contact.find(filter).sort({ createdAt: -1 });

    // Đếm số lượng theo trạng thái để hiển thị thống kê
    const totalCount = await Contact.countDocuments({});
    const pendingCount = await Contact.countDocuments({ status: "PENDING" });
    const contactedCount = await Contact.countDocuments({ status: "CONTACTED" });
    const resolvedCount = await Contact.countDocuments({ status: "RESOLVED" });

    return res.status(200).json({
      success: true,
      total: contacts.length,
      stats: {
        total: totalCount,
        pending: pendingCount,
        contacted: contactedCount,
        resolved: resolvedCount,
      },
      data: contacts,
    });
  } catch (err) {
    console.error("Lỗi getContacts:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách liên hệ",
      error: err.message,
    });
  }
};

// [PUT] /api/contacts/:id - Quản trị viên cập nhật trạng thái xử lý
exports.updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updateFields = {};
    if (status) updateFields.status = status;
    if (notes !== undefined) updateFields.notes = notes;

    const updated = await Contact.findByIdAndUpdate(id, updateFields, { new: true });
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy yêu cầu liên hệ.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái liên hệ thành công!",
      data: updated,
    });
  } catch (err) {
    console.error("Lỗi updateContactStatus:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi cập nhật trạng thái liên hệ",
      error: err.message,
    });
  }
};

// [DELETE] /api/contacts/:id - Quản trị viên xóa yêu cầu liên hệ
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Contact.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy yêu cầu liên hệ cần xóa.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Đã xóa yêu cầu liên hệ thành công!",
    });
  } catch (err) {
    console.error("Lỗi deleteContact:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi xóa yêu cầu liên hệ",
      error: err.message,
    });
  }
};
