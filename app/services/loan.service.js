const { ObjectId } = require("mongodb");
const { getNextSequenceValue } = require("../utils/sequence.util");

class LoanService {
  constructor(client) {
    this.loan = client.db().collection("loans");
    this.db = client.db();
  }

  // 1. Hàm lọc và chuẩn hóa dữ liệu đầu vào từ req.body
  extractLoanData(payload) {
    const loan = {
      readerid: payload.readerid,
      bookid: payload.bookid,
      staffid: payload.staffid,
      borrowDate: payload.borrowDate,
      dueDate: payload.dueDate,
      returnDate: payload.returnDate,
      isReturned: payload.isReturned,
      status: payload.status,
    };

    // Loại bỏ các trường có giá trị undefined để tránh ghi đè dữ liệu rác vào MongoDB
    Object.keys(loan).forEach(
      (key) => loan[key] === undefined && delete loan[key],
    );
    return loan;
  }

  // 2. Tạo mới một lượt mượn sách (Tự động cấp mã loanid tăng dần)
  async create(payload) {
    const nextLoanId = await getNextSequenceValue(this.db, "loanid");
    const loan = this.extractLoanData(payload);

    // Gán mã phiếu mượn tự động dạng chuỗi hoặc số (Ví dụ gộp chuỗi: "PM" + số)
    loan.loanid = `PM${String(nextLoanId).padStart(3, "0")}`; // Kết quả dạng: PM001, PM002...

    // Tính toán hạn trả mặc định (dueDate) nếu chưa truyền lên (ví dụ cho mượn tối đa 14 ngày)
    if (!loan.dueDate) {
      const today = new Date();
      today.setDate(today.getDate() + 14); // Cộng thêm 14 ngày kể từ hôm nay
      loan.dueDate = today.toISOString().split("T")[0];
    }

    const result = await this.loan.insertOne(loan);
    return {
      _id: result.insertedId,
      ...loan,
    };
  }

  // 3. Hàm tìm kiếm tổng quát bằng bộ lọc filter (Hỗ trợ findAll, findByReader, findOverdue)
  async find(filter) {
    const cursor = await this.loan.find(filter);
    return await cursor.toArray();
  }

  // 4. Lấy toàn bộ danh sách phiếu mượn trong hệ thống
  async findAll() {
    return await this.find({});
  }

  // 5. Tìm chi tiết một phiếu mượn theo ID (_id hệ thống)
  async findById(id) {
    return await this.loan.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  // 6. Cập nhật thông tin phiếu mượn (Dùng chung cho cả sửa thông tin, approve và return)
  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = this.extractLoanData(payload);

    const result = await this.loan.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }, // Trả về tài liệu mới nhất sau khi update thành công
    );
    return result;
  }

  // 7. Xóa một phiếu mượn (Chỉ dùng khi nhập liệu sai)
  async delete(id) {
    const result = await this.loan.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }
}

module.exports = LoanService;
