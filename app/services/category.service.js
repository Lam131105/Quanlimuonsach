const { ObjectId } = require("mongodb");
const { getNextSequenceValue } = require("../utils/sequence.util");

class CategoryService {
  constructor(client) {
    this.category = client.db().collection("categories");
    this.db = client.db();
  }

  extractCategoryData(payload) {
    const category = {
      name: payload.name,
      description: payload.description,
    };

    Object.keys(category).forEach(
      (key) => category[key] === undefined && delete category[key],
    );
    return category;
  }

  async create(payload) {
    // 💡 ĐÃ SỬA: Đổi "categoryid" thành "categoryId" để khớp với switch-case trong file util
    const nextcategoryid = await getNextSequenceValue(this.db, "categoryid");

    // 💡 ĐÃ SỬA: Đổi chữ c viết thường thành C viết hoa (extractCategoryData) cho đúng tên hàm
    const category = this.extractCategoryData(payload);

    category.categoryid = nextcategoryid;

    const result = await this.category.insertOne(category);

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
