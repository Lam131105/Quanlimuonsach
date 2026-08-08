// const LoanService = require("../services/loan.service");
// const MongoDB = require("../utils/mongodb.util"); // Đường dẫn cục diện kết nối của bạn
// const ApiError = require("../api-error");

// // 1. Xử lý Tạo lượt mượn sách mới
// exports.create = async (req, res, next) => {
//   const { readerid, bookid, staffid, borrowDate } = req.body;

//   if (!readerid || !bookid || !staffid) {
//     return next(
//       new ApiError(400, "Độc giả, Sách và Nhân viên duyệt không được để trống"),
//     );
//   }

//   try {
//     const loanService = new LoanService(MongoDB.client);
//     const document = await loanService.create(req.body);
//     return res.send(document);
//   } catch (error) {
//     console.error(error);
//     return next(new ApiError(500, "Có lỗi xảy ra khi tạo lượt mượn sách"));
//   }
// };

// // 2. Lấy toàn bộ danh sách mượn sách
// exports.findAll = async (req, res, next) => {
//   try {
//     const loanService = new LoanService(MongoDB.client);
//     const documents = await loanService.findAll();
//     return res.send(documents);
//   } catch (error) {
//     return next(new ApiError(500, "Có lỗi khi lấy danh sách mượn sách"));
//   }
// };

// // 3. Cập nhật lượt mượn (Ví dụ: Khi độc giả đem sách đến TRẢ)
// exports.update = async (req, res, next) => {
//   try {
//     const loanService = new LoanService(MongoDB.client);
//     const document = await loanService.update(req.params.id, req.body);
//     if (!document) {
//       return next(new ApiError(404, "Không tìm thấy lượt mượn sách này"));
//     }
//     return res.send({ message: "Cập nhật thông tin mượn trả thành công" });
//   } catch (error) {
//     return next(new ApiError(500, "Có lỗi xảy ra khi cập nhật mượn trả"));
//   }
// };

// // Find a single loan with an id
// exports.findOne = async (req, res, next) => {
//   try {
//     const loanService = new LoanService(MongoDB.client);
//     const document = await loanService.findById(req.params.id);
//     if (!document) {
//       return next(new ApiError(404, "Loan record not found"));
//     }
//     return res.send(document);
//   } catch (error) {
//     return next(
//       new ApiError(
//         500,
//         `Error retrieving loan record with id=${req.params.id}`,
//       ),
//     );
//   }
// };

// // Delete a loan with the specified id in the request
// exports.delete = async (req, res, next) => {
//   try {
//     const loanService = new LoanService(MongoDB.client);
//     const document = await loanService.delete(req.params.id);
//     if (!document) {
//       return next(new ApiError(404, "Loan record not found"));
//     }
//     return res.send({ message: "Loan record was deleted successfully" });
//   } catch (error) {
//     return next(
//       new ApiError(
//         500,
//         `Could not delete loan record with id=${req.params.id}`,
//       ),
//     );
//   }
// };

// // Find all loans that are already returned
// exports.findAllReturned = async (_req, res, next) => {
//   try {
//     const loanService = new LoanService(MongoDB.client);
//     const documents = await loanService.findisReturned(); // Gọi chính xác hàm findisReturned() trong Service của bạn
//     return res.send(documents);
//   } catch (error) {
//     return next(
//       new ApiError(500, "An error occurred while retrieving returned loans"),
//     );
//   }
// };

// // Delete all loans from the database
// exports.deleteAll = async (_req, res, next) => {
//   try {
//     const loanService = new LoanService(MongoDB.client);
//     const deletedCount = await loanService.deleteAll();
//     return res.send({
//       message: `${deletedCount} loan records were deleted successfully`,
//     });
//   } catch (error) {
//     return next(
//       new ApiError(500, "An error occurred while removing all loan records"),
//     );
//   }
// };

const LoanService = require("../services/loan.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

// 1. Xử lý Tạo lượt mượn sách mới (Tạo phiếu nháp/chờ duyệt)
exports.create = async (req, res, next) => {
  const { readerid, bookid, staffid } = req.body;

  if (!readerid || !bookid || !staffid) {
    return next(
      new ApiError(
        400,
        "Độc giả, Sách và Nhân viên tạo phiếu không được để trống",
      ),
    );
  }

  try {
    const loanService = new LoanService(MongoDB.client);
    // Mẹo: Khi tạo mới, nên mặc định trạng thái phiếu là "Chờ duyệt" (Pending)
    const payload = { ...req.body, status: "Pending", isReturned: false };
    const document = await loanService.create(payload);
    return res.send(document);
  } catch (error) {
    console.error(error);
    return next(new ApiError(500, "Có lỗi xảy ra khi tạo lượt mượn sách"));
  }
};

// 2. Lấy toàn bộ danh sách mượn sách
exports.findAll = async (req, res, next) => {
  try {
    const loanService = new LoanService(MongoDB.client);
    const documents = await loanService.findAll();
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Có lỗi khi lấy danh sách mượn sách"));
  }
};

// 3. Tìm chi tiết một phiếu mượn cụ thể
exports.findOne = async (req, res, next) => {
  try {
    const loanService = new LoanService(MongoDB.client);
    const document = await loanService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy thông tin lượt mượn này"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi tìm lượt mượn với id=${req.params.id}`),
    );
  }
};

