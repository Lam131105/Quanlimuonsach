<template>
  <div class="row">
    <div
      class="col-6 col-md-4 col-lg-3 mb-4"
      v-for="book in books"
      :key="book._id"
    >
      <div
        class="card h-100 book-item-card shadow-sm"
        @click="$emit('selected', book._id)"
      >
        <div
          class="card-img-container d-flex align-items-center justify-content-center bg-light"
        >
          <img
            v-if="book.imgUrl"
            :src="getBookImage(book.imgUrl)"
            class="card-img-top book-card-img"
            alt="Ảnh bìa sách"
            @error="handleImageError"
          />
          <i v-else class="fas fa-book-open fa-3x text-secondary"></i>
        </div>

        <div class="card-body p-2 text-center">
          <h6
            class="card-title text-truncate-2 font-weight-bold mb-1"
            :title="book.name"
          >
            {{ book.name }}
          </h6>
          <p class="card-text text-muted small mb-0 text-truncate">
            {{ book.auth || "Ẩn danh" }}
          </p>
          <div class="mt-2">
            <span
              class="badge badge-pill badge-light border text-secondary small"
            >
              {{ book.category || "N/A" }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    books: { type: Array, default: () => [] },
  },
  emits: ["selected"], // Khai báo emit sự kiện selected
  methods: {
    getBookImage(imageName) {
      if (!imageName) return "";
      return new URL(`/src/assets/imgbook/${imageName}`, import.meta.url).href;
    },
    handleImageError(e) {
      e.target.src = "";
      e.target.style.display = "none";
    },
  },
};
</script>

<style scoped>
.book-item-card {
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  border: 1px solid #eee;
  border-radius: 10px;
  overflow: hidden;
}

.book-item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1) !important;
}

/* Hiệu ứng khi được chọn */
.active-card {
  border: 2px solid #007bff !important;
  background-color: #f0f7ff;
}

.card-img-container {
  height: 180px; /* Cố định chiều cao vùng chứa ảnh để lưới đều nhau */
  overflow: hidden;
  padding: 10px;
}

.book-card-img {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain; /* Giữ nguyên tỷ lệ ảnh bìa */
  border-radius: 4px;
}

/* Giới hạn tên sách trong 2 dòng */
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 0.9rem;
  line-height: 1.2;
  height: 2.4em;
}

.small {
  font-size: 0.8rem;
}
</style>
