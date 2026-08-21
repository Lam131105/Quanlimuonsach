<template>
  <div class="container mt-4" style="max-width: 600px">
    <h4 class="text-center text-primary mb-4 font-weight-bold">
      <i class="fas fa-file-invoice"></i> LẬP PHIẾU MƯỢN TẠI QUẦY
    </h4>

    <!-- 🎯 Gọi Component con vào sử dụng -->
    <LoanForm 
      submitButtonText="Hoàn Tất Lập Phiếu" 
      @submit:loan="createLoan" 
      @cancel="goBack" 
    />
  </div>
</template>

<script>
import LoanForm from "@/components/LoanForm.vue"; // Import component con vừa tách
import LoanService from "@/services/loan.service";

export default {
  name: "LoanAdd",
  components: {
    LoanForm,
  },
  methods: {
    // 🎯 Hàm xử lý tạo phiếu mượn gửi lên Backend
    async createLoan(data) {
      try {
        await LoanService.create(data);
        alert("🎉 Tạo phiếu mượn tại quầy thành công!");
        this.goBack(); // Quay lại trang danh sách
      } catch (error) {
        console.error(error);
        alert(error.response?.data?.message || "Có lỗi xảy ra khi tạo phiếu mượn!");
      }
    },
    // Hàm quay trở lại trang quản lý trước đó
    goBack() {
      // Dùng $router.go(-1) để quay lại trang trước đó, bất kể tên route quản lý của bạn là gì
      this.$router.go(-1); 
    }
  }
};
</script>