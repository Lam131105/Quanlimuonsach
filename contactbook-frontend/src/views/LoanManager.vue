<template>
  <div class="loan-management-container">
    <!-- Header & Thống kê nhanh -->
    <header class="page-header">
      <h2>📚 Quản Lý Mượn - Trả Sách</h2>
      <button class="btn btn-primary" @click="goToAddLoan">
        ➕ Lập Phiếu Mượn Tại Quầy
      </button>
    </header>

    <!-- Thêm class row và giới hạn cột col-md-5 (chiếm khoảng 40% chiều rộng) -->
    <div class="search-box-container row mb-3">
      <div class="col-12 col-md-6 col-lg-5">
        <div class="input-group">
          <div class="input-group-prepend">
            <span class="input-group-text">🔍 Tìm kiếm</span>
          </div>
          <input
            type="text"
            v-model="searchQuery"
            class="form-control"
            placeholder="Nhập Mã độc giả, Mã sách..."
          />
        </div>
      </div>
    </div>

    <!-- 1. Thanh bộ lọc trạng thái (Tabs Filter) -->
    <div class="filter-tabs">
      <button
        :class="{ active: currentTab === 'all' }"
        @click="switchTab('all')"
      >
        Tất cả
      </button>
      <button
        :class="{ active: currentTab === 'Pending' }"
        @click="switchTab('Pending')"
      >
        ⌛ Chờ nhận(Online)
      </button>
      <button
        :class="{ active: currentTab === 'Borrowed' }"
        @click="switchTab('Borrowed')"
      >
        📖 Đang Mượn
      </button>
      <button
        :class="{ active: currentTab === 'Overdue' }"
        @click="switchTab('Overdue')"
      >
        🚨 Quá Hạn
      </button>
      <button
        :class="{ active: currentTab === 'Returned' }"
        @click="switchTab('Returned')"
      >
        ✅ Đã Trả
      </button>
      <button
        :class="{ active: currentTab === 'Cancelled' }"
        @click="switchTab('Cancelled')"
      >
        ❌ Đã Hủy
      </button>
    </div>

    <!-- 2. Bảng dữ liệu chính -->
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Mã Phiếu</th>
            <th>Mã Độc Giả</th>
            <th>Mã Sách</th>
            <th>Mã Nhân viên</th>
            <th>SL</th>
            <th>Trạng Thái</th>
            <th>Mốc Thời Gian</th>
            <th>Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="loan in filteredLoans" :key="loan._id">
            <!-- 1. Mã phiếu mượn tự sinh từ Backend (PM001, PM002...) -->
            <td>
              <strong>{{ loan.loanid }}</strong>
            </td>

            <!-- 2. Map lấy mã Độc giả (readerid ví dụ: DG001) và hiển thị thêm cả tên nếu muốn -->
            <td>
              <div class="font-weight-bold">
                {{
                  readers.find((r) => r._id === loan.readerid)?.readerid ||
                  "..."
                }}
              </div>
              <small class="text-muted">
                <!-- 🎯 Tìm độc giả và nối Họ + Tên -->
                <template v-if="readers.find((r) => r._id === loan.readerid)">
                  {{ readers.find((r) => r._id === loan.readerid).lastName }}
                  {{ readers.find((r) => r._id === loan.readerid).firstName }}
                </template>
                <template v-else>Đang tải...</template>
              </small>
            </td>

            <!-- 3. Map lấy mã Sách đẹp (bookid ví dụ: B001, B002) hiển thị từ hình của bạn -->
            <td>
              <span class="badge badge-secondary px-2 py-1">
                {{ books.find((b) => b._id === loan.bookid)?.bookid || "..." }}
              </span>
              <div
                class="small text-truncate"
                style="max-width: 180px"
                :title="books.find((b) => b._id === loan.bookid)?.name"
              >
                {{
                  books.find((b) => b._id === loan.bookid)?.name ||
                  "Đang tải..."
                }}
              </div>
            </td>

            <!-- 4. Map lấy mã Nhân viên phê duyệt (staffid ví dụ: NV001) -->
            <td>
              <span v-if="loan.staffid">
                <div class="font-weight-bold">
                  {{
                    staffs.find((s) => s._id === loan.staffid)?.staffid || "..."
                  }}
                </div>
                <small class="text-muted">
                  <!-- 🎯 Tìm độc giả và nối Họ + Tên -->
                  <template v-if="staffs.find((s) => s._id === loan.staffid)">
                    {{ staffs.find((s) => s._id === loan.staffid).lastName }}
                    {{ staffs.find((s) => s._id === loan.staffid).firstName }}
                  </template>
                  <template v-else>Đang tải...</template>
                </small>
              </span>
              <span v-else class="text-muted small"
                ><i>Đặt Online (Chưa duyệt)</i></span
              >
            </td>
            <td>{{ loan.quantity }}</td>
            <td>
              <!-- Tag trạng thái có màu sắc phân biệt trực quan -->
              <span :class="['badge', `badge-${loan.status.toLowerCase()}`]">
                {{ getStatusText(loan.status) }}
              </span>
            </td>
            <td>
              <!-- Hiển thị mốc thời gian động theo luồng nghiệp vụ -->
              <div v-if="loan.status === 'Pending'" class="text-muted small">
                Hạn lấy:
                <span class="text-danger">{{ loan.pickupDeadline }}</span>
              </div>
              <div v-else class="small">
                Hạn trả: <strong>{{ loan.dueDate }}</strong> <br />
                <span class="text-muted" v-if="loan.borrowDate"
                  >Ngày mượn: {{ loan.borrowDate }}</span
                >
              </div>
            </td>
            <td>
              <!-- 3. Các nút thao tác động dựa theo trạng thái của phiếu -->
              <div class="action-buttons">
                <!-- Nếu đang chờ duyệt Online -> Hiện nút Duyệt giao sách -->
                <button
                  v-if="loan.status === 'Pending'"
                  class="btn-action btn-success"
                  @click="handleApprove(loan._id)"
                  title="Duyệt giao sách"
                >
                  ✓ Duyệt Giao
                </button>

                <!-- Nếu đang mượn hoặc quá hạn -> Hiện nút Trả sách -->
                <button
                  class="btn-action btn-warning"
                  @click="goToReturnForm(loan)"
                  title="Xác nhận trả sách"
                >
                  Chi tiết
                </button>

                <!-- Nút hủy/xóa phiếu nếu phát hiện lỗi nhập liệu -->
                <button
                  v-if="loan.status !== 'Returned'"
                  class="btn-action btn-danger"
                  @click="handleDelete(loan._id)"
                  title="Xóa phiếu lỗi"
                >
                  🗑️ Xóa
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredLoans.length === 0">
            <td colspan="7" class="text-center text-muted py-4">
              Không có phiếu mượn nào trong danh mục này.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
