const mongoose = require("mongoose");
const Contact = require("../models/Contact");

// [POST] /api/contacts - Khách hàng gửi yêu cầu liên hệ hoặc đăng ký nhận tin
exports.createContact = async (req, res) => {
  try {
    const { name, phone, email, topic, message } = req.body || {};

    if (!name || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ họ tên, số điện thoại và nội dung yêu cầu.",
      });
    }

    // SEC-02 / BUG-06: kiểm tra kiểu, độ dài và định dạng
    if (
      typeof name !== "string" ||
      typeof phone !== "string" ||
      typeof message !== "string" ||
      (email !== undefined && email !== null && typeof email !== "string") ||
      (topic !== undefined && topic !== null && typeof topic !== "string")
    ) {
      return res.status(400).json({ success: false, message: "Dữ liệu gửi lên không hợp lệ." });
    }
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = (email || "").trim();
    const cleanTopic = (topic || "Tư vấn").trim();
    const cleanMessage = message.trim();

    if (!cleanName || cleanName.length > 100) {
      return res.status(400).json({ success: false, message: "Họ tên không hợp lệ (tối đa 100 ký tự)." });
    }
    if (!/^[0-9+\-\s().]{8,20}$/.test(cleanPhone)) {
      return res.status(400).json({ success: false, message: "Số điện thoại không hợp lệ." });
    }
    if (cleanEmail && (cleanEmail.length > 120 || !/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(cleanEmail))) {
      return res.status(400).json({ success: false, message: "Email không hợp lệ." });
    }
    if (cleanTopic.length > 100) {
      return res.status(400).json({ success: false, message: "Chủ đề quá dài." });
    }
    if (!cleanMessage || cleanMessage.length > 2000) {
      return res.status(400).json({ success: false, message: "Nội dung không hợp lệ (tối đa 2000 ký tự)." });
    }

    const newContact = await Contact.create({
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      topic: cleanTopic,
      message: cleanMessage,
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
    });
  }
};

// [GET] /api/contacts - Quản trị viên lấy danh sách yêu cầu liên hệ (Lọc trạng thái, Tìm kiếm)
exports.getContacts = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== "ALL") {
      filter.status = status;
    }

    if (search && typeof search === "string" && search.trim()) {
      const safeSearch = search.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      const regex = { $regex: safeSearch, $options: "i" };
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
    });
  }
};

// [PUT] /api/contacts/:id - Quản trị viên cập nhật trạng thái xử lý
exports.updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "ID liên hệ không hợp lệ." });
    }

    const updateFields = {};
    if (status !== undefined) {
      if (!["PENDING", "CONTACTED", "RESOLVED"].includes(status)) {
        return res.status(400).json({ success: false, message: "Trạng thái không hợp lệ." });
      }
      updateFields.status = status;
    }
    if (notes !== undefined) {
      if (typeof notes !== "string" || notes.length > 2000) {
        return res.status(400).json({ success: false, message: "Ghi chú không hợp lệ." });
      }
      updateFields.notes = notes;
    }

    const updated = await Contact.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });
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
    });
  }
};
