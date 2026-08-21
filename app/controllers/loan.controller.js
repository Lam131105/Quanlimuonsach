const LoanService = require("../services/loan.service");
const ReaderService = require("../services/reader.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const { ObjectId } = require("mongodb");

// 1. Xử lý Tạo lượt mượn sách mới (Tạo phiếu nháp/chờ duyệt)
exports.create = async (req, res, next) => {
  const { readerid, bookid, quantity } = req.body;
  const borrowQuantity = quantity ? Number(quantity) : 1;

  if (!readerid || !bookid) {
    return next(new ApiError(400, "Độc giả và Sách không được để trống"));
  }

  if (borrowQuantity <= 0) {
    return next(new ApiError(400, "Số lượng sách mượn phải lớn hơn 0"));
  }

  try {
    const loanService = new LoanService(MongoDB.client);
    const payload = {
      ...req.body,
      quantity: borrowQuantity,
      status: req.body.status || "Pending",
      staffid: req.body.staffid || null,
      borrowDate: null,
      returnDate: null,
    };

    const document = await loanService.create(payload);
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Có lỗi xảy ra khi đặt mượn sách"));
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
    const idFromParams = req.params.readerId;

    if (!idFromParams) {
      return res
        .status(400)
        .send({ message: "Không tìm thấy ID độc giả trên URL" });
    }

    // Ép kiểu sang ObjectId để tìm kiếm trong MongoDB
    const filter = {
      readerid: idFromParams,
    };

    const documents = await loanService.find(filter);

    console.log(`Tìm thấy ${documents.length} phiếu mượn.`);
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
  const { staffid } = req.body; // Nhân viên quầy truyền ID của mình lên khi bấm duyệt

  if (!staffid) {
    return next(
      new ApiError(400, "Phải có thông tin nhân viên thực hiện phê duyệt"),
    );
  }

  try {
    const loanService = new LoanService(MongoDB.client);

    // 💡 Tự động tính toán ngày mượn và hạn trả 14 ngày
    const today = new Date();
    const borrowDateStr = today.toISOString().split("T")[0]; // Ngày mượn là hôm nay (YYYY-MM-DD)

    today.setDate(today.getDate() + 14); // Tăng thêm 14 ngày
    const dueDateStr = today.toISOString().split("T")[0]; // Hạn trả tự động (YYYY-MM-DD)

    const updateData = {
      status: "Borrowed",
      staffid: staffid, // Đóng dấu nhân viên xử lý vào đây
      borrowDate: borrowDateStr, // Cập nhật ngày mượn thực tế
      dueDate: dueDateStr, // 🎯 TỰ ĐỘNG CHUYỂN THÀNH 14 NGÀY Ở ĐÂY
    };

    const document = await loanService.update(req.params.id, updateData);
    if (!document) {
      return next(
        new ApiError(404, "Không tìm thấy lượt mượn này để phê duyệt"),
      );
    }

    return res.send({
      message: "Nhân viên đã duyệt giao sách thành công",
      data: document,
    });
  } catch (error) {
    return next(new ApiError(500, "Có lỗi xảy ra khi phê duyệt mượn sách"));
  }
};

// 9. 🎯 HÀM XỬ LÝ KHI ĐỘC GIẢ TRẢ SÁCH (PATCH /:id/return)
exports.returnBook = async (req, res, next) => {
  // 🔴 Đã bỏ 'note' ra khỏi dòng này
  const { staffid_return, quantity_returned, fine_amount, bookid } = req.body;

  if (!staffid_return) {
    return next(
      new ApiError(
        400,
        "Không thể xử lý: Thiếu thông tin nhân viên tiếp nhận trả sách",
      ),
    );
  }
  if (quantity_returned === undefined || quantity_returned === null) {
    return next(
      new ApiError(
        400,
        "Không thể xử lý: Thiếu số lượng sách thực tế mang trả",
      ),
    );
  }
  if (!bookid) {
    return next(
      new ApiError(400, "Không thể xử lý: Thiếu mã định danh sách để hoàn kho"),
    );
  }

  try {
    const loanService = new LoanService(MongoDB.client);

    const returnPayload = {
      staffid_return: staffid_return,
      quantity_returned: quantity_returned,
      fine_amount: fine_amount,
      bookid: bookid,
    };

    const document = await loanService.processReturnBook(
      req.params.id,
      returnPayload,
    );

    if (!document) {
      return next(
        new ApiError(404, "Không tìm thấy lượt mượn sách này để xử lý trả"),
      );
    }

    return res.send({
      message: "🎉 Tiếp nhận trả sách và cập nhật số lượng kho thành công!",
      data: document,
    });
  } catch (error) {
    return next(
      new ApiError(
        500,
        "Có lỗi xảy ra trong quá trình xử lý tiếp nhận trả sách hệ thống",
      ),
    );
  }
};


exports.autoCheckLoanStatuses = async (req, res, next) => {
  try {
    const loanService = new LoanService(MongoDB.client);
    const readerService = new ReaderService(MongoDB.client);

    // Lấy chuỗi ngày hôm nay dạng YYYY-MM-DD
    const todayStr = new Date().toISOString().split("T")[0];
    const today = new Date(todayStr);

    // =========================================================================
    // TÁC VỤ 1: TỰ ĐỘNG HỦY PHIẾU CHỜ DUYỆT (PENDING) QUÁ HẠN LẤY SÁCH
    // =========================================================================
    const expiredLoans = await loanService.find({
      status: "Pending",
      pickupDeadline: { $lt: todayStr },
    });

    for (const loan of expiredLoans) {
      await loanService.update(loan._id, { status: "Cancelled" });
    }

    // =========================================================================
    // TÁC VỤ 2: TỰ ĐỘNG CHUYỂN TRẠNG THÁI THÀNH QUÁ HẠN (OVERDUE) & PHẠT/KHÓA TK
    // =========================================================================
    const activeOverdueLoans = await loanService.find({
      status: { $in: ["Borrowed", "Overdue"] },
      dueDate: { $lt: todayStr },
    });

    let newOverdueCount = 0;
    let lockedReadersCount = 0;

    for (const loan of activeOverdueLoans) {
      let isAlreadyLocked = false;

      // 2.1. NẾU VỪA CHUYỂN SANG OVERDUE HÔM NAY (Từ Borrowed -> Overdue)
      if (loan.status === "Borrowed") {
        await loanService.update(loan._id, { status: "Overdue" });
        newOverdueCount++;

        // Tự động tăng số lần vi phạm của độc giả lên +1
        const updatedReader = await readerService.incrementViolation(
          loan.readerid,
        );

        // Kiểm tra nếu số lần tích lũy vi phạm vượt ngưỡng (>= 3 lần) thì khóa tài khoản
        if (
          updatedReader &&
          updatedReader.lateReturnCount >= 3 &&
          updatedReader.isActive !== false
        ) {
          await readerService.updateStatus(loan.readerid, false);
          console.log(
            `🤖 Robot: Đã khóa tài khoản độc giả [${updatedReader.readerid || loan.readerid}] do tích lũy quá 3 lần vi phạm trả trễ!`,
          );
          lockedReadersCount++;
          isAlreadyLocked = true; // Đánh dấu đã khóa ở bước này rồi
        }
      }

      // 2.2. NẾU NẰM LÌ GIỮ SÁCH QUÁ 15 NGÀY (Áp dụng cho cả phiếu Overdue từ trước)
      if (!isAlreadyLocked && loan.status === "Overdue") {
        // Nếu chưa bị khóa ở bước trên thì mới xét tiếp
        const dueDate = new Date(loan.dueDate);
        const timeDiff = today.getTime() - dueDate.getTime();
        const daysLate = Math.floor(timeDiff / (1000 * 3600 * 24)); // Quy đổi ra số ngày

        if (daysLate >= 15) {
          // Lấy thông tin độc giả bằng hàm findById (hoặc get tuỳ theo service của bạn)
          const reader = await readerService.findById(loan.readerid);

          if (reader && reader.isActive !== false) {
            await readerService.updateStatus(loan.readerid, false);
            console.log(
              `🤖 Robot: Đã khóa tài khoản [${reader.readerid}] do giữ sách quá hạn nặng (Trễ ${daysLate} ngày).`,
            );
            lockedReadersCount++;
          }
        }
      }
    }

    // Trả về báo cáo kết quả ra màn hình console của Robot Cron Job
    return res.send({
      message: "Robot quét trạng thái và bảo trì tài khoản hoàn tất thành công",
      detail: {
        cancelledCount: expiredLoans.length,
        newOverdueCount: newOverdueCount,
        totalOverdueCount: activeOverdueLoans.length,
        lockedReadersCount: lockedReadersCount,
      },
    });
  } catch (error) {
    console.error("Lỗi khi tự động dọn dẹp phiếu quá hạn:", error);
    return next(new ApiError(500, "Lỗi khi tự động dọn dẹp phiếu quá hạn"));
  }
};
