const { ObjectId } = require("mongodb");
const { getNextSequenceValue } = require("../utils/sequence.util");
class BookService {
  constructor(client) {
    this.book = client.db().collection("books");
    this.db = client.db();
  }

  extractBookData(payload) {
    const book = {
      name: payload.name,
      auth: payload.auth,
      description: payload.description,
      imgUrl: payload.imgUrl,

      // 1. Chuyển đổi mảng chuỗi ID Thể loại thành mảng các ObjectId
      categoryIds: payload.categoryIds
        .map((id) => (ObjectId.isValid(id) ? new ObjectId(id) : null))
        .filter((id) => id !== null), // Loại bỏ các ID không hợp lệ nếu có

      // 2. Chuyển đổi ID Nhà xuất bản thành một ObjectId duy nhất
      publisherId: ObjectId.isValid(payload.publisherId)
        ? new ObjectId(payload.publisherId)
        : null,

      // Thêm các trường số lượng, năm nếu bạn mở khóa comment về sau
      quantity: payload.quantity ? parseInt(payload.quantity) : 0,
      year: payload.year ? parseInt(payload.year) : null,
    };

    // Loại bỏ các trường undefined
    Object.keys(book).forEach(
      (key) => book[key] === undefined && delete book[key],
    );
    return book;
  }
  async create(payload) {
    const nextbookid = await getNextSequenceValue(this.db, "bookid");

    const book = this.extractBookData(payload);
    book.bookid = nextbookid;

    const result = await this.book.insertOne(book);
    return {
      _id: result.insertedId,
      ...book,
    };
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

    // 💡 ĐIỂM MẤT CHỐT: Đi qua hàm bóc tách extractBookData để ép kiểu
    // mảng categoryIds và publisherId sang dạng ObjectId giống như lúc Thêm mới
    const update = this.extractBookData(payload);

    // Xóa trường _id ra khỏi object update nếu vô tình có, tránh lỗi sửa ID của MongoDB
    delete update._id;

    const result = await this.book.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }, // Trả về dữ liệu mới nhất sau khi sửa thành công
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
