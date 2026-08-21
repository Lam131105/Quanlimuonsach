<template>
  <div class="loan-management-container container py-4">
    <!-- Header tiêu đề -->
    <!-- Header tiêu đề -->
    <header class="page-header mb-4">
      <h2>📚 Lịch Sử Mượn Sách Cá Nhân</h2>
      <p class="text-muted small mb-3">
        Theo dõi trạng thái các cuốn sách bạn đã đăng ký mượn tại thư viện
      </p>

      <div
        class="alert shadow-sm border-0"
        :class="lateReturnCount > 0 ? 'alert-danger' : 'alert-info'"
        role="alert"
      >
        <h6 class="alert-heading mb-1 font-weight-bold">
          <i class="fas fa-exclamation-circle mr-1"></i> Tình trạng vi phạm:
          {{ lateReturnCount }} lần quá hạn tích lũy
        </h6>
        <p class="mb-0 small" style="line-height: 1.5">
          <strong>📌 Lưu ý:</strong> Vui lòng trả sách đúng hạn. Nếu trễ hạn quá
          <strong>15 ngày</strong>, hoặc trả sách trễ hẹn lớn hơn <strong>3 lần</strong> tài khoản của bạn sẽ bị khóa. <br />
          <em>*Cách giải quyết:</em> Khi bị khóa, bạn không thể mượn sách mới.
          Vui lòng mang sách đến quầy thủ thư để hoàn tất trả sách, nộp phạt
          (nếu có) và yêu cầu mở khóa tài khoản.
        </p>
      </div>
    </header>
    <!-- Thanh bộ lọc trạng thái (Tabs Filter) -->
    <div class="filter-tabs mb-4 d-flex flex-wrap gap-2">
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
        ⌛ Chờ Nhận
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

    <!-- Hiệu ứng loading quay tròn khi đang kéo data từ Backend -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="sr-only">Đang tải...</span>
      </div>
      <p class="text-muted mt-2">
        Dữ liệu đang được tải, vui lòng đợi trong giây lát...
      </p>
    </div>

    <!-- Truyền dữ liệu và đón nhận sự kiện từ Component List -->
    <MyLoansList
      v-else
      :loans="filteredLoans"
      :books="books"
      @cancel-loan="cancelLoanRequest"
    />
  </div>
</template>

<script>
import LoanService from "@/services/loan.service";
import BookService from "@/services/book.service";
import MyLoansList from "@/components/MyLoansList.vue";

export default {
  name: "MyLoans",
  components: {
    MyLoansList,
  },
  data() {
    return {
      loans: [],
      books: [],
      currentTab: "all",
      loading: false,
      currentReaderId: null,
    };
  },
  computed: {
    filteredLoans() {
      if (this.currentTab === "all") return this.loans;
      return this.loans.filter((loan) => loan.status === this.currentTab);
    },
  },
  methods: {
    getReaderFromLocal() {
      const userLocal = localStorage.getItem("user");
      if (userLocal) {
        const reader = JSON.parse(userLocal);
        this.currentReaderId = reader._id; // Gán vào biến đơn dùng chung cho các hàm trong trang
        this.lateReturnCount = reader.lateReturnCount;
      }
    },
    async cancelLoanRequest(loanId) {
      if (confirm("Bạn có chắc chắn muốn hủy yêu cầu mượn sách này không?")) {
        try {
          await LoanService.update(loanId, { status: "Cancelled" });
          alert("Đã hủy yêu cầu mượn sách thành công!");
          this.fetchMyPageData(); // Refresh lại dữ liệu trang
        } catch (error) {
          console.error("Lỗi khi hủy phiếu mượn:", error);
          alert("Không thể hủy yêu cầu vào lúc này.");
        }
      }
    },
    async fetchMyPageData() {
      const idToUse = this.currentReaderId;
       // this.$route.params.readerId || this.$route.params.readerid;
      if (!idToUse) return;

      this.loading = true;
      try {
        const [loansRes, booksRes] = await Promise.all([
          LoanService.findByReader(idToUse),
          BookService.getAll(),
        ]);

        this.loans = loansRes.data ? loansRes.data : loansRes;
        this.books = booksRes.data ? booksRes.data : booksRes;
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        this.loading = false;
      }
    },
    switchTab(tabName) {
      this.currentTab = tabName;
    },

  },
  created() {
    this.getReaderFromLocal();
    this.fetchMyPageData();
  },
};
</script>

<style scoped>
.filter-tabs button {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  background-color: #fff;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}
.filter-tabs button.active {
  background-color: #007bff;
  color: #fff;
  border-color: #007bff;
}
.gap-2 {
  gap: 8px;
}
</style>
