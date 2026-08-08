<template>
  <div class="container mt-3" style="max-width: 750px">
    <h4 class="text-center text-success mb-4 font-weight-bold">
      <i class="fas fa-user-plus"></i> THÊM MỚI NHÂN VIÊN VÀO HỆ THỐNG
    </h4>

    <StaffForm
      :staff="newStaff"
      :isEdit="false"
      @submit="createStaff"
      @cancel="goBack"
    />
  </div>
</template>

<script>
import StaffService from "@/services/staff.service"; // Giả định bạn đã tạo file service frontend tương ứng
import StaffForm from "@/components/StaffForm.vue";

export default {
  components: {
    StaffForm,
  },
  data() {
    return {
      newStaff: {
        lastName: "",
        firstName: "",
        birthDay: "",
        gender: "",
        gmail: "",
        address: "",
        phone: "",
        password: "",
      },
    };
  },
  methods: {
    async createStaff(data) {
      try {
        await StaffService.create(data);
        alert("Thêm nhân viên mới thành công!");
        this.goBack();
      } catch (error) {
        console.error(error);
        alert(
          "Có lỗi xảy ra! Vui lòng kiểm tra lại dữ liệu (Trùng email hoặc lỗi kết nối).",
        );
      }
    },
    goBack() {
      this.$router.push({ name: "staffmanager" }); // Quay về trang danh sách quản lý
    },
  },
};
</script>
