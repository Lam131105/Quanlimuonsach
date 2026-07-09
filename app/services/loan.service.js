const { ObjectId } = require("mongodb");
const { getNextSequenceValue } = require("../utils/sequence.util");

class LoanService {
  constructor(client) {
    this.loan = client.db().collection("theodoimuonsach");
    this.db = client.db();
  }

  // Hàm trích xuất và chuẩn hóa dữ liệu theo đúng lược đồ đề bài
  extractLoanData(payload) {
    const loan = {
      readerid: payload.readerid ? new ObjectId(payload.readerid) : undefined, // Nối sang bảng DOCGIA
      bookid: payload.bookid ? new ObjectId(payload.bookid) : undefined, // Nối sang bảng SACH
      staffid: payload.staffid ? new ObjectId(payload.staffid) : undefined, // Nối sang bảng NhanVien
      borrowDate: payload.borrowDate
        ? new Date(payload.borrowDate)
        : new Date(), // NGAYMUON
      returnDate: payload.returnDate ? new Date(payload.returnDate) : null, // NGAYTRA (null nếu chưa trả)
      isReturned: payload.isReturned || false, // Trạng thái hỗ trợ kiểm tra nhanh ở giao diện
    };

    // Xóa các trường undefined
    Object.keys(loan).forEach(
      (key) => loan[key] === undefined && delete loan[key],
    );
    return loan;
  }

  // [HÀM CHÍNH 1]: Thực hiện mượn sách
  async create(payload) {
    // Lấy mã số mượn trả tự động tăng tiếp theo (Ví dụ: M001)
    const nextLoanid = await getNextSequenceValue(this.db, "loanid");

    const loan = this.extractLoanData(payload);
    loan.loanid = nextLoanid;

    const result = await this.loan.insertOne(loan);
    return {
      _id: result.insertedid,
      ...loan,
    };
  }

  // [HÀM CHÍNH 2]: Lấy danh sách lịch sử mượn sách (Dùng Aggregate để "Dò tên" Độc giả & Sách)
  async findAll() {
    // Kỹ thuật gộp bảng nâng cao của MongoDB giống hệt lệnh JOIN bên SQL thầy cô dạy
    const cursor = await this.loan.aggregate([
      {
        $lookup: {
          from: "books", // Tên bảng sách của bạn trong DB
          localField: "bookid",
          foreignField: "_id",
          as: "bookInfo",
        },
      },
      {
        $lookup: {
          from: "readers", // Tên bảng độc giả của bạn trong DB
          localField: "readerid",
          foreignField: "_id",
          as: "readerInfo",
        },
      },
      {
        $unwind: { path: "$bookInfo", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$readerInfo", preserveNullAndEmptyArrays: true },
      },
    ]);
    return await cursor.toArray();
  }

  // [HÀM CHÍNH 3]: Cập nhật thông tin (Dùng để xử lý khi Độc giả đem sách đi TRẢ)
  async update(id, payload) {
    const filter = { _id: new ObjectId(id) };

    // Nếu Frontend báo trả sách, tự động đắp ngày hiện tại làm ngày trả (NGAYTRA)
    const updateData = {
      isReturned: payload.isReturned,
      returnDate: payload.isReturned ? new Date() : null,
    };

    const result = await this.loan.findOneAndUpdate(
      filter,
      { $set: updateData },
      { returnDocument: "after" },
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

  async findByid(id) {
    return await this.loan.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async delete(id) {
    const result = await this.loan.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  async deleteAll() {
    const result = await this.loan.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = LoanService;
