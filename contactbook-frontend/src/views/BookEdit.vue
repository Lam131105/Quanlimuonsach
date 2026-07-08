<template>
  <div v-if="book" class="container mt-3" style="max-width: 800px">
    <h4 class="text-center text-warning mb-4 font-weight-bold">
      <i class="fas fa-edit"></i> CHỈNH SỬA THÔNG TIN SÁCH
    </h4>

    <BookForm
      :book="book"
      :showDelete="true"
      @submit="updateBook"
      @cancel="goBack"
      @delete="deleteBook"
    />
  </div>
  <div v-else class="text-center mt-5">
    <p class="text-muted">Đang tải dữ liệu cuốn sách...</p>
  </div>
</template>

<script>
import BookService from "@/services/book.service";
import BookForm from "@/components/BookForm.vue"; // Import form dùng chung

export default {
  components: {
    BookForm,
  },
  props: {
    id: { type: String, required: true },
  },
  data() {
    return {
      book: null,
    };
  },
  methods: {
    async getBook() {
      try {
        this.book = await BookService.get(this.id);
      } catch (error) {
        console.log(error);
        this.$router.push({ name: "notfound" });
      }
    },
    async updateBook(data) {
      try {
        await BookService.update(this.id, data);
        alert("Cập nhật thông tin sách thành công!");
        this.goBack();
      } catch (error) {
        console.log(error);
        alert("Có lỗi xảy ra khi cập nhật!");
      }
    },
    async deleteBook() {
      if (
        confirm("Bạn có chắc chắn muốn XÓA cuốn sách này khỏi danh mục không?")
      ) {
        try {
          await BookService.delete(this.id);
          alert("Đã xóa sách thành công!");
          this.goBack();
        } catch (error) {
          console.log(error);
        }
      }
    },
    goBack() {
      this.$router.push({ name: "bookmanager" });
    },
  },
  created() {
    this.getBook();
  },
};
</script>
