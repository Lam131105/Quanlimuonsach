<template>
  <div class="book-card-detail text-center text-md-left">
    <div class="text-center mb-3">
      <img v-if="book.imgUrl && imageExists" :src="getBookImage(book.imgUrl)" alt="Ảnh bìa sách"
        class="img-fluid rounded shadow-sm book-cover" @error="handleImageError" />
      <div v-else class="no-image-box rounded d-flex align-items-center justify-content-center mx-auto shadow-sm">
        <i class="fas fa-book-open fa-3x text-secondary"></i>
      </div>
    </div>

    <div class="mt-3">
      <h5 class="text-primary font-weight-bold">{{ book.name }}</h5>
      <hr class="my-2" />

      <div class="mb-2">
        <strong><i class="fas fa-user-edit text-muted mr-1"></i> Tác giả:</strong>
        {{ book.auth || 'Chưa rõ' }}
      </div>

      <div class="mb-2">
        <strong><i class="fas fa-tags text-muted mr-1"></i> Thể loại:</strong>
        <span class="badge badge-info">{{ book.category || 'Chưa phân loại' }}</span>
      </div>

      <div class="mb-2">
        <strong><i class="fas fa-align-left text-muted mr-1"></i> Mô tả:</strong>
        <p class="text-justify text-secondary mt-1 small-description">
          {{ book.description || 'Không có mô tả chi tiết cho cuốn sách này.' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    book: { type: Object, required: true },
  },
  data() {
    return {
      // Biến dùng để kiểm tra ảnh có tồn tại trong thư mục thật hay không
      imageExists: true,
    };
  },
  watch: {
    // Mỗi khi chuyển xem cuốn sách khác, reset lại biến kiểm tra ảnh
    book: {
      handler() {
        this.imageExists = true;
      },
      deep: true,
    },
  },
  methods: {
    // ✅ HÀM QUAN TRỌNG ĐỂ LẤY ẢNH TỪ THƯ MỤC ASSETS ✅
    getBookImage(imageName) {
      // imagePath sẽ có dạng: /src/assets/imgbook/ten-anh.jpg
      const imagePath = `/src/assets/imgbook/${imageName}`;

      // Sử dụng cơ chế new URL của Vite để biên dịch đường dẫn thành URL hợp lệ
      // (Bắt buộc phải truyền đường dẫn cứng vào new URL, không dùng biến cộng chuỗi ở đây)
      // Vite sẽ tự động tìm ảnh theo cấu trúc tên bạn đặt
      try {
        // Chúng ta lợi dụng việc dynamic import để kiểm tra đường dẫn ảnh
        // (Đây là cách chuẩn của Vite dành cho dynamic assets)
        return new URL(imagePath, import.meta.url).href;
      } catch (error) {
        // Nếu không tìm thấy đường dẫn ảnh, trả về chuỗi rỗng
        return '';
      }
    },
    // Hàm xử lý nếu Vite không thể load được file ảnh
    handleImageError() {
      this.imageExists = false;
    },
  },
};
</script>

<style scoped>
.book-cover {
  max-height: 200px;
  object-fit: cover;
  border: 1px solid #dee2e6;
}

.no-image-box {
  width: 140px;
  height: 200px;
  background-color: #e9ecef;
  border: 1px dashed #ced4da;
}

.small-description {
  white-space: pre-line;
  max-height: 150px;
  overflow-y: auto;
}
</style>