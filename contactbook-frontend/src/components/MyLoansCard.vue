<template>
  <div class="loan-card card h-100 shadow-sm border-0">
    <!-- Hình ảnh bìa sách lấy từ src/assets/imgbook/ -->
    <div class="card-img-container text-center p-3 bg-light">
      <img
        :src="getImageUrl(bookImg)"
        class="book-cover-img img-fluid"
        alt="Bìa sách"
      />
    </div>

    <!-- Nội dung chi tiết phiếu mượn -->
    <div class="card-body d-flex flex-column">
      <!-- Mã sách & Trạng thái badge -->
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span class="badge badge-secondary px-2 py-1"
          >Code: {{ bookCode }}</span
        >
        <span :class="['badge', `badge-${loan.status.toLowerCase()}`]">
          {{ statusText }}
        </span>
      </div>

      <!-- Tên sách (Giới hạn tối đa 2 dòng cho đều ô lưới) -->
      <h5
        class="book-title font-weight-bold text-dark text-truncate-2"
        :title="bookTitle"
      >
        {{ bookTitle }}
      </h5>

      <!-- Số lượng mượn -->
      <p class="card-text mb-2 small text-muted">
        Số lượng: <strong class="text-dark">{{ loan.quantity }} cuốn</strong>
      </p>

      <!-- Mốc thời gian mượn/trả sách -->
      <div class="time-info p-2 rounded mb-3 bg-light mt-auto">
        <div v-if="loan.status === 'Pending'" class="small">
          Hạn đến lấy sách: <br />
          <span class="text-danger font-weight-bold">{{
            loan.pickupDeadline || "Chưa cập nhật"
          }}</span>
        </div>
        <div v-else class="small">
          Hạn trả:
          <strong class="text-danger">{{ formatDate(loan.dueDate) }}</strong>
          <br />
          <span class="text-muted" v-if="loan.borrowDate"
            >Ngày mượn: {{ formatDate(loan.borrowDate) }}</span
          >
        </div>
      </div>

      <!-- Các nút bấm thao tác bấm gửi sự kiện lên component cha -->
      <div class="action-buttons mt-2 d-flex gap-2 justify-content-between">
        <button
          v-if="loan.status === 'Pending'"
          class="btn btn-sm btn-outline-danger btn-block rounded-pill"
          @click="$emit('cancel-loan', loan._id)"
        >
          <i class="fas fa-times mr-1"></i> Hủy Yêu Cầu
        </button>
        <button
          v-if="loan.status === 'Borrowed'"
          class="btn btn-sm btn-outline-info btn-block rounded-pill"
        >
          Vui lòng trả sách trước hạn trả
        </button>
        <button
          v-if="loan.status === 'Overdue'"
          class="btn btn-sm btn-outline-danger btn-block rounded-pill"
        >
          Quý khách đã trễ hạn, vui lòng trả trước ngày:
          {{ maxOverdueDate }}
        </button>
        <button
          v-if="loan.status === 'Returned'"
          class="btn btn-sm btn-outline-success btn-block rounded-pill"
        >
          Quý khách đã trả sách vào ngày:
          {{ formatDate(loan.returnDate) }}
        </button>
                <button
          v-if="loan.status === 'Cancelled'"
          class="btn btn-sm btn-outline-warning btn-block rounded-pill"
        >
          Quý khách đã hủy yêu cầu mượn sách này
         
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MyLoansCard",
  props: {
    loan: { type: Object, required: true },
    books: { type: Array, required: true },
  },
  computed: {
    // Tìm kiếm cuốn sách tương ứng trong mảng danh mục sách truyền từ cha xuống
    currentBook() {
      return this.books.find((b) => b._id === this.loan.bookid) || {};
    },
    bookCode() {
      return this.currentBook.bookid || "Mã sách";
    },
    bookTitle() {
      return this.currentBook.name || "Đang tải tên sách...";
    },
    bookImg() {
      return this.currentBook.imgUrl || "default-book.png";
    },
    statusText() {
      const statusMap = {
        Pending: "⌛ Chờ nhận",
        Borrowed: "📖 Đang mượn",
        Overdue: "🚨 Quá hạn",
        Returned: "✅ Đã trả",
        Cancelled: "❌ Đã hủy",
      };
      return statusMap[this.loan.status] || this.loan.status;
    },

    maxOverdueDate() {
      if (!this.loan.dueDate) return "Chưa cập nhật";

      let date;
      // Kiểm tra xem chuỗi có dạng DD/MM/YYYY không (Ví dụ: 25/12/2026)
      if (this.loan.dueDate.includes("/")) {
        const parts = this.loan.dueDate.split("/");
        // Chuyển về dạng YYYY-MM-DD để đưa vào Object Date (Tháng trong JS chạy từ 0 - 11 nên cần -1)
        date = new Date(parts[2], parts[1] - 1, parts[0]);
      } else {
        // Nếu là dạng YYYY-MM-DD chuẩn quốc tế từ Database trả về
        date = new Date(this.loan.dueDate);
      }

      // Nếu ngày tháng không hợp lệ thì dừng lại
      if (isNaN(date.getTime())) return "Chưa cập nhật";

      // Cộng thêm 15 ngày vào mốc hạn trả ban đầu
      date.setDate(date.getDate() + 15);

      // Định dạng ngày hiển thị ra cho khách hàng dễ đọc: DD/MM/YYYY
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    },
  },
  methods: {
    getImageUrl(imageName) {
      // imagePath sẽ có dạng: /src/assets/imgbook/ten-anh.jpg
      const imagePath = `/src/assets/imgbook/${imageName}`;

      // Sử dụng cơ chế new URL của Vite để biên dịch đường dẫn thành URL hợp lệ
      // (Bắt buộc phải truyền đường dẫn cứng vào new URL, không dùng biến cộng chuỗi ở đây)
      // Vite sẽ tự động tìm ảnh theo cấu trúc tên bạn đặt
      try {
        // Chúng ta lợi dụng việc dynamic import để kiểm tra đường dẫn ảnh
        // (Đây là cách chuẩn của Vite dành cho dynamic assets)
        return new URL(imagePath, import.meta.url).href;
      } catch (error) {
        // Nếu không tìm thấy đường dẫn ảnh, trả về chuỗi rỗng
        return "";
      }
    },

    formatDate(dateString) {
      if (!dateString) return "Chưa cập nhật";

      // Nếu data đã có sẵn dấu "/" (đã là dạng DD/MM/YYYY rồi) thì trả về luôn, không cần tính toán
      if (dateString.includes("/")) return dateString;

      // Xử lý nếu data là dạng YYYY-MM-DD
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Nếu chuỗi lỗi không parse được thì trả về gốc

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    },
  },
};
</script>

<style scoped>
.loan-card {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  border-radius: 12px;
  overflow: hidden;
}
.loan-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12) !important;
}
.card-img-container {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.book-cover-img {
  max-height: 150px;
  object-fit: contain;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.8em;
  font-size: 1rem;
}
/* Đồng bộ màu sắc trạng thái */
.badge-pending {
  background-color: #ffc107;
  color: #fff;
}
.badge-borrowed {
  background-color: #17a2b8;
  color: #fff;
}
.badge-overdue {
  background-color: #dc3545;
  color: #fff;
}
.badge-returned {
  background-color: #28a745;
  color: #fff;
}
.badge-cancelled {
  background-color: #6c757d;
  color: #fff;
}
</style>
