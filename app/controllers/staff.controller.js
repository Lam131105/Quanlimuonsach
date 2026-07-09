const StaffsService = require("../services/staff.service"); // Hãy chắc chắn tên file service của bạn là staff.service.js hoặc staffs.service.js
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
    const staffService = new StaffsService(MongoDB.client);
    const document = await staffService.create(req.body);

    // Bảo mật: Xóa trường password khỏi đối tượng trước khi phản hồi về Client
    if (document) delete document.password;

    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while creating the staff record"),
    );
  }
};

// 2. Chỉnh sửa hàm findAll để giấu password đi (hoặc xử lý ở Service)
exports.findAll = async (req, res, next) => {
  let documents = [];

  try {
    const staffService = new StaffsService(MongoDB.client);
    const { name } = req.query;
    if (name) {
      documents = await staffService.findByName(name);
    } else {
      documents = await staffService.find({});
    }

    // Bảo mật: Duyệt qua danh sách và xóa password trước khi trả về cho Frontend
    documents.forEach((doc) => {
      if (doc) delete doc.password;
    });
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while retrieving staff records"),
    );
  }

  return res.send(documents);
};

// Find a single staff with an id
// Find a single staff with an id
exports.findOne = async (req, res, next) => {
  try {
    const staffService = new StaffsService(MongoDB.client);
    const document = await staffService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Staffs record not found"));
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
        `Error retrieving staff record with id=${req.params.id}`,
      ),
    );
  }
};

// Update a staff by the id in the request
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Data to update cannot be empty"));
  }

  try {
    const staffService = new StaffsService(MongoDB.client);
    const document = await staffService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Staffs record not found"));
    }
    return res.send({ message: "Staffs record was updated successfully" });
  } catch (error) {
    return next(
      new ApiError(500, `Error updating staff record with id=${req.params.id}`),
    );
  }
};

// Delete a staff with the specified id in the request
exports.delete = async (req, res, next) => {
  try {
    const staffService = new StaffsService(MongoDB.client);
    const document = await staffService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Staffs record not found"));
    }
    return res.send({ message: "Staffs record was deleted successfully" });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Could not delete staff record with id=${req.params.id}`,
      ),
    );
  }
};

// Delete all staffs from the database
exports.deleteAll = async (_req, res, next) => {
  try {
    const staffService = new StaffsService(MongoDB.client);
    const deletedCount = await staffService.deleteAll();
    return res.send({
      message: `${deletedCount} staff records were deleted successfully`,
    });
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while removing all staff records"),
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
    const staffService = new StaffsService(MongoDB.client);
    // 2. Gọi sang Service để xử lý logic xác thực
    const staff = await staffService.login(gmail, password);
    // Nếu Service trả về null (Nghĩa là sai gmail hoặc sai mật khẩu)
    if (!staff) {
      return next(new ApiError(401, "Gmail hoặc mật khẩu không chính xác"));
    }
    // 3. Trả phản hồi về cho Frontend nếu mọi thứ hợp lệ
    return res.send({
      message: "Đăng nhập thành công!",
      user: staff,
    });
  } catch (error) {
    return next(new ApiError(500, "Có lỗi xảy ra trong quá trình đăng nhập"));
  }
};
