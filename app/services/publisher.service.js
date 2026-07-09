const { ObjectId } = require("mongodb");
const { getNextSequenceValue } = require("../utils/sequence.util");
class PublisherService {
  constructor(client) {
    this.publisher = client.db().collection("publishers");
    this.db = client.db();
  }

  // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
  extractConactData(payload) {
    const publisher = {
      name: payload.name,
      address: payload.address,
    };

    // Remove undefined fields
    Object.keys(publisher).forEach(
      (key) => publisher[key] === undefined && delete publisher[key],
    );
    return publisher;
  }

  async create(payload) {
    const nextpublisherid = await getNextSequenceValue(this.db, "publisherid");
    const publisher = this.extractConactData(payload);
    publisher.publisherid = nextpublisherid;
    const result = await this.publisher.insertOne(publisher);
    return {
      _id: result.insertedId,
      ...publisher,
    };
  }

  async find(filter) {
    const cursor = await this.publisher.find(filter);
    return await cursor.toArray();
  }

  async findByName(name) {
    return await this.find({
      name: { $regex: new RegExp(name), $options: "i" },
    });
  }

  async findById(id) {
    return await this.publisher.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = this.extractConactData(payload);
    const result = await this.publisher.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" },
    );
    return result;
  }

  async delete(id) {
    const result = await this.publisher.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  async deleteAll() {
    const result = await this.publisher.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = PublisherService;
