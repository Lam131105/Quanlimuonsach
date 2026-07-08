const ReaderService = require("../services/reader.service"); // Hãy chắc chắn tên file service của bạn là reader.service.js hoặc readers.service.js
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const bcrypt = require("bcrypt");

// 1. Thêm validate trường password trong hàm create
exports.create = async (req, res, next) => {
  if (
    !req.body?.firstName ||
    !req.body?.lastName ||
    !req.body?.birthDay ||
    !req.body?.gender ||
    !req.body?.gmail ||
    !req.body?.password // 👈 THÊM DÒNG NÀY: Kiểm tra có truyền password lên không
  ) {
    return next(
      new ApiError(400, "Missing required fields, including password"),
    );
  }

  try {
    const readerService = new ReaderService(MongoDB.client);
    const document = await readerService.create(req.body);

    // Bảo mật: Xóa trường password khỏi đối tượng trước khi phản hồi về Client
    if (document) delete document.password;

    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while creating the reader record"),
    );
  }
};

// 2. Chỉnh sửa hàm findAll để giấu password đi (hoặc xử lý ở Service)
exports.findAll = async (req, res, next) => {
  let documents = [];

  try {
    const readerService = new ReaderService(MongoDB.client);
    const { name } = req.query;
    if (name) {
      documents = await readerService.findByName(name);
    } else {
      documents = await readerService.find({});
    }

    // Bảo mật: Duyệt qua danh sách và xóa password trước khi trả về cho Frontend
    documents.forEach((doc) => {
      if (doc) delete doc.password;
    });
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while retrieving reader records"),
    );
  }

  return res.send(documents);
};

// Find a single reader with an id
// Find a single reader with an id
exports.findOne = async (req, res, next) => {
  try {
    const readerService = new ReaderService(MongoDB.client);
    const document = await readerService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Reader record not found"));
    }

    // BẢO MẬT: Xóa trường password trước khi trả về dữ liệu cho Frontend
    if (document.password) {
      delete document.password;
    }

    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Error retrieving reader record with id=${req.params.id}`,
      ),
    );
  }
};

// Update a reader by the id in the request
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Data to update cannot be empty"));
  }

  try {
    const readerService = new ReaderService(MongoDB.client);
    const document = await readerService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Reader record not found"));
    }
    return res.send({ message: "Reader record was updated successfully" });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Error updating reader record with id=${req.params.id}`,
      ),
    );
  }
};

// Delete a reader with the specified id in the request
exports.delete = async (req, res, next) => {
  try {
    const readerService = new ReaderService(MongoDB.client);
    const document = await readerService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Reader record not found"));
    }
    return res.send({ message: "Reader record was deleted successfully" });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Could not delete reader record with id=${req.params.id}`,
      ),
    );
  }
};

// Delete all readers from the database
exports.deleteAll = async (_req, res, next) => {
  try {
    const readerService = new ReaderService(MongoDB.client);
    const deletedCount = await readerService.deleteAll();
    return res.send({
      message: `${deletedCount} reader records were deleted successfully`,
    });
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while removing all reader records"),
    );
  }
};

// Xử lý Đăng nhập Độc giả
exports.login = async (req, res, next) => {
  const { gmail, password } = req.body;
  // 1. Kiểm tra đầu vào thô
  if (!gmail || !password) {
    return next(new ApiError(400, "Gmail và mật khẩu không được để trống"));
  }
  try {
    const readerService = new ReaderService(MongoDB.client);
    // 2. Gọi sang Service để xử lý logic xác thực
    const reader = await readerService.login(gmail, password);
    // Nếu Service trả về null (Nghĩa là sai gmail hoặc sai mật khẩu)
    if (!reader) {
      return next(new ApiError(401, "Gmail hoặc mật khẩu không chính xác"));
    }
    // 3. Trả phản hồi về cho Frontend nếu mọi thứ hợp lệ
    return res.send({
      message: "Đăng nhập thành công!",
      user: reader,
    });
  } catch (error) {
    return next(new ApiError(500, "Có lỗi xảy ra trong quá trình đăng nhập"));
  }
};
