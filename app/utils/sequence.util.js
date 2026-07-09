const { ObjectId } = require("mongodb");

/**
 * Hàm dùng chung để lấy mã số tự động tăng cho mọi Collection
 * @param {Object} db - Đối tượng kết nối Database của MongoDB
 * @param {string} sequenceName - Tên danh mục cần tăng (ví dụ: 'bookId')
 */
async function getNextSequenceValue(db, sequenceName) {
  const countersCollection = db.collection("counters");

  const sequenceDocument = await countersCollection.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { sequence_value: 1 } },
    { upsert: true, returnDocument: "after" },
  );

  const currentNumber = sequenceDocument.sequence_value;
  const paddedNumber = String(currentNumber).padStart(3, "0");

  switch (sequenceName) {
    case "bookid":
      return `B${paddedNumber}`;
    case "categoryid":
      return `C${paddedNumber}`;
    case "publisherid":
      return `P${paddedNumber}`;
    case "staffid":
      return `S${paddedNumber}`;
    case "readerid":
      return `R${paddedNumber}`;
    case "loanid":
      return `L${paddedNumber}`;
    // default:
    //   return `${paddedNumber}`;
  }
}

module.exports = { getNextSequenceValue };
