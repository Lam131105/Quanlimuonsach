const bcrypt = require("bcrypt");

const { ObjectId } = require("mongodb");
const { getNextSequenceValue } = require("../utils/sequence.util");

class ReaderService {
  constructor(client) {
    this.reader = client.db().collection("readers");
    this.db = client.db();
  }

  // 1. Hàm lọc dữ liệu: Bỏ hoàn toàn trường lateReturnCount ra ngoài
  extractConactData(payload) {
    const reader = {
      lastName: payload.lastName,
      firstName: payload.firstName,
      birthDay: payload.birthDay,
      gender: payload.gender,
      gmail: payload.gmail,
      address: payload.address,
      phone: payload.phone,
      password: payload.password,
      isActive: payload.isActive !== undefined ? payload.isActive : true,
      // ❌ Đã xóa dòng khởi tạo lateReturnCount ở đây
    };

    // Remove undefined fields
    Object.keys(reader).forEach(
      (key) => reader[key] === undefined && delete reader[key],
    );
    return reader;
  }

  // 2. Hàm tạo mới: Chủ động gán lateReturnCount bằng 0 tại đây
  async create(payload) {
    const nextreaderid = await getNextSequenceValue(this.db, "readerid");
    const reader = this.extractConactData(payload);

    reader.readerid = nextreaderid;
    reader.lateReturnCount = 0; // 🔥 Khởi tạo giá trị mặc định bằng 0 CHỈ khi tạo mới tài khoản

    if (reader.password) {
      const saltRounds = 10;
      reader.password = await bcrypt.hash(reader.password, saltRounds);
    }

    const result = await this.reader.insertOne(reader);
    return {
      _id: result.insertedId,
      ...reader,
    };
  }

  async find(filter) {
    const cursor = await this.reader.find(filter);
    return await cursor.toArray();
  }

  async findByName(name) {
    return await this.find({
      $expr: {
        $regexMatch: {
          input: { $concat: ["$lastName", " ", "$firstName"] }, // Tự động gộp "Họ + Tên" thành một chuỗi duy nhất
          regex: name,
          options: "i", // Tìm kiếm không phân biệt chữ hoa hay chữ thường
        },
      },
    });
  }

  async findById(id) {
    return await this.reader.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = this.extractConactData(payload);
    const result = await this.reader.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" },
    );
    return result;
  }

  async delete(id) {
    const result = await this.reader.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  async deleteAll() {
    const result = await this.reader.deleteMany({});
    return result.deletedCount;
  }

  async login(gmail, password) {
    // 1. Tìm độc giả trong database dựa vào Gmail
    const reader = await this.reader.findOne({ gmail: gmail });
    if (!reader) {
      return null; // Không tìm thấy user
    }
    // 2. So sánh mật khẩu bằng bcrypt
    const isMatch = await bcrypt.compare(password, reader.password);
    if (!isMatch) {
      return null; // Sai mật khẩu
    }
    if (reader.isActive === false) {
      return "ACCOUNT_LOCKED"; // Trả về nhãn đánh dấu tài khoản bị khóa
    }
    // 4. Bảo mật: Xóa mật khẩu hash trước khi trả về
    delete reader.password;
    return reader; // Trả về thông tin user hợp lệ
  }

  async updateStatus(id, isActive) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };

    // 1. Tìm độc giả hiện tại trong DB để kiểm tra trạng thái cũ của họ
    const currentReader = await this.reader.findOne(filter);
    if (!currentReader) {
      return null; // Không tìm thấy độc giả
    }

    // Đảm bảo giá trị isActive truyền vào ép buộc về kiểu Boolean (true/false)
    const statusValue = isActive === true;

    // 2. Tạo đối tượng cập nhật mặc định
    const updateFields = { isActive: statusValue };

    // 💥 LOGIC THÔNG MINH CỦA BẠN:
    // Nếu trạng thái cũ đang là khóa (false) VÀ thủ thư truyền vào mở khóa (true)
    if (currentReader.isActive === false && statusValue === true) {
      updateFields.lateReturnCount = 0; // Tự động reset bộ đếm vi phạm về 0
      console.log(
        `🔓 Hệ thống: Đã mở khóa tài khoản và reset bộ đếm vi phạm của [${currentReader.readerid}] về 0.`,
      );
    } else {
      console.log(
        `🔒 Hệ thống: Cập nhật trạng thái tài khoản [${currentReader.readerid}] thành ${statusValue} (Giữ nguyên số lần phạt: ${currentReader.lateReturnCount || 0}).`,
      );
    }

    // 3. Thực hiện cập nhật vào Database bằng lệnh $set
    const result = await this.reader.findOneAndUpdate(
      filter,
      { $set: updateFields },
      { returnDocument: "after" }, // Trả về thông tin độc giả mới nhất sau khi đổi trạng thái
    );

    return result;
  }

 
  async incrementViolation(id) {
    const filter = { _id: ObjectId.isValid(id) ? new ObjectId(id) : id };

    // Dùng lệnh $inc của MongoDB để tự động tăng số lần vi phạm lên 1 đơn vị
    const result = await this.reader.findOneAndUpdate(
      filter,
      { $inc: { lateReturnCount: 1 } },
      { returnDocument: "after" }, // Trả về dữ liệu độc giả SAU KHI đã cộng điểm phạt
    );

    return result;
  }
}

module.exports = ReaderService;
