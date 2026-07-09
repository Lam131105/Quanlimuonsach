<template>
  <div v-if="book" class="container mt-4" style="max-width: 850px">
    <h4 class="text-center text-primary mb-4 font-weight-bold">
      <i class="fas fa-book-open"></i> THÔNG TIN CHI TIẾT SÁCH
    </h4>

    <div class="card p-4 shadow border-0 rounded-lg bg-white">
      <div class="row align-items-center align-items-md-start">
        <div class="col-md-5 text-center mb-4 mb-md-0">
          <div
            class="image-wrapper p-3 bg-light rounded shadow-sm d-inline-block"
          >
            <img
              v-if="book.imgUrl && imageExists"
              :src="getBookImage(book.imgUrl)"
              alt="Ảnh bìa sách"
              class="img-fluid rounded book-cover-detail"
              @error="handleImageError"
            />
            <div
              v-else
              class="no-image-box-detail rounded d-flex align-items-center justify-content-center shadow-sm"
            >
              <i class="fas fa-book-open fa-4x text-secondary"></i>
            </div>
          </div>
        </div>

        <div class="col-md-7">
          <h3 class="text-dark font-weight-bold mb-3">{{ book.name }}</h3>
          <hr class="my-3" />

          <div class="info-row mb-3">
            <label class="font-weight-bold">
              <i class="fas fa-building text-muted mr-1"></i> Tác giả:
            </label>
            <span class="info-value ml-2 text-dark font-weight-bold">
              {{ book.auth || "Chưa rõ tác giả" }}
            </span>
          </div>

          <div class="form-group">
            <label class="font-weight-bold">
              <i class="fas fa-building text-muted mr-1"></i> Nhà xuất bản:
            </label>
            <span class="info-value ml-2 text-dark">
              {{
                publishers.find((pub) => pub._id === book.publisherId)?.name ||
                "Đang tải..."
              }}
            </span>
          </div>

          <div class="form-group">
            <label class="font-weight-bold d-block">
              <i class="fas fa-tags text-muted mr-1"></i> Thể loại sách:
            </label>
            <div class="p-1">
              <span
                v-for="catId in book.categoryIds"
                :key="catId"
                class="badge badge-info mr-2 px-3 py-2"
                style="font-size: 14px; border-radius: 4px"
              >
                {{ categories.find((cat) => cat._id === catId)?.name || "..." }}
              </span>

              <span
                v-if="!book.categoryIds || book.categoryIds.length === 0"
                class="text-muted small"
              >
                Chưa phân loại
              </span>
            </div>
          </div>
          <div class="info-row mb-3">
            <span class="info-label text-muted">
              <i class="fas fa-tags mr-2"></i><strong>Số lượng:</strong>
            </span>
            <span class="text-muted">
              {{ book.quantity || "Chưa phân loại" }}
            </span>
          </div>

          <div class="info-row mb-3">
            <span class="info-label text-muted">
              <i class="fas fa-tags mr-2"></i><strong>Năm:</strong>
            </span>
            <span class="text-muted">
              {{ book.year || "Chưa xác định" }}
            </span>
          </div>

          <div class="info-row mb-3">
            <span class="info-label text-muted d-block mb-2">
              <i class="fas fa-align-left mr-2"></i
              ><strong>Tóm tắt nội dung / Mô tả sách:</strong>
            </span>
            <p
              class="text-justify text-secondary bg-light p-3 rounded book-description-text shadow-inner"
            >
              {{
                book.description ||
                "Hiện tại chưa có bài viết mô tả chi tiết cho cuốn sách này."
              }}
            </p>
          </div>
        </div>
      </div>

      <hr class="mt-4" />
      <div class="d-flex justify-content-start mt-3">
        <button
          type="button"
          class="btn btn-outline-primary px-4 font-weight-bold shadow-sm"
          @click="goBack"
        >
          <i class="fas fa-arrow-left mr-2"></i> Quay lại danh mục sách
        </button>
      </div>
    </div>
  </div>

  <div v-else class="text-center mt-5 py-5">
    <div class="spinner-border text-primary" role="status"></div>
    <p class="text-muted mt-3">Đang truy xuất thông tin cuốn sách...</p>
  </div>
</template>

<script>
import BookService from "@/services/book.service";
import CategoryService from "@/services/category.service";
import PublisherService from "@/services/publisher.service";

export default {
  props: {
    id: { type: String, required: true }, // Nhận mã ID sách từ URL
  },
  data() {
    return {
      book: null,
      imageExists: true,
      categories: [], // Danh sách thể loại lấy từ API
      publishers: [], // Danh sách nhà xuất bản lấy từ API
    };
  },
  methods: {
    // Gọi API sang Backend để lấy thông tin cuốn sách dựa theo ID
    async getBook() {
      try {
        this.book = await BookService.get(this.id);
      } catch (error) {
        console.log(error);
        this.$router.push({ name: "notfound" });
      }
    },
    goBack() {
      this.$router.push({ name: "bookmanager" });
    },
    getBookImage(imageName) {
      if (!imageName) return "";
      return new URL(`/src/assets/imgbook/${imageName}`, import.meta.url).href;
    },
    handleImageError() {
      this.imageExists = false;
    },

    async fetchCategories() {
      try {
        this.categories = await CategoryService.getAll();
      } catch (error) {
        console.error("Lỗi lấy danh sách thể loại:", error);
      }
    },
    // Hàm gọi API lấy danh sách Nhà xuất bản
    async fetchPublishers() {
      try {
        this.publishers = await PublisherService.getAll();
      } catch (error) {
        console.error("Lỗi lấy danh sách NXB:", error);
      }
    },
  },

  created() {
    this.getBook();
    this.fetchCategories();
    this.fetchPublishers();
  },
};
</script>

<style scoped>
/* Định dạng kích thước ảnh bìa cuốn sách cho cân đối */
.book-cover-detail {
  max-height: 320px;
  width: auto;
  object-fit: contain;
}

.no-image-box-detail {
  width: 220px;
  height: 320px;
  background-color: #f8f9fa;
  border: 2px dashed #dee2e6;
}

/* Định dạng ô hiển thị đoạn văn mô tả sách */
.book-description-text {
  font-size: 0.95rem;
  line-height: 1.6;
  white-space: pre-line; /* Giữ nguyên các dấu xuống dòng từ database */
  max-height: 250px;
  overflow-y: auto; /* Tạo thanh cuộn nếu mô tả quá dài */
  border-left: 4px solid #007bff; /* Tạo điểm nhấn màu xanh ở lề trái */
}

.info-label {
  font-size: 1rem;
}

.info-value {
  font-size: 1.05rem;
}

.image-wrapper {
  transition: transform 0.3s ease;
}

/* Hiệu ứng phóng to nhẹ ảnh bìa khi rê chuột vào nhìn rất nghệ thuật */
.image-wrapper:hover {
  transform: scale(1.03);
}
</style>
