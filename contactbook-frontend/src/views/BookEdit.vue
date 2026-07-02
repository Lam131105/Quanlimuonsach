<template>
  <div v-if="book" class="container mt-3" style="max-width: 800px">
    <h4 class="text-center text-warning mb-4 font-weight-bold">
      <i class="fas fa-edit"></i> CHỈNH SỬA THÔNG TIN SÁCH
    </h4>

    <div class="card p-4 shadow-sm bg-light">
      <form @submit.prevent="updateBook">
        <div class="row">
          <div class="col-md-4 text-center mb-3">
            <label class="font-weight-bold d-block mb-2"
              >Ảnh bìa hiện tại</label
            >
            <div class="mb-3">
              <img
                v-if="book.imgUrl && imageExists"
                :src="getBookImage(book.imgUrl)"
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
                v-model="book.imgUrl"
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
                v-model="book.name"
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
                v-model="book.auth"
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
                v-model="book.category"
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
                v-model="book.description"
              ></textarea>
            </div>
          </div>
        </div>

        <hr />
        <div class="d-flex justify-content-between mt-3">
          <button type="button" class="btn btn-secondary" @click="goBack">
            <i class="fas fa-arrow-left"></i> Quay lại
          </button>
          <div>
            <button
              type="button"
              class="btn btn-danger mr-2"
              @click="deleteBook"
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
  </div>
  <div v-else class="text-center mt-5">
    <p class="text-muted">Đang tải dữ liệu cuốn sách...</p>
  </div>
</template>

<script>
import BookService from "@/services/book.service";

export default {
  props: {
    id: { type: String, required: true }, // Nhận ID sách truyền từ URL thông qua router props
  },
  data() {
    return {
      book: null, // Đối tượng chứa dữ liệu sách cần sửa
      imageExists: true,
    };
  },
  watch: {
    // Nếu người dùng thay đổi text ô imgUrl thì reset trạng thái check ảnh
    "book.imgUrl": function () {
      this.imageExists = true;
    },
  },
  methods: {
    // Lấy thông tin chi tiết cuốn sách từ Backend dựa vào ID khi vừa vào trang
    async getBook() {
      try {
        this.book = await BookService.get(this.id);
      } catch (error) {
        console.log(error);
        // Nếu không tìm thấy ID sách, chuyển sang trang 404
        this.$router.push({ name: "notfound" });
      }
    },
    // Gửi dữ liệu đã chỉnh sửa về Backend để cập nhật
    async updateBook() {
      try {
        await BookService.update(this.id, this.book);
        alert("Cập nhật thông tin sách thành công!");
        this.goBack(); // Quay lại trang quản lý danh mục sách
      } catch (error) {
        console.log(error);
        alert("Có lỗi xảy ra khi cập nhật!");
      }
    },
    // Hàm Xóa cuốn sách này luôn nếu muốn
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
    getBookImage(imageName) {
      if (!imageName) return "";
      return new URL(`/src/assets/images/${imageName}`, import.meta.url).href;
    },
    handleImageError() {
      this.imageExists = false;
    },
  },
  // Kích hoạt lấy dữ liệu sách ngay khi trang Edit vừa được tải lên
  created() {
    this.getBook();
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
