const { ObjectId } = require("mongodb");

class BookService {
  constructor(client) {
    this.book = client.db().collection("books");
  }

  // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
  extractConactData(payload) {
    const book = {
      name: payload.name,
      auth: payload.auth,
      category: payload.category,
      description: payload.description,
      imgUrl: payload.imgUrl,
    };

    // Remove undefined fields
    Object.keys(book).forEach(
      (key) => book[key] === undefined && delete book[key],
    );
    return book;
  }

  async create(payload) {
    const book = this.extractConactData(payload);
    const result = await this.book.findOneAndUpdate(
      book, // Tham số 1: Bộ lọc (tìm xem sách này đã tồn tại chưa)
      { $set: book }, // Tham số 2: Nếu chưa có hoặc có rồi thì cập nhật thông tin này vào
      { returnDocument: "after", upsert: true }, // Tham số 3: Cấu hình tạo mới nếu chưa có
    );
    return result;
  }

  async find(filter) {
    const cursor = await this.book.find(filter);
    return await cursor.toArray();
  }

  async findByName(name) {
    return await this.find({
      name: { $regex: new RegExp(name), $options: "i" },
    });
  }

  async findById(id) {
    return await this.book.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = this.extractConactData(payload);
    const result = await this.book.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" },
    );
    return result;
  }

  async delete(id) {
    const result = await this.book.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  async deleteAll() {
    const result = await this.book.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = BookService;
