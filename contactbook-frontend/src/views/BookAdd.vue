<template>
  <div class="container mt-3" style="max-width: 800px">
    <h4 class="text-center text-success mb-4 font-weight-bold">
      <i class="fas fa-plus-circle"></i> THÊM SÁCH MỚI VÀO DANH MỤC
    </h4>

    <BookForm
      :book="newBook"
      :showDelete="false"
      @submit="createBook"
      @cancel="goBack"
    />
  </div>
</template>

<script>
import BookService from "@/services/book.service";
import BookForm from "@/components/BookForm.vue"; // Tái sử dụng Form dùng chung

export default {
  components: {
    BookForm,
  },
  data() {
    return {
      // Khởi tạo các trường dữ liệu trống ban đầu cho cuốn sách mới
      newBook: {
        name: "",
        auth: "",
        categoryIds: [], // Khởi tạo mảng trống để lưu các ID thể loại được tích chọn
        publisherId: "",
        description: "",
        image: "",
      },
    };
  },
  methods: {
    // Hàm xử lý gửi dữ liệu sách mới lên Backend để lưu vào MongoDB
    // Bên trong file BookAdd.vue
    async createBook(formData) {
      // data nhận được lúc này chính là formData từ con gửi lên
      try {
        await BookService.create(formData); // Gọi service gửi thẳng cục formData này đi
        alert("Thêm sách mới thành công!");
        this.goBack();
      } catch (error) {
        console.log(error);
        alert("Có lỗi xảy ra khi thêm sách mới.");
      }
    },
    // Quay lại trang quản lý danh mục sách của Admin
    goBack() {
      this.$router.push({ name: "bookmanager" });
    },
  },
};
</script>
