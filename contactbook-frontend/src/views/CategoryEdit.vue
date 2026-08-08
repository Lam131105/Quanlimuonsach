<template>
  <div class="container mt-3" style="max-width: 600px">
    <h4 class="text-center text-primary mb-4 font-weight-bold">
      <i class="fas fa-edit"></i> HIỆU CHỈNH THỂ LOẠI
    </h4>

    <!-- Chỉ hiển thị form khi đã lấy được dữ liệu từ API về -->
    <CategoryForm
      v-if="category"
      :category="category"
      :showDelete="true"
      @submit="updateCategory"
      @cancel="goBack"
      @delete="deleteCategory"
    />
    <p v-else class="text-center text-muted">Đang tải dữ liệu thể loại...</p>
  </div>
</template>

<script>
import CategoryService from "@/services/category.service";
import CategoryForm from "@/components/CategoryForm.vue";

export default {
  components: {
    CategoryForm,
  },
  props: {
    id: { type: String, required: true }, // Nhận ID thể loại từ URL router truyền vào
  },
  data() {
    return {
      category: null, // Ban đầu chưa có dữ liệu
    };
  },
  methods: {
    // Hàm lấy chi tiết thể loại cũ để điền vào form
    async getCategory(id) {
      try {
        this.category = await CategoryService.get(id);
      } catch (error) {
        console.error(error);
        // Nếu không tìm thấy ID, đá người dùng về trang quản lý
        this.$router.push({
          name: "notfound",
          params: { pathMatch: this.$route.path.split("/").slice(1) },
        });
      }
    },
    // Hàm xử lý khi bấm Lưu thay đổi
    async updateCategory(data) {
      try {
        await CategoryService.update(this.id, data);
        alert("Cập nhật thông tin thể loại thành công!");
        this.goBack();
      } catch (error) {
        console.error(error);
        alert("Có lỗi xảy ra khi cập nhật thể loại!");
      }
    },
    // Hàm xử lý nút Xóa thể loại ngay trong trang sửa
    async deleteCategory() {
      if (confirm("Bạn có chắc chắn muốn XÓA thể loại này không?")) {
        try {
          await CategoryService.delete(this.id);
          alert("Xóa thể loại thành công!");
          this.goBack();
        } catch (error) {
          console.error(error);
        }
      }
    },
    goBack() {
      this.$router.push({ name: "categorymanager" });
    },
  },
  // Vừa mở trang sửa lên là đi bốc dữ liệu cũ về ngay lập tức
  created() {
    this.getCategory(this.id);
  },
};
</script>
