
<template>
  <div class="card p-4 shadow-sm bg-light">
    <!-- CHÍNH SÁCH: Gọi hàm submitBook trong script chứ không emit trực tiếp localBook -->
    <form @submit.prevent="submitBook">
      <div class="row">
        <!-- Cột bên trái: Ảnh bìa và Chọn file -->
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

          <!-- Ô chọn file ảnh -->
          <div class="form-group mb-3">
            <label for="bookImage" class="fw-bold">Chọn ảnh bìa sách:</label>
            <input
              type="file"
              id="bookImage"
              class="form-control"
              accept="image/*"
              @change="handleFileUpload"
            />

            <!-- Khu vực hiển thị ảnh xem trước -->
            <div v-if="imagePreview" class="mt-2 text-center">
              <img
                :src="imagePreview"
                alt="Xem trước"
                class="img-thumbnail"
                style="max-height: 150px"
              />
            </div>
          </div>
        </div>

        <!-- Cột bên phải: Các thông tin chi tiết của sách -->
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
            <label for="publisher" class="font-weight-bold">
              <i class="fas fa-building text-muted mr-1"></i> Nhà xuất bản:
            </label>
            <select
              id="publisher"
              class="form-control"
              v-model="localBook.publisherId"
              required
            >
              <option value="" disabled selected>
                -- Chọn nhà xuất bản --
              </option>
              <option v-for="pub in publishers" :key="pub._id" :value="pub._id">
                {{ pub.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="font-weight-bold d-block">
              <i class="fas fa-tags text-muted mr-1"></i> Thể loại sách (Chọn
              nhiều):
            </label>
            <div
              class="category-checkbox-container p-3 border rounded bg-white"
            >
              <div
                v-for="cat in categories"
                :key="cat._id"
                class="form-check form-check-inline mb-2"
              >
                <input
                  class="form-check-input"
                  type="checkbox"
                  :id="'cat-' + cat._id"
                  :value="cat._id"
                  v-model="localBook.categoryIds"
                />
                <label class="form-check-label mr-3" :for="'cat-' + cat._id">
                  {{ cat.name }}
                </label>
              </div>
              <div v-if="categories.length === 0" class="text-muted small">
                Đang tải dữ liệu thể loại...
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="auth" class="font-weight-bold">
              <i class="fas fa-user-edit text-muted mr-1"></i> Số lượng:
            </label>
            <input
              type="number"
              id="quantity"
              class="form-control"
              v-model="localBook.quantity"
              required
            />
          </div>

          <div class="form-group">
            <label for="auth" class="font-weight-bold">
              <i class="fas fa-user-edit text-muted mr-1"></i> Đơn giá:
            </label>
            <input
              type="number"
              id="price"
              class="form-control"
              v-model="localBook.price"
              required
            />
          </div>

          <div class="form-group">
            <label for="auth" class="font-weight-bold">
              <i class="fas fa-user-edit text-muted mr-1"></i> Năm:
            </label>
            <input
              type="number"
              id="quantity"
              class="form-control"
              v-model="localBook.year"
            />
          </div>

          <div class="form-group">
            <label for="description" class="font-weight-bold">
              <i class="fas fa-align-left text-muted mr-1"></i> Mô tả sách:
            </label>
            <textarea
              id="description"
              class="form-control"
              rows="3"
              v-model="localBook.description"
            ></textarea>
          </div>
        </div>
      </div>

      <hr />

      <!-- Thanh nút bấm điều hướng hành động -->
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
            class="btn btn-danger me-2"
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
// Import 2 service bưu tá để lấy dữ liệu đổ vào form
import CategoryService from "@/services/category.service";
import PublisherService from "@/services/publisher.service";
import bookService from "@/services/book.service";
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
      // Đảm bảo cấu trúc sách có mảng categoryIds và chuỗi publisherId ban đầu để tránh lỗi undefined
      localBook: {
        categoryIds: [],
        publisherId: "",
        ...this.book,
      },
      categories: [], // Danh sách thể loại lấy từ API
      publishers: [], // Danh sách nhà xuất bản lấy từ API
      imageExists: true,
      selectedFile: null, // Lưu trữ file ảnh thực tế (nhị phân)
      imagePreview: null, // Lưu đường dẫn tạm thời để hiển thị lên màn hình
    };
  },
  watch: {
    // Cập nhật lại dữ liệu local nếu props từ ngoài truyền vào thay đổi đột ngột
    book: {
      handler(newVal) {
        this.localBook = {
          categoryIds: [],
          publisherId: "",
          ...newVal,
        };
      },
      deep: true,
    },
    "localBook.imgUrl"() {
      this.imageExists = true;
    },
  },
  methods: {
    // Hàm gọi API lấy danh sách Thể loại
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
    getBookImage(imageName) {
      if (!imageName) return "";
      return new URL(`/src/assets/imgbook/${imageName}`, import.meta.url).href;
    },

    handleImageError() {
      this.imageExists = false;
    },

    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      // Xóa bộ nhớ của ảnh xem trước cũ để tránh nặng RAM trình duyệt
      if (this.imagePreview) {
        URL.revokeObjectURL(this.imagePreview);
      }

      this.selectedFile = file; // Lưu file thật
      this.imagePreview = URL.createObjectURL(file); // Tạo đường dẫn ảo để xem trước
    },