// 4. Cập nhật lượt mượn (Dành cho việc chỉnh sửa thông tin thủ công thông thường)
exports.update = async (req, res, next) => {
  try {
    const loanService = new LoanService(MongoDB.client);
    const document = await loanService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy lượt mượn sách này"));
    }
    return res.send({
      message: "Cập nhật thông tin mượn trả thành công",
      data: document,
    });
  } catch (error) {
    return next(new ApiError(500, "Có lỗi xảy ra khi cập nhật mượn trả"));
  }
};

// 5. Xóa một phiếu mượn (Chỉ dùng khi nhập liệu sai hệ thống)
exports.delete = async (req, res, next) => {
  try {
    const loanService = new LoanService(MongoDB.client);
    const document = await loanService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy phiếu mượn cần xóa"));
    }
    return res.send({ message: "Xóa lượt mượn sách thành công" });
  } catch (error) {
    return next(
      new ApiError(500, `Không thể xóa lượt mượn với id=${req.params.id}`),
    );
  }
};

// --- 💡 CÁC HÀM NÂNG CẤP NGHIỆP VỤ MỚI BỔ SUNG ---

// 6. Lọc toàn bộ danh sách mượn sách của một Độc giả cụ thể
exports.findByReader = async (req, res, next) => {
  try {
    const loanService = new LoanService(MongoDB.client);
    // Gọi hàm tìm theo bộ lọc readerid trong Service của bạn
    const documents = await loanService.find({ readerid: req.params.readerId });
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Có lỗi xảy ra khi tìm danh sách mượn của độc giả ${req.params.readerId}`,
      ),
    );
  }
};

// 7. Lọc các phiếu mượn đã bị quá hạn (Overdue)
exports.findOverdue = async (req, res, next) => {
  try {
    const loanService = new LoanService(MongoDB.client);
    // Lọc theo điều kiện: chưa trả và trạng thái là quá hạn
    const documents = await loanService.find({
      isReturned: false,
      status: "Overdue",
    });
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "Có lỗi xảy ra khi lấy danh sách phiếu quá hạn"),
    );
  }
};

// 8. 🎯 HÀM PHÊ DUYỆT MƯỢN SÁCH (PATCH /:id/approve)
exports.approveLoan = async (req, res, next) => {
  try {
    const loanService = new LoanService(MongoDB.client);

    // Cập nhật trạng thái phiếu thành "Borrowed" (Đang mượn) và ghi nhận ngày mượn thực tế
    const updateData = {
      status: "Borrowed",
      borrowDate: new Date().toISOString().split("T")[0], // Lấy ngày hôm nay định dạng YYYY-MM-DD
    };

    const document = await loanService.update(req.params.id, updateData);
    if (!document) {
      return next(
        new ApiError(404, "Không tìm thấy lượt mượn này để phê duyệt"),
      );
    }

    // 💡 LƯU Ý QUAN TRỌNG: Tại đây sau này bạn nên gọi thêm BookService
    // để tự động trừ bớt số lượng sách trong kho đi 1 quyển nhé!

    return res.send({
      message: "Phê duyệt yêu cầu mượn sách thành công",
      data: document,
    });
  } catch (error) {
    return next(new ApiError(500, "Có lỗi xảy ra khi phê duyệt mượn sách"));
  }
};

// 9. 🎯 HÀM XỬ LÝ KHI ĐỘC GIẢ TRẢ SÁCH (PATCH /:id/return)
exports.returnBook = async (req, res, next) => {
  try {
    const loanService = new LoanService(MongoDB.client);

    const updateData = {
      isReturned: true,
      status: "Returned",
      returnDate: new Date().toISOString().split("T")[0], // Ghi nhận ngày trả thực tế là hôm nay
    };

    const document = await loanService.update(req.params.id, updateData);
    if (!document) {
      return next(
        new ApiError(404, "Không tìm thấy lượt mượn sách này để xử lý trả"),
      );
    }

    // 💡 LƯU Ý QUAN TRỌNG: Tại đây sau này bạn nên gọi thêm BookService
    // để cộng lại số lượng sách vào kho trả về vị trí cũ!

    return res.send({
      message: "Xử lý trả sách và cập nhật kho thành công",
      data: document,
    });
  } catch (error) {
    return next(new ApiError(500, "Có lỗi xảy ra khi xử lý trả sách"));
  }
};
