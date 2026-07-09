const LoanService = require("../services/loan.service");
const MongoDB = require("../utils/mongodb.util"); // Đường dẫn cục diện kết nối của bạn
const ApiError = require("../api-error");

// 1. Xử lý Tạo lượt mượn sách mới
exports.create = async (req, res, next) => {
  const { readerid, bookid, staffid, borrowDate } = req.body;

  if (!readerid || !bookid || !staffid) {
    return next(
      new ApiError(400, "Độc giả, Sách và Nhân viên duyệt không được để trống"),
    );
  }

  try {
    const loanService = new LoanService(MongoDB.client);
    const document = await loanService.create(req.body);
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

// 3. Cập nhật lượt mượn (Ví dụ: Khi độc giả đem sách đến TRẢ)
exports.update = async (req, res, next) => {
  try {
    const loanService = new LoanService(MongoDB.client);
    const document = await loanService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy lượt mượn sách này"));
    }
    return res.send({ message: "Cập nhật thông tin mượn trả thành công" });
  } catch (error) {
    return next(new ApiError(500, "Có lỗi xảy ra khi cập nhật mượn trả"));
  }
};

// Find a single loan with an id
exports.findOne = async (req, res, next) => {
  try {
    const loanService = new LoanService(MongoDB.client);
    const document = await loanService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Loan record not found"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Error retrieving loan record with id=${req.params.id}`,
      ),
    );
  }
};

// Delete a loan with the specified id in the request
exports.delete = async (req, res, next) => {
  try {
    const loanService = new LoanService(MongoDB.client);
    const document = await loanService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Loan record not found"));
    }
    return res.send({ message: "Loan record was deleted successfully" });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Could not delete loan record with id=${req.params.id}`,
      ),
    );
  }
};

// Find all loans that are already returned
exports.findAllReturned = async (_req, res, next) => {
  try {
    const loanService = new LoanService(MongoDB.client);
    const documents = await loanService.findisReturned(); // Gọi chính xác hàm findisReturned() trong Service của bạn
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while retrieving returned loans"),
    );
  }
};

// Delete all loans from the database
exports.deleteAll = async (_req, res, next) => {
  try {
    const loanService = new LoanService(MongoDB.client);
    const deletedCount = await loanService.deleteAll();
    return res.send({
      message: `${deletedCount} loan records were deleted successfully`,
    });
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while removing all loan records"),
    );
  }
};
