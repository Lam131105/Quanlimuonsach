<template>
  <div class="container mt-3" style="max-width: 600px">
    <h4 class="text-center text-success mb-4 font-weight-bold">
      <i class="fas fa-plus-circle"></i> THÊM THỂ LOẠI MỚI
    </h4>

    <CategoryForm
      :category="newCategory"
      :showDelete="false"
      @submit="createCategory"
      @cancel="goBack"
    />
  </div>
</template>

<script>
import CategoryService from "@/services/category.service";
import CategoryForm from "@/components/CategoryForm.vue";

export default {
  components: {
    CategoryForm,
  },
  data() {
    return {
      // Khởi tạo đối tượng thể loại mới trống trơn
      newCategory: {
        name: "",
        description: "",
      },
    };
  },
  methods: {
    async createCategory(data) {
      try {
        await CategoryService.create(data);
        alert("Thêm thể loại mới thành công!");
        this.goBack();
      } catch (error) {
        console.error(error);
        alert("Có lỗi xảy ra khi thêm thể loại mới. Vui lòng thử lại!");
      }
    },
    goBack() {
      this.$router.push({ name: "categorymanager" }); // Quay về trang quản lý thể loại
    },
  },
};
</script>