submitBook() {
    // 1. Tạo một đối tượng FormData mới hoàn toàn
    const formData = new FormData();

    // 2. Đính kèm các trường văn bản thô
    formData.append("name", this.localBook.name || "");
    formData.append("auth", this.localBook.auth || "");
    formData.append("publisherId", this.localBook.publisherId || "");
    formData.append("year", this.localBook.year || "");
    formData.append("price", this.localBook.price || "");
    formData.append("quantity", this.localBook.quantity || "");
    formData.append("description", this.localBook.description || "");

    // Nếu có mảng thể loại sách, chuyển thành chuỗi JSON hoặc append từng phần tử
    if (this.localBook.categoryIds && this.localBook.categoryIds.length > 0) {
      this.localBook.categoryIds.forEach(id => {
        formData.append("categoryIds[]", id);
      });
    }

    // 3. ĐÍNH KÈM FILE ẢNH (Quan trọng nhất)
    // Hãy chắc chắn rằng bạn chọn ảnh thì biến này phải có dữ liệu nhé
    if (this.selectedFile) {
      formData.append("image", this.selectedFile);
    } else {
      // Nếu chỉnh sửa sách mà không đổi ảnh, gửi lại URL ảnh cũ để Backend không bắt bẻ
      formData.append("imgUrl", this.localBook.imgUrl || "");
    }

    // Mẹo kiểm tra nhanh xem file đã vào FormData chưa (vì console.log(formData) sẽ ra rỗng)
    console.log("File ảnh thực tế gửi đi:", formData.get("image"));

    // 4. Bắn sự kiện kèm cục formData ra cho component cha xử lý gọi API
    this.$emit("submit", formData);
  },

    resetForm() {
      // Thu hồi bộ nhớ ảnh xem trước để tránh rò rỉ RAM
      if (this.imagePreview) {
        URL.revokeObjectURL(this.imagePreview);
      }

      // CHÍNH SÁCH: Reset trên localBook chứ không gán lại vào prop 'this.book'
      this.localBook = {
        name: "",
        year: "",
        publisherId: "",
        price: "",
        categoryIds: [],
      };

      this.selectedFile = null;
      this.imagePreview = null;

      // Xóa tên file hiển thị trên thẻ input file HTML
      const fileInput = document.getElementById("bookImage");
      if (fileInput) fileInput.value = "";
    },
  },
  // Vừa vào form thì đi bốc dữ liệu từ DB về ngay
  created() {
    this.fetchCategories();
    this.fetchPublishers();
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
