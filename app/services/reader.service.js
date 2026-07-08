const bcrypt = require("bcrypt");

const { ObjectId } = require("mongodb");

class ReaderService {
  constructor(client) {
    this.reader = client.db().collection("readers");
  }

  // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
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
    };

    // Remove undefined fields
    Object.keys(reader).forEach(
      (key) => reader[key] === undefined && delete reader[key],
    );
    return reader;
  }

  async create(payload) {
    const reader = this.extractConactData(payload);
    if (reader.password) {
      const saltRounds = 10; // Độ phức tạp của thuật toán băm mã hóa
      reader.password = await bcrypt.hash(reader.password, saltRounds);
      // Mật khẩu "123456" gõ vào sẽ biến thành chuỗi dạng "$2b$10$xyz..." cực kỳ an toàn trong DB
    }
    const result = await this.reader.findOneAndUpdate(
      reader, // Tham số 1: Bộ lọc (tìm xem sách này đã tồn tại chưa)
      { $set: reader }, // Tham số 2: Nếu chưa có hoặc có rồi thì cập nhật thông tin này vào
      { returnDocument: "after", upsert: true }, // Tham số 3: Cấu hình tạo mới nếu chưa có
    );
    return result;
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
    // (Lưu ý: Bạn dùng this.reader hay this.collection thì sửa lại cho đúng nhé)
    const reader = await this.reader.findOne({ gmail: gmail });
    if (!reader) {
      return null; // Không tìm thấy user
    }
    // 2. So sánh mật khẩu bằng bcrypt
    const isMatch = await bcrypt.compare(password, reader.password);
    if (!isMatch) {
      return null; // Sai mật khẩu
    }
    // 3. Bảo mật: Xóa mật khẩu hash trước khi trả về
    delete reader.password;
    return reader; // Trả về thông tin user hợp lệ
  }
}

module.exports = ReaderService;
