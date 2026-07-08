<template>
  <div class="card p-4 shadow-sm bg-light">
    <form @submit.prevent="$emit('submit', localBook)">
      <div class="row">
        <div class="col-md-4 text-center mb-3">
          <label class="font-weight-bold d-block mb-2">Ảnh bìa hiện tại</label>
          <div class="mb-3">
            <img
              v-if="localBook.imgUrl && imageExists"
              :src="getBookImage(localBook.imgUrl)"
              alt="Ảnh bìa sách"
              class="img-fluid rounded shadow-sm book-cover-edit"
              @error="handleImageError"
            />
            <div
              v-else
              class="no-image-box-edit rounded d-flex align-items-center justify-content-center mx-auto shadow-sm"
            >
              <i class="fas fa-book-open fa-3x text-secondary"></i>
            </div>
          </div>

          <div class="form-group text-left">
            <label for="imgUrl" class="small font-weight-bold"
              >Tên file ảnh (trong assets/images):</label
            >
            <input
              type="text"
              id="imgUrl"
              class="form-control form-control-sm"
              v-model="localBook.imgUrl"
              placeholder="Ví dụ: nensach.jpg"
            />
          </div>
        </div>

        <div class="col-md-8">
          <div class="form-group">
            <label for="name" class="font-weight-bold">
              <i class="fas fa-book text-muted mr-1"></i> Tên sách:
            </label>
            <input
              type="text"
              id="name"
              class="form-control"
              v-model="localBook.name"
              required
            />
          </div>

          <div class="form-group">
            <label for="auth" class="font-weight-bold">
              <i class="fas fa-user-edit text-muted mr-1"></i> Tác giả:
            </label>
            <input
              type="text"
              id="auth"
              class="form-control"
              v-model="localBook.auth"
            />
          </div>

          <div class="form-group">
            <label for="category" class="font-weight-bold">
              <i class="fas fa-tags text-muted mr-1"></i> Thể loại:
            </label>
            <input
              type="text"
              id="category"
              class="form-control"
              v-model="localBook.category"
            />
          </div>

          <div class="form-group">
            <label for="description" class="font-weight-bold">
              <i class="fas fa-align-left text-muted mr-1"></i> Mô tả sách:
            </label>
            <textarea
              id="description"
              class="form-control"
              rows="4"
              v-model="localBook.description"
            ></textarea>
          </div>
        </div>
      </div>

      <hr />

      <div class="d-flex justify-content-between mt-3">
        <button
          type="button"
          class="btn btn-secondary"
          @click="$emit('cancel')"
        >
          <i class="fas fa-arrow-left"></i> Quay lại
        </button>
        <div>
          <button
            v-if="showDelete"
            type="button"
            class="btn btn-danger mr-2"
            @click="$emit('delete')"
          >
            <i class="fas fa-trash-alt"></i> Xóa sách
          </button>
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-save"></i> Lưu thay đổi
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  props: {
    // Nhận object dữ liệu ban đầu
    book: { type: Object, required: true },
    // Thuộc tính tùy chọn hiển thị nút xóa
    showDelete: { type: Boolean, default: false },
  },
  emits: ["submit", "cancel", "delete"],
  data() {
    return {
      // Sao chép props sang biến local để thoải mái dùng v-model mà không vi phạm nguyên tắc Vue
      localBook: { ...this.book },
      imageExists: true,
    };
  },
  watch: {
    // Cập nhật lại dữ liệu local nếu props từ ngoài truyền vào thay đổi đột ngột
    book: {
      handler(newVal) {
        this.localBook = { ...newVal };
      },
      deep: true,
    },
    "localBook.imgUrl"() {
      this.imageExists = true;
    },
  },
  methods: {
    getBookImage(imageName) {
      if (!imageName) return "";
      return new URL(`/src/assets/images/${imageName}`, import.meta.url).href;
    },
    handleImageError() {
      this.imageExists = false;
    },
  },
};
</script>

<style scoped>
.book-cover-edit {
  max-height: 180px;
  object-fit: cover;
  border: 1px solid #dee2e6;
}
.no-image-box-edit {
  width: 130px;
  height: 180px;
  background-color: #e9ecef;
  border: 1px dashed #ced4da;
}
</style>
