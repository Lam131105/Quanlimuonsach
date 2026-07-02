<template>
  <div class="container mt-3">
    <div class="row">
      <div class="col-12">
        <h4 class="text-center text-primary mb-4 font-weight-bold">
          <i class="fas fa-book"></i> HỆ THỐNG QUẢN LÝ DANH MỤC SÁCH
        </h4>
      </div>
    </div>

    <div class="row justify-content-center">
      <div class="col-12 mb-4">
        <div class="mb-4 search-box-wrapper d-flex justify-content-center">
          <div style="width: 100%; max-width: 500px">
            <InputSearch
              v-model="searchText"
              @submit="searchBooks"
              placeholder="Nhập tên sách, tác giả..."
            />
          </div>
        </div>

        <h5 class="mb-3 font-weight-bold text-secondary">
          <i class="fas fa-list-ul"></i> Danh mục sách hiện có
        </h5>

        <BookList
          v-if="filteredBooks.length > 0"
          :books="filteredBooks"
          @selected="goToEditBook"
        />
        <p v-else class="text-muted mt-3 text-center">
          Không có cuốn sách nào trong danh mục.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import InputSearch from "@/components/InputSearch.vue";
import BookList from "@/components/BookList.vue";
import BookService from "@/services/book.service";

export default {
  components: {
    InputSearch,
    BookList,
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
    // ✅ HÀM CHUYỂN TRANG KHI CLICK VÀO SÁCH ✅
    goToEditBook(id) {
      // Chuyển hướng sang route có tên là 'bookdetail.vue' và truyền kèm ID của cuốn sách lên URL
      this.$router.push({ name: "bookdetail", params: { id: id } });
    },
  },
  mounted() {
    this.retrieveBooks();
  },
};
</script>
