const BookService = require("../services/book.service"); // Hãy chắc chắn tên file service của bạn là book.service.js hoặc books.service.js
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

// Tạo và Lưu một cuốn sách mới
exports.create = async (req, res, next) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ message: "Vui lòng upload hình ảnh cho sách" });
  }
  if (!req.body.name || !req.body.price) {
    return res
      .status(400)
      .json({ message: "Thông tin sách không được để trống" });
  }

  try {
    // 1. Lấy mảng categoryIds từ FormData gửi lên (thử cả 2 trường hợp có [] và không có [])
    let rawCategories = req.body.categoryIds || req.body["categoryIds[]"] || [];

    // 2. Chuẩn hóa dữ liệu mảng (nếu là chuỗi JSON thì parse, nếu là chuỗi đơn thì bọc thành mảng)
    let finalCategories = [];
    if (typeof rawCategories === "string") {
      try {
        finalCategories = JSON.parse(rawCategories);
      } catch (e) {
        finalCategories = [rawCategories]; // Trường hợp chỉ chọn 1 thể loại, nó truyền sang dạng chuỗi thô
      }
    } else {
      finalCategories = rawCategories;
    }

    // 3. Đóng gói dữ liệu chuẩn chỉnh theo đúng Schema MongoDB của bạn
    const bookData = {
      name: req.body.name,
      auth: req.body.auth,
      publisherId: req.body.publisherId,
      year: req.body.year ? Number(req.body.year) : undefined,
      price: Number(req.body.price),
      quantity: Number(req.body.quantity),
      imgUrl: req.file.filename,
      categoryIds: finalCategories, // Gán mảng đã chuẩn hóa sạch sẽ vào đây
      description: req.body.description,
    };

    // 4. Lưu vào Database
    const bookService = new BookService(MongoDB.client);
    const document = await bookService.create(bookData);

    return res
      .status(201)
      .json({ message: "Thêm sách thành công", data: document });
  } catch (error) {
    // ĐOẠN NÀY RẤT QUAN TRỌNG: In lỗi thực tế ra Terminal Backend để biết MongoDB đang chê cụ thể trường nào
    console.error("====== LỖI TẠI BACKEND CONTROLLER ======");
    console.error(error);
    console.error("========================================");

    return res.status(500).json({
      message: "Có lỗi xảy ra khi lưu vào database",
      error: error.message,
    });
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
  // 1. Kiểm tra dữ liệu rỗng
  if (Object.keys(req.body).length === 0 && !req.file) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }

  try {
    const bookService = new BookService(MongoDB.client);
    const updateData = { ...req.body };

    // 2. Chuyển đổi categoryIds từ chuỗi FormData về mảng []
    if (typeof updateData.categoryIds === "string") {
      updateData.categoryIds = JSON.parse(updateData.categoryIds);
    }

    // 3. Nếu có ảnh mới thì cập nhật tên file, không có thì bỏ qua (giữ ảnh cũ)
    if (req.file) {
      updateData.imgUrl = req.file.filename;
    }

    // 4. Cập nhật vào DB
    const document = await bookService.update(req.params.id, updateData);
    if (!document) return next(new ApiError(404, "Không tìm thấy sách"));

    return res.send({ message: "Cập nhật sách thành công!" });
  } catch (error) {
    return next(new ApiError(500, `Lỗi khi cập nhật sách id=${req.params.id}`));
  }
};

// Delete a book with the specified id in the request
exports.delete = async (req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const document = await bookService.delete(req.params.id);

    // 🚨 BẮT BUỘC: Phải check điều kiện này TRƯỚC KHI check !document
    if (document === "HAS_LOAN_RECORD") {
      return next(
        new ApiError(
          400,
          "Không thể xóa! Sách này hiện đang có dữ liệu trong danh sách Quản lý mượn - trả.",
        ),
      );
    }

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
