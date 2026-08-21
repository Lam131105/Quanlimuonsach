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
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 bg-light p-3 rounded shadow-sm">
          
          <!-- Nạp bộ lọc tìm kiếm mới vào đúng vị trí thiết kế -->
          <div class="search-box-wrapper w-100 mb-3 mb-md-0" style="max-width: 500px">
            <CategoryFilter v-model="filter" @submit="searchCategories" />
          </div>

          <!-- Các nút chức năng hành động -->
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

        <!-- Bảng hiển thị danh sách chi tiết -->
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
                  <span class="badge badge-secondary px-2 py-1">
                    {{ category.categoryid }}
                  </span>
                </td>
                <td class="font-weight-bold text-dark">{{ category.name }}</td>
                <td class="text-muted small" style="white-space: pre-line">
                  {{ category.description || "Không có mô tả cho thể loại này." }}
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
import CategoryService from "@/services/category.service";
import CategoryFilter from "@/components/CategorySearch.vue"; 

export default {
  components: {
    CategoryFilter
  },
  data() {
    return {
      categories: [], // Mảng chứa gốc từ Backend về
      filter: {
        name: "", // Đồng bộ trường dữ liệu với v-model của bộ lọc
      },
    };
  },
  computed: {
    // 💡 Sửa lại logic: Lọc Real-time trực tiếp dựa theo giá trị nhập vào `this.filter.name`
    filteredCategories() {
      const searchKeyword = this.filter.name ? this.filter.name.trim().toLowerCase() : "";
      if (!searchKeyword) return this.categories;

      return this.categories.filter((cat) => {
        const nameMatch = cat.name?.toLowerCase().includes(searchKeyword);
        const descMatch = cat.description?.toLowerCase().includes(searchKeyword);
        return nameMatch || descMatch;
      });
    },
  },
  methods: {
    async retrieveCategories() {
      try {
        this.categories = await CategoryService.getAll();
      } catch (error) {
        console.log("Lỗi lấy danh sách thể loại:", error);
      }
    },
    // Khi nhấn Enter hoặc Click nút kính lúp, hệ thống sẽ đồng bộ làm tươi danh sách từ Backend
    async searchCategories() {
      await this.retrieveCategories();
    },

    goToAddCategory() {
      this.$router.push({ name: "categoryadd" });
    },
    goToEditCategory(id) {
      this.$router.push({ name: "categoryedit", params: { id: id } });
    },

    async deleteCategory(id) {
      if (confirm("Bạn có chắc chắn muốn XÓA thể loại này khỏi hệ thống?")) {
        try {
          await CategoryService.delete(id);
          alert("Xóa thể loại thành công!");
          await this.retrieveCategories();
        } catch (error) {
          console.log(error);
        }
      }
    },

    async removeAllCategories() {
      if (confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa TOÀN BỘ thể loại?")) {
        try {
          await CategoryService.deleteAll();
          alert("Đã xóa sạch toàn bộ thể loại!");
          await this.retrieveCategories();
        } catch (error) {
          console.log(error);
        }
      }
    },
  },
  mounted() {
    this.retrieveCategories();
  },
};
</script>

<style scoped>
.table th,
.table td {
  vertical-align: middle;
}
</style>