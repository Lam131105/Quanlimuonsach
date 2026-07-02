<template>
  <div class="container mt-3">
    <div class="row">
      <div class="col-12">
        <h4 class="text-center text-danger mb-4 font-weight-bold">
          <i class="fas fa-cogs"></i> HỆ THỐNG QUẢN TRỊ DANH MỤC SÁCH
        </h4>
      </div>
    </div>

    <div class="row">
      <div class="col-12 mb-4">
        <div
          class="d-flex flex-wrap justify-content-between align-items-center mb-4 bg-light p-3 rounded shadow-sm"
        >
          <div
            class="search-box-wrapper w-100 max-w-md mb-2 mb-md-0"
            style="max-width: 400px"
          >
            <InputSearch
              v-model="searchText"
              @submit="searchBooks"
              placeholder="Tìm tên sách, tác giả..."
            />
          </div>
          <div>
            <button
              class="btn btn-success font-weight-bold shadow-sm mr-2"
              @click="goToAddBook"
            >
              <i class="fas fa-plus-circle"></i> Thêm sách mới
            </button>
            <button
              class="btn btn-outline-danger font-weight-bold shadow-sm"
              @click="removeAllBooks"
            >
              <i class="fas fa-trash-alt"></i> Xóa tất cả
            </button>
          </div>
        </div>

        <h5 class="mb-3 font-weight-bold text-dark">
          <i class="fas fa-table"></i> Danh sách quản lý chi tiết
        </h5>

        <BookManagerList
          v-if="filteredBooks.length > 0"
          :books="filteredBooks"
          @edit="goToEditBook"
          @delete="deleteBook"
        />
        <p v-else class="text-muted mt-3 text-center py-4 bg-light rounded">
          Không tìm thấy cuốn sách nào thỏa mãn điều kiện.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import InputSearch from "@/components/InputSearch.vue";
import BookManagerList from "@/components/BookManagerList.vue";
import BookService from "@/services/book.service";

export default {
  components: {
    InputSearch,
    BookManagerList,
  },
  data() {
    return {
      books: [],
      searchText: "",
    };
  },
  computed: {
    filteredBooks() {
      if (!this.searchText) return this.books;
      return this.books.filter((book) => {
        const nameMatch = book.name
          ?.toLowerCase()
          .includes(this.searchText.toLowerCase());
        const authMatch = book.auth
          ?.toLowerCase()
          .includes(this.searchText.toLowerCase());
        const cateMatch = book.category
          ?.toLowerCase()
          .includes(this.searchText.toLowerCase());
        return nameMatch || authMatch || cateMatch;
      });
    },
  },
  methods: {
    async retrieveBooks() {
      try {
        this.books = await BookService.getAll();
      } catch (error) {
        console.log(error);
      }
    },
    async searchBooks() {
      this.retrieveBooks();
    },
    goToAddBook() {
      this.$router.push({ name: "book.add" }); // Trỏ tới trang tạo form thêm sách mới
    },
    goToEditBook(id) {
      this.$router.push({ name: "bookedit", params: { id: id } }); // Trỏ tới trang Form chỉnh sửa sách
    },
    async deleteBook(id) {
      if (
        confirm("Bạn có chắc chắn muốn XÓA cuốn sách này khỏi cơ sở dữ liệu?")
      ) {
        try {
          await BookService.delete(id);
          alert("Xóa sách thành công!");
          this.retrieveBooks(); // Tải lại danh sách sau khi xóa
        } catch (error) {
          console.log(error);
        }
      }
    },
    async removeAllBooks() {
      if (
        confirm(
          "CẢNH BÁO: Bạn có chắc chắn muốn xóa TOÀN BỘ sách trong hệ thống?",
        )
      ) {
        try {
          await BookService.deleteAll();
          this.retrieveBooks();
        } catch (error) {
          console.log(error);
        }
      }
    },
  },
  mounted() {
    this.retrieveBooks();
  },
};
</script>
