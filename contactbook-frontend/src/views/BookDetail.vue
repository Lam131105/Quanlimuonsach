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
              <i class="fas fa-building text-muted mr-1"></i> Mã sách:
            </label>
            <span class="info-value ml-2 text-dark font-weight-bold">
              {{ book.bookid }}
            </span>
          </div>

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
              <i class="fas fa-layer-group mr-2"></i
              ><strong>Số lượng còn lại trong kho:</strong>
            </span>
            <!-- Báo màu đỏ nếu hết sách -->
            <span
              :class="[
                'font-weight-bold',
                book.quantity > 0 ? 'text-success' : 'text-danger',
              ]"
            >
              {{ book.quantity > 0 ? book.quantity : "Hết sách trong kho" }}
            </span>
          </div>

          <div class="info-row mb-3">
            <span class="info-label text-muted">
              <i class="fas fa-calendar-alt mr-2"></i
              ><strong>Năm xuất bản:</strong>
            </span>
            <span class="text-muted">
              {{ book.year || "Chưa xác định" }}
            </span>
          </div>

          <div class="info-row mb-3">
            <span class="info-label text-muted">
              <strong>Đơn giá khi làm mất sách:</strong>
            </span>
            <span class="text-muted">
              {{ book.price || "Chưa xác định" }} VNĐ
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

          <!-- 🚨 PHẦN BỔ SUNG: KHU VỰC CHỌN SỐ LƯỢNG VÀ ĐẶT MƯỢN ONLINE -->
          <div class="booking-section border p-3 rounded bg-light mt-4">
            <h6 class="font-weight-bold text-dark mb-3">
              <i class="fas fa-shopping-basket text-primary mr-1"></i> ĐẶT MƯỢN
              TRỰC TUYẾN
            </h6>

            <div class="form-inline d-flex flex-wrap align-items-center">
              <div class="d-flex align-items-center mb-2 mb-sm-0 mr-3">
                <label class="mr-2 font-weight-bold text-secondary mb-0"
                  >Số lượng:</label
                >
                <input
                  type="number"
                  v-model.number="borrowQuantity"
                  class="form-control text-center font-weight-bold border-primary shadow-sm"
                  style="width: 80px"
                  min="1"
                  :max="book.quantity"
                  :disabled="book.quantity <= 0"
                />
              </div>

              <button
                type="button"
                class="btn btn-warning px-4 font-weight-bold shadow-sm rounded-pill text-dark"
                :disabled="book.quantity <= 0"
                @click="handleOnlineBooking"
              >
                <i class="fas fa-paper-plane mr-1"></i> Đặt Mượn Ngay
              </button>
            </div>
            <small class="form-text text-muted mt-2" v-if="book.quantity > 0">
              * Hệ thống sẽ tự động giữ chỗ sách cho bạn trong 3 ngày tại quầy
              tiếp tân. Hạn trả sách là 14 ngày kể từ thời điểm nhận sách tại quầy
            </small>
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
import LoanService from "@/services/loan.service"; // ➕ Import thêm LoanService để tạo phiếu mượn trực tuyến

export default {
  props: {
    id: { type: String, required: true },
  },
  data() {
    return {
      book: null,
      imageExists: true,
      categories: [],
      publishers: [],
      borrowQuantity: 1, // ➕ Biến lưu số lượng độc giả chọn mượn trực tuyến
    };
  },
  methods: {
    async getBook() {
      try {
        this.book = await BookService.get(this.id);
      } catch (error) {
        console.log(error);
        this.$router.push({ name: "notfound" });
      }
    },
    goBack() {
      this.$router.push({ name: "book" });
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
    async fetchPublishers() {
      try {
        this.publishers = await PublisherService.getAll();
      } catch (error) {
        console.error("Lỗi lấy danh sách NXB:", error);
      }
    },

    // 🚨 HÀM PHÁT TRIỂN MỚI: Xử lý khi Độc giả bấm nút "Đặt Mượn Ngay"
    async handleOnlineBooking() {
      // 1. Kiểm tra trạng thái đăng nhập của độc giả
      const userLocal = localStorage.getItem("user");
      if (!userLocal) {
        alert(
          "⚠️ Bạn cần đăng nhập tài khoản Độc giả trước khi thực hiện đặt sách trực tuyến!",
        );
        this.$router.push({ name: "login" });
        return;
      }

      const reader = JSON.parse(userLocal);

      // Phòng trường hợp tài khoản nhân viên vào nghịch bấm đặt trực tuyến
      if (reader.role !== "reader") {
        alert(
          "⚠️ Tính năng đặt sách trực tuyến chỉ dành riêng cho tài khoản Độc giả!",
        );
        return;
      }

      // 2. Kiểm tra số lượng sách hợp lệ
      if (this.borrowQuantity <= 0) {
        alert("Số lượng sách mượn phải lớn hơn 0!");
        return;
      }
      if (this.borrowQuantity > this.book.quantity) {
        alert(
          `Số lượng sách trong kho không đủ! Chỉ còn lại ${this.book.quantity} cuốn.`,
        );
        return;
      }

      // 3. Đóng gói dữ liệu chuẩn bị gửi lên API Backend
      const payload = {
        bookid: this.book._id,
        readerid: reader._id, // Lấy trực tiếp từ tài khoản đăng nhập
        quantity: this.borrowQuantity,
        status: "Pending", // 🔥 Trạng thái Chờ duyệt để kích hoạt hạn 3 ngày và trừ kho ở Backend
        staffid: null, // Đặt trực tuyến nên ban đầu chưa có nhân viên quầy xử lý
      };

      if (
        confirm(
          `Xác nhận đặt trực tuyến ${this.borrowQuantity} cuốn "${this.book.name}"?`,
        )
      ) {
        try {
          await LoanService.create(payload);

          alert(
            `🎉 Đặt sách trực tuyến thành công!\nSố lượng sách trong kho đã được cập nhật.\nVui lòng đến thư viện nhận sách trong vòng 3 ngày tới.`,
          );

          // Tải lại dữ liệu chi tiết sách để kho sách hiển thị cập nhật số mới vừa trừ
          await this.getBook();
          this.borrowQuantity = 1; // Reset số lượng về lại 1
        } catch (error) {
          console.error(error);
          alert(
            error.response?.data?.message ||
              "Đặt mượn sách thất bại. Vui lòng thử lại sau!",
          );
        }
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

.book-description-text {
  font-size: 0.95rem;
  line-height: 1.6;
  white-space: pre-line;
  max-height: 250px;
  overflow-y: auto;
  border-left: 4px solid #007bff;
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

.image-wrapper:hover {
  transform: scale(1.03);
}

/* Định dạng riêng cho khung đặt mượn */
.booking-section {
  border-left: 4px solid #ffc107 !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}
</style>
