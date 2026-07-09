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
// Giả sử bạn đổi tên file component từ InputSearch sang InputSearch cho hợp ngữ cảnh nhé
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
      // Đã khởi tạo cấu trúc Object 3 trường chính xác
      searchText: {
        name: "",
        publisherId: "",
        categoryId: "",
      },
    };
  },
  computed: {
    // 💡 ĐÃ NÂNG CẤP: Bộ lọc thông minh kết hợp cả 3 điều kiện
    filteredBooks() {
      return this.books.filter((book) => {
        // 1. Lọc theo Tên sách hoặc Tác giả (Gõ chữ)
        // Nếu người dùng không gõ gì (chuỗi rỗng), mặc định xem như Thỏa mãn (true)
        const matchText = this.searchText.name
          ? book.name
              ?.toLowerCase()
              .includes(this.searchText.name.toLowerCase()) ||
            book.auth
              ?.toLowerCase()
              .includes(this.searchText.name.toLowerCase())
          : true;

        // 2. Lọc theo Nhà xuất bản (Chọn Dropdown)
        // Nếu chọn "-- Tất cả NXB --" (chuỗi rỗng), mặc định Thỏa mãn (true)
        const matchPublisher = this.searchText.publisherId
          ? book.publisherId === this.searchText.publisherId
          : true;

        // 3. Lọc theo Thể loại (Chọn Dropdown)
        // Vì trong DB, một cuốn sách có MẢNG categoryIds, ta dùng .includes() để check xem ID đang chọn có nằm trong mảng đó không
        const matchCategory = this.searchText.categoryId
          ? book.categoryIds?.includes(this.searchText.categoryId)
          : true;

        // Cuốn sách nào thỏa mãn ĐỒNG THỜI cả 3 bộ lọc (dấu &&) thì mới được giữ lại hiển thị
        return matchText && matchPublisher && matchCategory;
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
    // Khi bấm nút tìm kiếm, chỉ cần kích hoạt tải lại danh sách mới nhất từ server (nếu có thay đổi)
    async searchBooks() {
      await this.retrieveBooks();
    },
    // HÀM CHUYỂN TRANG KHI CLICK VÀO SÁCH
    goToEditBook(id) {
      this.$router.push({ name: "bookdetail", params: { id: id } });
    },
  },
  mounted() {
    this.retrieveBooks();
  },
};
</script>
