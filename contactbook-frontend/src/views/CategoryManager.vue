<template>
  <div class="container mt-3">
    <!-- Tiêu đề trang -->
    <div class="row">
      <div class="col-12">
        <h4 class="text-center text-danger mb-4 font-weight-bold">
          <i class="fas fa-tags"></i> HỆ THỐNG QUẢN TRỊ THỂ LOẠI
        </h4>
      </div>
    </div>

    <!-- Thanh công cụ: Tìm kiếm và các nút Thêm / Xóa tất cả -->
    <div class="row">
      <div class="col-12 mb-4">
        <div
          class="d-flex flex-wrap justify-content-between align-items-center mb-4 bg-light p-3 rounded shadow-sm"
        >
          <div
            class="search-box-wrapper w-100 max-w-md mb-2 mb-md-0"
            style="max-width: 400px"
          >
            <!-- Sử dụng lại InputSearch giống bên quản lý sách -->
            <InputSearch
              v-model="searchText"
              @submit="searchCategories"
              placeholder="Tìm tên thể loại, mô tả..."
            />
          </div>
          <div>
            <button
              class="btn btn-success font-weight-bold shadow-sm mr-2"
              @click="goToAddCategory"
            >
              <i class="fas fa-plus-circle"></i> Thêm thể loại mới
            </button>
            <button
              class="btn btn-outline-danger font-weight-bold shadow-sm"
              @click="removeAllCategories"
            >
              <i class="fas fa-trash-alt"></i> Xóa tất cả
            </button>
          </div>
        </div>

        <!-- Bảng hiển thị danh sách chi tiết (Hiển thị luôn thông tin ra ngoài) -->
        <h5 class="mb-3 font-weight-bold text-dark">
          <i class="fas fa-table"></i> Danh sách quản lý chi tiết
        </h5>

        <div
          v-if="filteredCategories.length > 0"
          class="table-responsive bg-white rounded shadow-sm p-3 border"
        >
          <table class="table table-hover table-striped mb-0">
            <thead class="thead-light">
              <tr>
                <th scope="col" style="width: 15%">Mã thể loại</th>
                <th scope="col" style="width: 25%">Tên thể loại</th>
                <th scope="col" style="width: 40%">Mô tả / Ghi chú</th>
                <th scope="col" style="width: 20%" class="text-center">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="category in filteredCategories" :key="category._id">
                <td>
                  <span class="badge badge-secondary px-2 py-1">{{
                    category.categoryid
                  }}</span>
                </td>
                <td class="font-weight-bold text-dark">{{ category.name }}</td>
                <td class="text-muted small" style="white-space: pre-line">
                  {{
                    category.description || "Không có mô tả cho thể loại này."
                  }}
                </td>
                <td class="text-center">
                  <button
                    class="btn btn-sm btn-warning mr-2 font-weight-bold text-white shadow-sm"
                    @click="goToEditCategory(category._id)"
                  >
                    <i class="fas fa-edit"></i> Sửa
                  </button>
                  <button
                    class="btn btn-sm btn-danger font-weight-bold shadow-sm"
                    @click="deleteCategory(category._id)"
                  >
                    <i class="fas fa-trash-alt"></i> Xóa
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Thông báo nếu không tìm thấy dữ liệu -->
        <p v-else class="text-muted mt-3 text-center py-4 bg-light rounded">
          Không tìm thấy thể loại nào thỏa mãn điều kiện.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import InputSearch from "@/components/InputSearch.vue";
import CategoryService from "@/services/category.service"; // Giả định bạn đã có file này

export default {
  components: {
    InputSearch,
  },
  data() {
    return {
      categories: [], // Mảng chứa danh sách thể loại lấy từ Backend
      searchText: "", // Từ khóa tìm kiếm
    };
  },
  computed: {
    // Bộ lọc thể loại Real-time dựa trên Tên hoặc Mô tả
    filteredCategories() {
      if (!this.searchText) return this.categories;
      return this.categories.filter((cat) => {
        const nameMatch = cat.name
          ?.toLowerCase()
          .includes(this.searchText.toLowerCase());
        const descMatch = cat.description
          ?.toLowerCase()
          .includes(this.searchText.toLowerCase());
        return nameMatch || descMatch;
      });
    },
  },
  methods: {
    // Hàm bốc dữ liệu từ API Backend về
    async retrieveCategories() {
      try {
        this.categories = await CategoryService.getAll();
      } catch (error) {
        console.log("Lỗi lấy danh sách thể loại:", error);
      }
    },
    // Hàm kích hoạt khi nhấn Enter hoặc nút tìm kiếm
    async searchCategories() {
      this.retrieveCategories();
    },

    // --- CÁC HÀM XỬ LÝ SỰ KIỆN NÚT BẤM (Đã tạo trước logic điều hướng / xác nhận giống Book.vue) ---
    goToAddCategory() {
      this.$router.push({ name: "categoryadd" });
    },
    goToEditCategory(id) {
      this.$router.push({ name: "categoryedit", params: { id: id } });
    },

    async deleteCategory(id) {
      if (confirm("Bạn có chắc chắn muốn XÓA thể loại này khỏi hệ thống?")) {
        try {
          await CategoryService.delete(id); // Gọi API xóa
          alert("Xóa thể loại thành công!");

          // 💡 DÒNG QUAN TRỌNG: Gọi lại hàm này để load lại danh sách mới
          await this.retrieveCategories();
        } catch (error) {
          console.log(error);
        }
      }
    },

    async removeAllCategories() {
      if (confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa TOÀN BỘ thể loại?")) {
        try {
          await CategoryService.deleteAll(); // Gọi API xóa sạch
          alert("Đã xóa sạch toàn bộ thể loại!");

          // 💡 DÒNG QUAN TRỌNG: Gọi lại để danh sách trống trơn ngay lập tức
          await this.retrieveCategories();
        } catch (error) {
          console.log(error);
        }
      }
    },
  },
  // Vừa vào trang thì tự động load dữ liệu ngay
  mounted() {
    this.retrieveCategories();
  },
};
</script>

<style scoped>
/* Bạn có thể thêm CSS tùy chỉnh tại đây nếu cần */
.table th,
.table td {
  vertical-align: middle; /* Căn giữa nội dung theo chiều dọc */
}
</style>
