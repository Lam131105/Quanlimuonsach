<template>
  <div class="card p-4 shadow border-0 rounded-lg bg-white">
    <div v-if="isLoading" class="text-center my-3 text-primary">
      <div class="spinner-border spinner-border-sm mr-2" role="status"></div>
      <span>Đang tải thông tin chi tiết phiếu mượn...</span>
    </div>

    <form @submit.prevent="submitForm" v-show="!isLoading">
      <div class="row">
        <div class="col-md-6 form-group mb-3">
          <label class="font-weight-bold text-dark">
            <i class="fas fa-user-shield mr-1"></i> Nhân viên đã nhận trả
            sách</label
          >
          <input
            type="text"
            v-model="displayStaffInfo"
            class="form-control bg-light font-weight-bold"
            :class="isViewMode ? 'text-primary' : 'text-success'"
            readonly
            required
          />
        </div>

        <div class="col-md-6 form-group mb-3">
          <label class="font-weight-bold text-dark"
            ><i class="fas fa-book mr-1"></i> Nhân viên duyệt mượn:</label
          >
          <input
            type="text"
            :value="`[${matchedData.staffApproveId}] - ${matchedData.staffApproveName}`"
            class="form-control bg-light text-uppercase font-weight-bold text-primary"
            readonly
            required
          />
        </div>
      </div>

      <!-- 2. Ô mã Độc giả và Mã Sách (Khóa cứng readonly để hiển thị) -->
      <!-- Cũ: v-model="shortCodes.readerid" -->
      <!-- Mới: Dùng :value và giữ nguyên thuộc tính readonly -->
      <div class="row">
        <div class="col-md-6 form-group mb-3">
          <label class="font-weight-bold text-dark"
            ><i class="fas fa-id-card mr-1"></i> Mã Độc giả:</label
          >
          <input
            type="text"
            :value="`[${matchedData.readerIdShort}] - ${matchedData.readerName}`"
            class="form-control bg-light text-uppercase font-weight-bold"
            readonly
            required
          />
        </div>

        <div class="col-md-6 form-group mb-3">
          <label class="font-weight-bold text-dark"
            ><i class="fas fa-book mr-1"></i> Mã Sách:</label
          >
          <input
            type="text"
            :value="`[${matchedData.bookId}] - ${matchedData.bookTitle}`"
            class="form-control bg-light text-uppercase font-weight-bold"
            readonly
            required
          />
        </div>
      </div>

      <!-- 3. Khu vực hiện thông tin chi tiết phiếu mượn khớp được -->
      <div
        class="bg-light p-3 rounded mb-4 border-left"
        :class="isViewMode ? 'border-primary' : 'border-success'"
      >
        <h5 class="mb-3" :class="isViewMode ? 'text-primary' : 'text-success'">
          <i class="fas fa-info-circle mr-1"></i>
          Thông Tin Chi Tiết Lượt Mượn
          {{ isViewMode ? "(Đã Hoàn Thành)" : "(Đang Hoạt Động)" }}
        </h5>

        <div class="row">
          <div class="col-md-6 mb-2">
            <strong>Trạng thái:</strong>
            <span class="text-primary font-weight-bold">{{
              statusText
            }}</span>
          </div>
          <div class="col-md-6 mb-2">
            <strong>Ngày mượn:</strong> {{ matchedData.borrowDate }}
          </div>
          <div class="col-md-6 mb-2">
            <strong>Hạn phải trả:</strong> {{ matchedData.dueDate }}
          </div>
          <div class="col-md-6 mb-2" v-if="isViewMode">
            <strong>Ngày trả thực tế:</strong>
            <span class="text-primary font-weight-bold">{{
              matchedData.returnDate
            }}</span>
          </div>
          <div class="col-md-6 mb-2">
            <strong>Số lượng mượn ban đầu:</strong>
            <span class="badge badge-secondary px-2 py-1"
              >{{ matchedData.loanQuantity }} cuốn</span
            >
          </div>
          <div class="col-md-6 mb-2">
            <strong>Trạng thái thời gian:</strong>
            <span
              v-if="(returnAnalytics.isLate && matchedData.status == 'Overdue') || (returnAnalytics.isLate && matchedData.status == 'Returned')"
              class="text-danger font-weight-bold ml-1"
              >🚨 Trễ {{ returnAnalytics.daysLate }} ngày</span
            >
            
            <span v-else class="text-success font-weight-bold ml-1"
              >✅ Đúng hạn</span
            >
          </div>
        </div>
      </div>

      <!-- 4. Nhập số lượng thực trả (Thêm thuộc tính :readonly="isViewMode") -->
      <div class="form-group mb-3">
        <label class="font-weight-bold text-dark"
          ><i class="fas fa-layer-group mr-1"></i> Số lượng thực tế mang
          trả:</label
        >
        <input
          type="number"
          v-model.number="shortCodes.quantity_returned"
          class="form-control font-weight-bold"
          :class="
            isViewMode
              ? 'bg-light text-primary border-primary'
              : 'border-success text-success'
          "
          min="0"
          :max="matchedData.loanQuantity"
          :readonly="isViewMode"
          required
        />
      </div>

      <!-- 5. Tiền phạt hiển thị tự động -->
      <div class="form-group mb-4">
        <label class="font-weight-bold text-danger"
          ><i class="fas fa-money-bill-wave mr-1"></i> Tiền phạt
          {{ isViewMode ? "đã thu:" : "dự kiến:" }}</label
        >
        <input
          type="text"
          :value="formatVND(returnAnalytics.calculatedFine)"
          class="form-control bg-light text-danger font-weight-bold"
          readonly
        />
      </div>

      <hr class="my-4" />

      <!-- Nút bấm hành động -->
      <div class="d-flex justify-content-between align-items-center">
        <button
          type="button"
          class="btn btn-outline-secondary px-4"
          @click="$emit('cancel')"
        >
          <i class="fas fa-arrow-left mr-1"></i> Quay lại
        </button>

        <!-- 🔥 ẨN HOÀN TOÀN NÚT SUBMIT NẾU ĐANG Ở CHẾ ĐỘ XEM CHI TIẾT (v-if="!isViewMode") -->
        <button
          v-if="!isViewMode"
          type="submit"
          class="btn btn-success px-4 font-weight-bold shadow-sm"
        >
          <i class="fas fa-check mr-1"></i> {{ submitButtonText }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import BookService from "@/services/book.service";
import ReaderService from "@/services/reader.service";
import LoanService from "@/services/loan.service";
import StaffService from "@/services/staff.service";

export default {
  name: "ReturnForm",
  props: {
    submitButtonText: { type: String, default: "Xác Nhận Trả Sách" },
  },
  emits: ["submit:return", "cancel"],
  data() {
    return {
      isLoading: false,
      isViewMode: false,
      displayStaffInfo: "",

      matchedData: {
        loanId: "",
        readerIdShort: "", // ➕ Thêm vào đây để lưu mã độc giả ngắn (VD: DG001)
        readerName: "",
        bookId: "", // ➕ Thêm vào đây để lưu mã sách ngắn (VD: MS012)
        bookTitle: "",
        borrowDate: "",
        dueDate: "",
        returnDate: "",
        loanQuantity: 0,
        bookIdLong: "", // Đây là ID dài của MongoDB (_id) phục vụ Backend
        bookPrice: 0,
        staffApproveName: "",
        staffApproveId: "",
        fine_amount: 0,
        status: "",
      },

      shortCodes: {
        staffid_return: "",
        quantity_returned: 1, // 🌟 Giờ chỉ còn đúng 2 trường thực sự thay đổi lúc trả
      },
    };
  },

  computed: {      statusText() {
      const statusMap = {
        Pending: "⌛ Chờ nhận",
        Borrowed: "📖 Đang mượn",
        Overdue: "🚨 Quá hạn",
        Returned: "✅ Đã trả",
        Cancelled: "❌ Đã hủy",
      };
     return statusMap[this.matchedData.status] || this.matchedData.status;
    },
    
    returnAnalytics() {
      // Logic tính toán cho phiếu mượn đang hoạt động (Giữ nguyên như cũ)
      const todayStr = new Date(new Date().getTime() + 7 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      const dueDate = new Date(this.matchedData.dueDate);
      const today = new Date(todayStr);

      const isLate = today > dueDate;
      const daysLate = isLate
        ? Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 3600 * 24))
        : 0;

      const missingQty =
        this.matchedData.loanQuantity - this.shortCodes.quantity_returned;
      const bookPrice = this.matchedData.bookPrice
        ? Number(this.matchedData.bookPrice)
        : 50000;
      const missingFine = missingQty > 0 ? missingQty * bookPrice : 0;

      return { isLate, daysLate, calculatedFine: missingFine };
    },
  },
  methods: {
    // Lấy thông tin nhân viên đang trực máy từ localStorage (chỉ dùng khi làm form trả sách mới)
    getStaffFromLocal() {
      const userLocal = localStorage.getItem("user");
      if (userLocal) {
        const staff = JSON.parse(userLocal);
        this.shortCodes.staffid_return = staff._id;
        this.displayStaffInfo = `[${staff.staffid}] - ${staff.lastName} ${staff.firstName}`;
      }
    },

    async loadLoanDetails() {
      // 1. Chỉ bóc tách duy nhất loanid từ URL sang
      const { loanid } = this.$route.params;
      if (!loanid) return;

      this.isLoading = true;
      try {
        // 2. Tải song song tất cả danh sách từ Backend về trước
        const [allBooks, allReaders, allLoans, allStaffs] = await Promise.all([
          BookService.getAll(),
          ReaderService.getAll(),
          LoanService.getAll(),
          StaffService.getAll(),
        ]);

        // 3. Tìm phiếu mượn hiện tại bằng loanid duy nhất
        const currentLoan = allLoans.find((l) => l._id === loanid);
        if (!currentLoan) {
          console.error("Không tìm thấy phiếu mượn tương ứng với ID này");
          return;
        }

        // 4. Tìm các thông tin liên quan dựa vào ID nằm NGAY TRONG currentLoan
        const currentBook = allBooks.find((b) => b._id === currentLoan.bookid);
        const currentReader = allReaders.find(
          (r) => r._id === currentLoan.readerid,
        );
        const currentStaffApprove = allStaffs.find(
          (s) => s._id === currentLoan.staffid,
        );

        // 5. Kiểm tra xem phiếu này đã hoàn thành việc trả sách chưa (Giữ nguyên logic cũ)
        if (
          currentLoan.status === "Returned" ||
          currentLoan.status === "Pending" ||
          currentLoan.status === "Canceled"
        ) {
          this.isViewMode = true;
          const historyStaffReturn = allStaffs.find(
            (s) => s._id === currentLoan.returnDetail?.staffid_return,
          );

          if (historyStaffReturn) {
            this.displayStaffInfo = `[${historyStaffReturn.staffid}] - ${historyStaffReturn.lastName} ${historyStaffReturn.firstName}`;
          } else {
            this.displayStaffInfo = "[] CHƯA XÁC ĐỊNH";
          }
        } else {
          this.isViewMode = false;
          this.getStaffFromLocal();
        }

        // 7. Đổ toàn bộ dữ liệu thật ra màn hình hiển thị
        this.matchedData = {
          loanId: currentLoan._id,
          readerIdShort: currentReader ? currentReader.readerid : "N/A", // 🎯 Gán mã ngắn vào đây
          readerName: currentReader
            ? `${currentReader.lastName} ${currentReader.firstName}`
            : "Không rõ",
          bookId: currentBook ? currentBook.bookid : "N/A", // 🎯 Gán mã ngắn vào đây
          bookTitle: currentBook ? currentBook.name : "Không rõ",
          borrowDate: currentLoan.borrowDate,
          dueDate: currentLoan.dueDate,
          returnDate: currentLoan.returnDate || "Chưa trả",
          status: currentLoan.status,
          loanQuantity: currentLoan.quantity || 1,
          bookIdLong: currentBook ? currentBook._id : "", // ID dài của MongoDB dùng cho Backend hoàn kho
          bookPrice: currentBook ? currentBook.price : 0,
          staffApproveName: currentStaffApprove
            ? `${currentStaffApprove.lastName} ${currentStaffApprove.firstName}`
            : "Chưa xác định",
          staffApproveId: currentStaffApprove
            ? currentStaffApprove.staffid
            : "",
          fine_amount: currentLoan.returnDetail?.fine_amount || 0,
        };

        // 8. Điền số lượng thực tế mang trả (Giữ nguyên logic cũ)
        this.shortCodes.quantity_returned = this.isViewMode
          ? currentLoan.returnDetail?.quantity_returned || 0
          : this.matchedData.loanQuantity;
      } catch (error) {
        console.error("Lỗi nạp dữ liệu chi tiết phiếu:", error);
      } finally {
        this.isLoading = false;
      }
    },
    formatVND(val) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(val);
    },
    submitForm() {
      // Nếu cố tình lách luật nhấn submit khi đang ở chế độ xem thì chặn lại
      if (this.isViewMode) return;

      const finalReturnPayload = {
        loanId: this.matchedData.loanId,
        bookid: this.matchedData.bookIdLong,
        bodyData: {
          staffid_return: this.shortCodes.staffid_return,
          quantity_returned: this.shortCodes.quantity_returned,
          fine_amount: this.returnAnalytics.calculatedFine,
        },
      };
      this.$emit("submit:return", finalReturnPayload);
    },
  },
  mounted() {
    this.loadLoanDetails(); // Khởi tạo việc nạp dữ liệu thông minh
  },
};
</script>
