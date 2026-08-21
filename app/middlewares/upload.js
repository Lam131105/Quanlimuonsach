const multer = require("multer");
const path = require("path");

// Cấu hình nơi lưu và tên file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "contactbook-frontend/src/assets/imgbook"); // Ảnh sẽ lưu vào thư mục này (Nhớ tạo thư mục 'uploads' ở gốc dự án)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Ví dụ: 171234567-ảnh.jpg
  },
});

const upload = multer({ storage: storage });
module.exports = upload;
