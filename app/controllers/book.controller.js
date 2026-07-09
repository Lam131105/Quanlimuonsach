const BookService = require("../services/book.service"); // Hãy chắc chắn tên file service của bạn là book.service.js hoặc books.service.js
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

// Tạo và Lưu một cuốn sách mới
exports.create = async (req, res, next) => {
  // Kiểm tra các trường bắt buộc mới (Sách cần có mảng thể loại và id NXB)
  if (
    !req.body?.name ||
    !req.body?.year ||
    !req.body?.description ||
    !req.body?.categoryIds || // Mảng ID Thể loại từ Frontend gửi lên
    !req.body?.publisherId || // ID Nhà xuất bản từ Frontend gửi lên
    !req.body?.imgUrl
  ) {
    return next(
      new ApiError(
        400,
        "Thông tin sách (Tên, Tác giả, Thể loại, Nhà xuất bản, Ảnh) không được để trống",
      ),
    );
  }

  // Đảm bảo categoryIds gửi lên phải là một mảng
  if (!Array.isArray(req.body.categoryIds)) {
    return next(
      new ApiError(400, "Danh sách thể loại (categoryIds) phải là một mảng []"),
    );
  }

  try {
    const bookService = new BookService(MongoDB.client);
    const document = await bookService.create(req.body);
    return res.send(document);
  } catch (error) {
    console.error("Lỗi tạo sách:", error);
    return next(
      new ApiError(500, "Có lỗi xảy ra trong quá trình tạo sách mới"),
    );
  }
};

// Retrieve all books from the database
exports.findAll = async (req, res, next) => {
  let documents = [];

  try {
    const bookService = new BookService(MongoDB.client);
    const { name } = req.query; // Tìm kiếm theo query string: ?name=xxx
    if (name) {
      documents = await bookService.findByName(name);
    } else {
      documents = await bookService.find({});
    }
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while retrieving book records"),
    );
  }

  return res.send(documents);
};

// Find a single book with an id
exports.findOne = async (req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const document = await bookService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Book record not found"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Error retrieving book record with id=${req.params.id}`,
      ),
    );
  }
};

// Update a book by the id in the request
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Data to update cannot be empty"));
  }

  try {
    const bookService = new BookService(MongoDB.client);
    const document = await bookService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Book record not found"));
    }
    return res.send({ message: "Book record was updated successfully" });
  } catch (error) {
    return next(
      new ApiError(500, `Error updating book record with id=${req.params.id}`),
    );
  }
};

// Delete a book with the specified id in the request
exports.delete = async (req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const document = await bookService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Book record not found"));
    }
    return res.send({ message: "Book record was deleted successfully" });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Could not delete book record with id=${req.params.id}`,
      ),
    );
  }
};

// Delete all books from the database
exports.deleteAll = async (_req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const deletedCount = await bookService.deleteAll();
    return res.send({
      message: `${deletedCount} book records were deleted successfully`,
    });
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while removing all book records"),
    );
  }
};
