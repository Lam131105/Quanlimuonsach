<template>
  <div class="container mt-4 animate__animated animate__fadeIn">
    <!-- Tiêu đề trang trang trí trực quan -->
    <div class="d-flex align-items-center mb-4 pb-2 border-bottom">
      <div class="bg-success text-white rounded p-3 mr-3 shadow-sm">
        <i class="fas fa-arrow-down fa-2x"></i>
      </div>
      <div>
        <h3 class="mb-0 text-dark font-weight-bold">Chi tiết phiếu mượn</h3>
        <p class="text-muted mb-0">
          Hệ thống tự động tính toán tiền phạt và tự động hoàn
          trả sách vào kho khi độc giả trả sách.
        </p>
      </div>
    </div>

    <!-- Hiển thị thông báo trạng thái xử lý nếu đang gửi API -->
    <div
      v-if="isSubmitting"
      class="alert alert-info shadow-sm rounded border-0 d-flex align-items-center"
      role="alert"
    >
      <div
        class="spinner-border spinner-border-sm mr-3 text-info"
        role="status"
      ></div>
      <div>
        <strong>Hệ thống đang xử lý:</strong> Đang lưu thông tin trả sách và cập
        nhật số lượng kho hàng, vui lòng đợi...
      </div>
    </div>

    <!-- Nhúng Component Form trả sách vào -->
    <div class="row">
      <div class="col-lg-8 mx-auto">
        <ReturnForm
          @submit:return="handleReturnBook"
          @cancel="goToLoanManager"
          submitButtonText="Hoàn Tất Trả Sách"
        />
      </div>
    </div>
  </div>
</template>
<script>
import ReturnForm from "@/components/ReturnForm.vue";
import LoanService from "@/services/loan.service";

export default {
  name: "BookReturn",
  components: {
    ReturnForm,
  },
  data() {
    return {
      isSubmitting: false, // Khóa màn hình/nút bấm khi đang xử lý API tránh click đúp
    };
  },
  methods: {
    // 🚀 HÀM ĐÓN NHẬN CỤC DATA TỪ FORM VÀ BẮN LÊN BACKEND
    async handleReturnBook(payload) {
      this.isSubmitting = true;
      try {
        const loanId = payload.loanId;
        const bodyData = payload.bodyData;
        const bookId = payload.bookid;

        // Đóng gói đầy đủ bưu kiện gửi lên cho hàm processReturnBook xử lý ở Backend
        const fullPayloadBackend = {
          ...bodyData,
          bookid: bookId, // Backend cần ID dài này để cộng hoàn lại kho số lượng sách
        };

        // Gửi lên API xử lý trả sách chuyên dụng
        await LoanService.processReturn(loanId, fullPayloadBackend);

        alert("🎉 Thành công: Đã tiếp nhận trả sách và hoàn kho sách hoàn tất!");
        this.goToLoanManager();
      } catch (error) {
        console.error("Lỗi API Trả sách:", error);
        alert("Có lỗi xảy ra khi xử lý trả sách!");
      } finally {
        this.isSubmitting = false;
      }
    },

    // 🎯 HÀM ĐIỀU HƯỚNG QUAY LẠI DANH SÁCH QUẢN LÝ
    goToLoanManager() {
      // Khi quay lại trang quản lý mượn trả, ta không cần đính kèm bất kỳ tham số nào trên URL nữa
      this.$router.push({ name: "loanmanager" });
    },
  },
};
</script>
