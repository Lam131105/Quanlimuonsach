const app = require("./app");
const config = require("./app/config");
const MongoDB = require("./app/utils/mongodb.util");
const cron = require("node-cron");
const loanController = require("./app/controllers/loan.controller");

async function startServer() {
  try {
    // 1. Kết nối Database trước
    await MongoDB.connect(config.db.uri);
    console.log("Connected to the database!");

    // 2. 🤖 Robot tự động bảo trì & quét trạng thái phiếu mượn (Cron Job)
    // Mặc định chạy vào 00:00 mỗi đêm '0 0 * * *'.  Mẹo test nhanh: Bạn có thể đổi thành '*/5 * * * * *' (5 giây một lần)
    cron.schedule("*/5 * * * * *", async () => {
   // cron.schedule("0 0 * * *", async () => {
      console.log(
        "🤖 Cron Job: Bắt đầu quét kiểm tra phiếu quá hạn lấy (Pending) và phiếu trễ hẹn trả (Borrowed)...",
      );

      // Giả lập req, res, next để gọi trực tiếp từ Controller
      const mockReq = {};
      const mockRes = {
        send: (result) =>
          console.log(`👉 Kết quả bảo trì: ${JSON.stringify(result)}`),
      };
      const mockNext = (err) =>
        console.error("❌ Lỗi hệ thống quét tự động:", err.message);

      // 🔥 Đổi thành hàm tổng hợp xử lý cả 2 tác vụ
      if (typeof loanController.autoCheckLoanStatuses === "function") {
        await loanController.autoCheckLoanStatuses(mockReq, mockRes, mockNext);
      } else {
        console.warn(
          "⚠️ Hàm autoCheckLoanStatuses chưa được định nghĩa trong controller.",
        );
      }
    });

    // 3. Khởi chạy Server lắng nghe cổng kết nối
    const PORT = config.app.port;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Cannot connect to the database!", error);
    process.exit();
  }
}

startServer();
