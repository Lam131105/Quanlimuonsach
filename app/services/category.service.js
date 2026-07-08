const { ObjectId } = require("mongodb");

class CategoryService {
  constructor(client) {
    // Đã trỏ đúng vào bảng categories
    this.category = client.db().collection("categories");
  }

  // Sửa lại hàm bóc tách: Tập trung đúng các trường của THỂ LOẠI (Name & Description)
  extractCategoryData(payload) {
    const category = {
      name: payload.name,
      description: payload.description, // Sửa thành description thay vì address
    };

    // Remove undefined fields
    Object.keys(category).forEach(
      (key) => category[key] === undefined && delete category[key],
    );
    return category;
  }

  // Sửa lại hàm create bằng phương thức insertOne chuẩn chỉnh của MongoDB
  async create(payload) {
    const category = this.extractCategoryData(payload);

    // Sử dụng insertOne để thêm mới tinh một bản ghi, tránh lỗi logic của findOneAndUpdate
    const result = await this.category.insertOne(category);

    // Trả về dữ liệu kèm theo _id vừa được sinh ra tự động
    return {
      _id: result.insertedId,
      ...category,
    };
  }

  async find(filter) {
    const cursor = await this.category.find(filter);
    return await cursor.toArray();
  }

  async findByName(name) {
    return await this.find({
      name: { $regex: new RegExp(name), $options: "i" },
    });
  }

  async findById(id) {
    return await this.category.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    // Gọi đúng tên hàm extract dữ liệu mới cập nhật
    const update = this.extractCategoryData(payload);

    const result = await this.category.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" },
    );
    return result;
  }

  async delete(id) {
    const result = await this.category.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  async deleteAll() {
    const result = await this.category.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = CategoryService;
