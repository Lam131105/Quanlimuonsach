const express = require("express");
const loans = require("../controllers/loan.controller");

const router = express.Router();

// 1. Quản lý danh sách tổng (Đã bỏ DELETE ALL để an toàn)
router.route("/").get(loans.findAll).post(loans.create);

// 2. Các tuyến đường bộ lọc & thống kê đặc biệt (Phải đặt TRƯỚC tuyến đường có chứa /:id)
router.route("/status/overdue").get(loans.findOverdue); // Lọc phiếu quá hạn
router.route("/reader/:readerId").get(loans.findByReader); // Lọc theo từng độc giả

// 3. Quản lý chi tiết từng phiếu mượn
router
  .route("/:id")
  .get(loans.findOne)
  .put(loans.update) // Sửa thông tin thủ công nếu cần
  .delete(loans.delete); // Chỉ cho xóa nếu phiếu mượn bị nhập nhầm/lỗi

// 4. Các hành động thay đổi trạng thái theo quy trình mượn - trả
router.route("/:id/approve").patch(loans.approveLoan); // Duyệt mượn (Trừ kho sách)
router.route("/:id/return").patch(loans.returnBook); // Trả sách (Cộng lại kho sách)

module.exports = router;
