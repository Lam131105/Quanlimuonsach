<template>
  <div class="container mt-3">
    <div class="row">
      <div class="col-md-12">
        <h4 class="text-center text-primary mb-4">
          <i class="fas fa-book"></i> HỆ THỐNG QUẢN LÝ DANH MỤC SÁCH
        </h4>
      </div>
    </div>

    <div class="row">
      <div class="col-md-7">
        <div class="mb-3">
          <InputSearch v-model="searchText" @submit="searchBooks" placeholder="Nhập tên sách, tác giả, thể loại..." />
        </div>

        <h5 class="mt-4">
          <i class="fas fa-list-ul"></i> Danh mục sách hiện có
        </h5>

        <BookList v-if="filteredBooks.length > 0" :books="filteredBooks" v-model:activeIndex="activeIndex" />
        <p v-else class="text-muted mt-3">Không có cuốn sách nào trong danh mục.</p>

        <div class="mt-3 d-flex justify-content-between">
          <button class="btn btn-sm btn-success" @click="goToAddBook">
            <i class="fas fa-plus-circle"></i> Thêm sách mới
          </button>
          <button class="btn btn-sm btn-danger" @click="removeAllBooks">
            <i class="fas fa-trash-alt"></i> Xóa tất cả
          </button>
        </div>
      </div>

      <div class="col-md-5">
        <div v-if="activeBook">
          <h5 class="text-info">
            <i class="fas fa-info-circle"></i> Chi tiết cuốn sách
          </h5>
          <div class="card p-3 shadow-sm bg-light">
            <BookCard :book="activeBook" />


          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Nhập lại InputSearch đã có
import InputSearch from "@/components/InputSearch.vue";

import BookList from "@/components/BookList.vue";
import BookCard from "@/components/BookCard.vue";

import BookService from "@/services/book.service"; // Lưu ý tên file Service

export default {
  components: {
    InputSearch,
    BookList,
    BookCard,
  },
  data() {
    return {
      books: [],
      searchText: "",
      activeIndex: -1,
    };
  },
  watch: {
    // Giám sát tìm kiếm, nếu chuỗi tìm kiếm thay đổi thì reset vị trí đang chọn
    searchText() {
      this.activeIndex = -1;
    },
  },
  computed: {
    // Tìm kiếm sách theo Tên sách hoặc Tác giả hoặc Thể loại
    filteredBooks() {
      // Nếu ô tìm kiếm trống, trả về toàn bộ danh sách sách ban đầu
      if (!this.searchText) return this.books;

      // Tiến hành lọc danh sách dựa trên từ khóa người dùng gõ
      return this.books.filter((book) => {
        // Chuyển tất cả về chữ thường (.toLowerCase()) để tìm kiếm không phân biệt chữ hoa, chữ thường
        const nameMatch = book.name?.toLowerCase().includes(this.searchText.toLowerCase());
        // const authMatch = book.auth?.toLowerCase().includes(this.searchText.toLowerCase());
        // const cateMatch = book.category?.toLowerCase().includes(this.searchText.toLowerCase());

        // Chỉ cần khớp 1 trong 3 điều kiện (Tên HOẶC Tác giả HOẶC Thể loại) là giữ lại cuốn sách đó
        return nameMatch //|| authMatch || cateMatch;
      });
    },
    // Trả về cuốn sách cụ thể đang được người dùng click chọn
    activeBook() {
      if (this.activeIndex < 0) return null;
      return this.filteredBooks[this.activeIndex];
    },
  },



  methods: {
    // Hàm gọi API lấy tất cả sách từ backend
    async retrieveBooks() {
      try {
        this.books = await BookService.getAll();
      } catch (error) {
        console.log(error);
      }
    },
    // Hàm xử lý tìm kiếm khi bấm nút
    async searchBooks() {
      try {
        this.activeIndex = -1; // Reset lại dòng được chọn
        this.books = await BookService.getAll(); // Lấy lại dữ liệu
      } catch (error) {
        console.log(error);
      }
    },
    // Hàm xóa toàn bộ sách
    async removeAllBooks() {
      if (confirm("Bạn có chắc chắn muốn xóa TOÀN BỘ danh mục sách?")) {
        try {
          await BookService.deleteAll();
          this.activeIndex = -1;
          this.retrieveBooks();
        } catch (error) {
          console.log(error);
        }
      }
    },
    goToAddBook() {
      this.$router.push({ name: "book.add" });
    },
  },
  // Khi trang web vừa tải xong, tự động gọi API lấy dữ liệu lên
  mounted() {
    this.retrieveBooks();
  },
};
</script>