// Giả định bạn đã import Frontend LoanService để gọi API
import LoanService from "@/services/loan.service";
import BookService from "@/services/book.service"; // ➕ Gọi Service lấy thông tin Sách
import ReaderService from "@/services/reader.service"; // ➕ Gọi Service lấy thông tin Độc giả
import StaffService from "@/services/staff.service"; // ➕ Gọi Service lấy thông tin Nhân viên

export default {
  data() {
    return {
      loans: [],
      books: [], // ➕ Nơi lưu toàn bộ Sách
      readers: [], // ➕ Nơi lưu toàn bộ Độc giả
      staffs: [], // ➕ Nơi lưu toàn bộ Nhân viên
      currentTab: "all",
      searchQuery: "",
      currentStaffId: "",
    };
  },
  computed: {
    filteredLoans() {
      // 1. Bước đầu tiên: Lọc theo từ khóa tìm kiếm trước (nếu có nhập)
      let result = this.loans;

      if (this.searchQuery.trim() !== "") {
        const query = this.searchQuery.toLowerCase().trim();

        result = result.filter((loan) => {
          // Tìm thông tin độc giả (để lấy mã readerid đẹp dạng DG001)
          const readerObj = this.readers.find((r) => r._id === loan.readerid);
          const readerIdDisplay = readerObj
            ? readerObj.readerid.toLowerCase()
            : "";

          // Tìm thông tin sách (để lấy mã bookid đẹp dạng B001)
          const bookObj = this.books.find((b) => b._id === loan.bookid);
          const bookIdDisplay = bookObj ? bookObj.bookid.toLowerCase() : "";

          // Bạn có thể tìm thêm theo cả tên sách nếu muốn bằng cách thêm biến dưới đây:
          const bookNameDisplay = bookObj ? bookObj.name.toLowerCase() : "";

          // Trả về kết quả nếu khớp với Mã độc giả HOẶC Mã sách HOẶC Tên sách
          return (
            readerIdDisplay.includes(query) ||
            bookIdDisplay.includes(query) ||
            bookNameDisplay.includes(query)
          );
        });
      }

      // 2. Bước thứ hai: Lọc tiếp theo các Tab trạng thái (Pending, Borrowed, v.v.)
      if (this.currentTab === "all") {
        return result;
      }

      return result.filter((loan) => loan.status === this.currentTab);
    },
  },
  methods: {
    // ➕ Thêm hàm lấy ID nhân viên đang đăng nhập từ localStorage
    getStaffFromLocal() {
      const userLocal = localStorage.getItem("user");
      if (userLocal) {
        const staff = JSON.parse(userLocal);
        this.currentStaffId = staff._id; // Gán vào biến đơn dùng chung cho các hàm trong trang
      }
    },
    // 🎯 Hàm tải tất cả dữ liệu từ các Collection cùng một lúc
    async fetchAllData() {
      try {
        this.getStaffFromLocal();
        // Tải song song để tối ưu tốc độ load trang
        const [loansRes, booksRes, readersRes, staffsRes] = await Promise.all([
          LoanService.getAll(),
          BookService.getAll(),
          ReaderService.getAll(),
          StaffService.getAll(),
        ]);

        this.loans = loansRes;
        this.books = booksRes;
        this.readers = readersRes;
        this.staffs = staffsRes;
      } catch (error) {
        alert("Có lỗi xảy ra khi tải dữ liệu hệ thống!");
      }
    },

    goToAddLoan() {
      this.$router.push({ name: "loanadd" }); // Trỏ tới trang tạo form thêm sách mới
    },

    goToReturnForm(loan) {
      // 2. Đẩy sang trang trả sách và đính kèm luôn tất cả thông tin lên URL
      this.$router.push({
        name: "bookreturn",
        params: {
          loanid: loan._id, // 🌟 Truyền thêm ID phiếu để làm "chìa khóa" chính xác 100%
        },
      });
    },

    async fetchLoans() {
      try {
        this.loans = await LoanService.getAll();
      } catch (error) {
        console.log("Lỗi khi tải danh sách phiếu mượn:", error);
      }
    },

    switchTab(tabName) {
      this.currentTab = tabName;
    },
    getStatusText(status) {
      const statusMap = {
        Pending: "⌛ Chờ nhận",
        Borrowed: "📖 Đang mượn",
        Overdue: "🚨 Quá hạn",
        Returned: "✅ Đã trả",
        Cancelled: "❌ Đã hủy",
      };
      return statusMap[status] || status;
    },
    // Gọi API Duyệt phiếu mượn online
    async handleApprove(id) {
      if (confirm("Xác nhận duyệt giao sách cho độc giả này?")) {
        try {
          // Truyền kèm staffid của nhân viên đang trực máy lên như Backend yêu cầu
          await LoanService.approve(id, { staffid: this.currentStaffId });
          alert("Phê duyệt và kích hoạt thời hạn 14 ngày thành công!");
          this.fetchLoans(); // Tải lại bảng dữ liệu
        } catch (error) {
          console.error("Lỗi duyệt chi tiết:", error); // 🎯 Thêm dòng này
          console.log("Dữ liệu lỗi từ Backend:", error.response?.data); // 🎯 Và dòng này
          alert(
            error.response?.data?.message || "Lỗi khi phê duyệt phiếu mượn!",
          );
        }
      }
    },

    // Gọi API Trả sách
    async handleReturn(id) {
      if (confirm("Xác nhận độc giả đã trả đủ sách và hoàn tất phiếu mượn?")) {
        try {
          await LoanService.return(id);
          alert("Đã ghi nhận trả sách, số lượng đã được cộng trả lại kho!");
          this.fetchLoans();
        } catch (error) {
          alert("Lỗi khi xử lý trả sách!");
        }
      }
    },
    // Gọi API Xóa phiếu lỗi
    async handleDelete(id) {
      if (
        confirm(
          "Bạn có chắc chắn muốn xóa vĩnh viễn phiếu mượn này không ?",
        )
      ) {
        try {
          await LoanService.delete(id);
          alert("Xóa thành công!");
          this.fetchLoans();
        } catch (error) {
          alert("Không thể xóa phiếu mượn!");
        }
      }
    },
  },
  created() {
    this.fetchAllData();
  },
};
</script>

<style scoped>
/* CSS scannable gọn gàng cho giao diện Desktop */
.loan-management-container {
  padding: 24px;
  font-family: sans-serif;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 8px;
}
.filter-tabs button {
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 600;
  color: #64748b;
}
.filter-tabs button.active {
  color: #2563eb;
  border-bottom: 2px solid #2563eb;
  margin-bottom: -10px;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.data-table th,
.data-table td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
}
.data-table th {
  background-color: #f8fafc;
  color: #475569;
}
.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}
.badge-pending {
  background-color: #fef3c7;
  color: #d97706;
}
.badge-borrowed {
  background-color: #dbeafe;
  color: #2563eb;
}
.badge-overdue {
  background-color: #fee2e2;
  color: #dc2626;
}
.badge-returned {
  background-color: #dcfce7;
  color: #16a34a;
}
.action-buttons {
  display: flex;
  gap: 6px;
}
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: bold;
}
.btn-primary {
  background-color: #2563eb;
  color: white;
}
.btn-action {
  padding: 6px 10px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
}
.btn-success {
  background-color: #10b981;
  color: white;
}
.btn-warning {
  background-color: #f59e0b;
  color: white;
}
.btn-danger {
  background-color: #ef4444;
  color: white;
}
</style>
