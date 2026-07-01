const { ObjectId } = require("mongodb");

class LoanService {
  constructor(client) {
    this.loan = client.db().collection("loans");
  }

  // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
  extractConactData(payload) {
    const loan = {
      borrowerName: payload.borrowerName,
      bookTitle: payload.bookTitle,
      loanDate: payload.loanDate,
      phone: payload.phone,
      isReturned: payload.isReturned === true || payload.isReturned === "true",
    };

    // Remove undefined fields
    Object.keys(loan).forEach(
      (key) => loan[key] === undefined && delete loan[key],
    );
    return loan;
  }

  async create(payload) {
    const loan = this.extractConactData(payload);
    const result = await this.loan.findOneAndUpdate(
      loan,
      { $set: { isReturned: loan.isReturned || false } }, // ✅ Đã sửa trường favorite thành isReturned
      { returnDocument: "after", upsert: true },
    );
    return result;
  }

  async find(filter) {
    const cursor = await this.loan.find(filter);
    return await cursor.toArray();
  }

  async findByName(name) {
    return await this.find({
      borrowerName: { $regex: new RegExp(name), $options: "i" },
    });
  }

  async findById(id) {
    return await this.loan.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = this.extractConactData(payload);
    const result = await this.loan.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" },
    );
    return result;
  }

  async delete(id) {
    const result = await this.loan.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  async findisReturned() {
    return await this.find({ isReturned: true });
  }

  async deleteAll() {
    const result = await this.loan.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = LoanService;
