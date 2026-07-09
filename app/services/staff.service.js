const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const { getNextSequenceValue } = require("../utils/sequence.util");

class StaffService {
  constructor(client) {
    this.staff = client.db().collection("staffs");
    this.db = client.db();
  }

  // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
  extractConactData(payload) {
    const staff = {
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
    Object.keys(staff).forEach(
      (key) => staff[key] === undefined && delete staff[key],
    );
    return staff;
  }

  async create(payload) {
    const nextstaffid = await getNextSequenceValue(this.db, "staffid");
    const staff = this.extractConactData(payload);
    staff.staffid = nextstaffid;
    if (staff.password) {
      const saltRounds = 10; // Độ phức tạp của thuật toán băm mã hóa
      staff.password = await bcrypt.hash(staff.password, saltRounds);
      // Mật khẩu "123456" gõ vào sẽ biến thành chuỗi dạng "$2b$10$xyz..." cực kỳ an toàn trong DB
    }
    const result = await this.staff.insertOne(staff);
    return {
      _id: result.insertedId,
      ...staff,
    };
  }

  async find(filter) {
    const cursor = await this.staff.find(filter);
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
    return await this.staff.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = this.extractConactData(payload);
    const result = await this.staff.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" },
    );
    return result;
  }

  async delete(id) {
    const result = await this.staff.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  async deleteAll() {
    const result = await this.staff.deleteMany({});
    return result.deletedCount;
  }

  async login(gmail, password) {
    // 1. Tìm độc giả trong database dựa vào Gmail
    // (Lưu ý: Bạn dùng this.staff hay this.collection thì sửa lại cho đúng nhé)
    const staff = await this.staff.findOne({ gmail: gmail });
    if (!staff) {
      return null; // Không tìm thấy user
    }
    // 2. So sánh mật khẩu bằng bcrypt
    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) {
      return null; // Sai mật khẩu
    }
    // 3. Bảo mật: Xóa mật khẩu hash trước khi trả về
    delete staff.password;
    return staff; // Trả về thông tin user hợp lệ
  }
}

module.exports = StaffService;
