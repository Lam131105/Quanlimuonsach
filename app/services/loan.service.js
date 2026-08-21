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
      status: payload.status,
      pickupDeadline: payload.pickupDeadline || null,

      // 🎯 SỬA LẠI ĐOẠN NÀY ĐỂ AN TOÀN KHI UPDATE/APPROVE:
      // Nếu có truyền quantity lên thì mới ép kiểu Number, nếu không truyền thì để undefined
      // (Sau đó vòng lặp Object.keys bên dưới sẽ tự xóa trường này đi, không làm đè số 1 vào DB nữa)
      quantity:
        payload.quantity !== undefined && payload.quantity !== null
          ? Number(payload.quantity)
          : undefined,
    };

    // Vòng lặp này sẽ xóa sạch trường quantity: undefined đi khi duyệt sách!
    Object.keys(loan).forEach(
      (key) => loan[key] === undefined && delete loan[key],
    );
    return loan;
  }

  // 2. Tạo mới một lượt mượn sách (Tự động cấp mã loanid tăng dần)
  async create(payload) {
    const nextLoanId = await getNextSequenceValue(this.db, "loanid");
    const loan = this.extractLoanData(payload);

    // 1. Gán mã phiếu mượn tự động dạng chuỗi
    loan.loanid = `${String(nextLoanId).padStart(3, "0")}`;

    // 2. Thêm trường số lượng mượn
    loan.quantity = payload.quantity ? Number(payload.quantity) : 1;
    loan.returnDate = loan.returnDate || null;

    // 3. Logic thời gian
    if (loan.status === "Borrowed" && !loan.dueDate) {
      const today = new Date();
      if (!loan.borrowDate) {
        loan.borrowDate = today.toISOString().split("T")[0];
      }
      today.setDate(today.getDate() + 14);
      loan.dueDate = today.toISOString().split("T")[0];
    } else {
      const today = new Date();
      today.setDate(today.getDate() + 3);
      loan.pickupDeadline = today.toISOString().split("T")[0];
      loan.borrowDate = loan.borrowDate || null;
      loan.dueDate = loan.dueDate || null;
    }

    // 🚨 4. ĐOẠN PHẢI BỔ SUNG: TRỪ SỐ LƯỢNG SÁCH TRONG KHO
    // Tìm đến collection 'books' dựa vào loan.bookid để trừ số lượng
    const bookCollection = this.db.collection("books");

    // Chuyển đổi bookid sang ObjectId nếu database của bạn lưu _id dạng ObjectId
    const bookFilter = {
      _id: ObjectId.isValid(loan.bookid)
        ? new ObjectId(loan.bookid)
        : loan.bookid,
    };

    // Tiến hành cập nhật kho: trừ đi đúng số lượng độc giả chọn mượn (-loan.quantity)
    await bookCollection.updateOne(bookFilter, {
      $inc: { quantity: -loan.quantity },
    });

    // 5. Tiến hành lưu phiếu mượn vào database như cũ
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
    const result = await this.find({});
    return result.reverse(); // Đảo ngược mảng bằng JS thuần
  }

  // 5. Tìm chi tiết một phiếu mượn theo ID (_id hệ thống)
  async findById(id) {
    return await this.loan.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  // 6. Cập nhật thông tin phiếu mượn (Dùng chung cho cả sửa thông tin, approve và return)
  // 6. Cập nhật thông tin phiếu mượn (Tự động hoàn kho khi chuyển sang Cancelled)
  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };

    // 1. Lấy thông tin phiếu mượn hiện tại (trước khi update) từ DB ra để đối soát
    const currentLoan = await this.loan.findOne(filter);

    // 2. Kiểm tra xem có kích hoạt điều kiện hoàn kho hay không
    // Điều kiện: Phiếu mượn tồn tại, trạng thái cũ KHÔNG PHẢI Cancelled, nhưng trạng thái mới truyền lên LÀ Cancelled
    if (
      currentLoan &&
      currentLoan.status !== "Cancelled" &&
      payload.status === "Cancelled"
    ) {
      const bookCollection = this.db.collection("books");

      // Định dạng chính xác bookid (hỗ trợ cả ObjectId lẫn String dài theo thói quen hệ thống của bạn)
      const bookFilter = {
        _id: ObjectId.isValid(currentLoan.bookid)
          ? new ObjectId(currentLoan.bookid)
          : currentLoan.bookid,
      };

      // Thực hiện cộng trả lại số lượng sách vào kho
      await bookCollection.updateOne(bookFilter, {
        $inc: { quantity: parseInt(currentLoan.quantity) },
      });

      console.log(
        `[Hệ thống] Đã tự động hoàn trả ${currentLoan.quantity} cuốn sách về kho do hủy phiếu mượn ${id}`,
      );
    }

    // 3. Trích xuất dữ liệu mới và tiến hành cập nhật phiếu mượn bình thường
    const updateData = this.extractLoanData(payload);

    const result = await this.loan.findOneAndUpdate(
      filter,
      { $set: updateData },
      { returnDocument: "after" }, // Trả về tài liệu mới nhất sau khi sửa thành công
    );

    return result;
  }

  // 7. Xóa một phiếu mượn (Chỉ dùng khi nhập liệu sai)
  // Minh họa hàm delete trong loan.service.js (Backend)
  async delete(id) {
    const loanId = ObjectId.isValid(id) ? new ObjectId(id) : null;

    // 1. Lấy thông tin phiếu mượn sắp xóa ra trước để biết bookid và quantity
    const loanDoc = await this.loan.findOne({ _id: loanId });

    if (loanDoc) {
      if (loanDoc.status !== "Cancelled" && loanDoc.status !== "Returned") {
        // 2. Cộng trả lại số lượng sách vào kho
        const bookCollection = this.db.collection("books");
        await bookCollection.updateOne(
          {
            _id: ObjectId.isValid(loanDoc.bookid)
              ? new ObjectId(loanDoc.bookid)
              : loanDoc.bookid,
          },
          { $inc: { quantity: loanDoc.quantity } }, // Cộng lại kho số lượng sách đã mượn
        );
      }
    }

    // 3. Tiến hành xóa phiếu mượn
    const result = await this.loan.findOneAndDelete({ _id: loanId });
    return result;
  }

  // 🎯 SỬA LẠI HÀM TRONG SERVICE
  async processReturnBook(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };

    const todayStr = new Date(new Date().getTime() + 7 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const returnUpdateData = {
      status: "Returned",
      returnDate: todayStr,

      // 🔴 Object con bây giờ chỉ còn giữ lại đúng 3 thông tin cốt lõi nhất
      returnDetail: {
        staffid_return: payload.staffid_return,
        quantity_returned: Number(payload.quantity_returned),
        fine_amount: Number(payload.fine_amount) || 0,
      },
    };

    // Cập nhật bảng loans
    const result = await this.loan.findOneAndUpdate(
      filter,
      { $set: returnUpdateData },
      { returnDocument: "after" },
    );

    // Cộng trả vào kho sách (bảng books)
    const actualQtyReturned = Number(payload.quantity_returned);
    if (actualQtyReturned > 0 && payload.bookid) {
      const bookCollection = this.db.collection("books");
      await bookCollection.updateOne(
        {
          _id: ObjectId.isValid(payload.bookid)
            ? new ObjectId(payload.bookid)
            : payload.bookid,
        },
        { $inc: { quantity: actualQtyReturned } },
      );
    }

    return result;
  }
}

module.exports = LoanService;
