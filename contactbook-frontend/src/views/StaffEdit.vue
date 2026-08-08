<template>
  <div class="container mt-3" style="max-width: 750px">
    <h4 class="text-center text-primary mb-4 font-weight-bold">
      <i class="fas fa-user-edit"></i> HIỆU CHỈNH THÔNG TIN NHÂN VIÊN
    </h4>

    <!-- Chỉ hiển thị form khi API đã trả về dữ liệu cũ thành công -->
    <StaffForm
      v-if="staff"
      :staff="staff"
      :isEdit="true"
      @submit="updateStaff"
      @cancel="goBack"
    />
    <p v-else class="text-center text-muted py-4">
      Đang tải thông tin nhân viên...
    </p>
  </div>
</template>

<script>
import StaffService from "@/services/staff.service";
import StaffForm from "@/components/StaffForm.vue";

export default {
  components: {
    StaffForm,
  },
  props: {
    id: { type: String, required: true }, // Nhận ID nhân viên từ router thanh địa chỉ URL
  },
  data() {
    return {
      staff: null,
    };
  },
  methods: {
    // Bốc thông tin cũ từ MongoDB lên điền vào form
    async getStaff(id) {
      try {
        this.staff = await StaffService.get(id);
      } catch (error) {
        console.error(error);
        this.$router.push({
          name: "notfound",
          params: { pathMatch: this.$route.path.split("/").slice(1) },
        });
      }
    },
    // Hàm thực hiện cập nhật khi nhấn Lưu
    async updateStaff(data) {
      try {
        await StaffService.update(this.id, data);
        alert("Cập nhật thông tin nhân viên thành công!");
        this.goBack();
      } catch (error) {
        console.error(error);
        alert("Có lỗi xảy ra khi cập nhật dữ liệu!");
      }
    },
    goBack() {
      this.$router.push({ name: "staffmanager" });
    },
  },
  created() {
    this.getStaff(this.id);
  },
};
</script>
