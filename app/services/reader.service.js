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
      address: payload.address,
      phone: payload.phone,
    };

    // Remove undefined fields
    Object.keys(reader).forEach(
      (key) => reader[key] === undefined && delete reader[key],
    );
    return reader;
  }

  async create(payload) {
    const reader = this.extractConactData(payload);
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
}

module.exports = ReaderService;
