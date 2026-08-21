<template>
  <div class="container mt-3">
    <!-- Tiêu đề trang -->
    <div class="row">
      <div class="col-12">
        <h4 class="text-center text-danger mb-4 font-weight-bold">
          <i class="fas fa-address-book"></i> HỆ THỐNG QUẢN LÝ ĐỘC GIẢ
        </h4>
      </div>
    </div>

    <!-- Thanh công cụ: Chỉ giữ lại ô tìm kiếm Real-time -->
    <div class="row">
      <div class="col-12 mb-4">
          <div
            class="search-box-wrapper w-100 mb-3 mb-md-0"
            style="max-width: 500px"
          >
            <ReaderSearch v-model="filter" @submit="searchReaders" />
          </div>

        <!-- Bảng hiển thị danh sách Độc giả -->
        <h5 class="mb-3 font-weight-bold text-dark">
          <i class="fas fa-table"></i> Danh sách độc giả hệ thống
        </h5>

        <div
          v-if="filteredReaders.length > 0"
          class="table-responsive bg-white rounded shadow-sm p-3 border"
        >
          <table class="table table-hover table-striped mb-0">
            <thead class="thead-light">
              <tr>
                <th scope="col" style="width: 10%">Mã ĐG</th>
                <th scope="col" style="width: 20%">Họ và Tên</th>
                <th scope="col" style="width: 25%">Liên hệ & Địa chỉ</th>
                <th scope="col" style="width: 15%">Giới tính / Ngày sinh</th>
                <th scope="col" style="width: 15%">Trạng thái</th>
                <th scope="col" style="width: 15%" class="text-center">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="reader in filteredReaders" :key="reader._id">
                <td>
                  <span class="badge badge-secondary px-2 py-1">{{
                    reader.readerid
                  }}</span>
                </td>
                <td class="font-weight-bold text-dark">
                  {{ reader.lastName }} {{ reader.firstName }}
                </td>
                <td>
                  <div class="small">
                    <i class="fas fa-envelope text-muted mr-1"></i>
                    {{ reader.gmail }}
                  </div>
                  <div class="small mt-1">
                    <i class="fas fa-phone text-muted mr-1"></i>
                    {{ reader.phone }}
                  </div>
                  <div class="small mt-1 text-muted">
                    <i class="fas fa-map-marker-alt mr-1"></i>
                    {{ reader.address }}
                  </div>
                </td>
                <td class="small text-muted">
                  <div>{{ reader.gender }}</div>
                  <div class="mt-1">{{ reader.birthDay }}</div>
                </td>
                <td>
                  <!-- Badge trạng thái hoạt động -->
                  <span
                    :class="
                      reader.isActive
                        ? 'badge badge-success'
                        : 'badge badge-danger'
                    "
                    class="px-2 py-1 shadow-sm font-weight-bold"
                  >
                    {{ reader.isActive ? "Đang hoạt động" : "Đã khóa" }}
                  </span>
                </td>
                <td class="text-center">
                  <!-- Nút Thay đổi trạng thái tài khoản duy nhất -->
                  <button
                    :class="
                      reader.isActive
                        ? 'btn-outline-danger'
                        : 'btn-outline-primary'
                    "
                    class="btn btn-sm font-weight-bold shadow-sm btn-block"
                    @click="toggleReaderStatus(reader)"
                  >
                    <i
                      :class="
                        reader.isActive
                          ? 'fas fa-user-slash'
                          : 'fas fa-user-check'
                      "
                    ></i>
                    {{ reader.isActive ? " Khóa tài khoản" : " Kích hoạt" }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Thông báo nếu không tìm thấy dữ liệu -->
        <p v-else class="text-muted mt-3 text-center py-4 bg-light rounded">
          Không tìm thấy độc giả nào thỏa mãn điều kiện.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import ReaderService from "@/services/reader.service"; // File service frontend của bạn
import ReaderSearch from "@/components/ReaderSearch.vue"; 

export default {
  components: {
    ReaderSearch,
  },
  data() {
    return {
      readers: [], // Mảng chứa toàn bộ độc giả
      filter: {
        name: "", // Từ khóa tìm kiếm gõ từ file con
      },
    };
  },
  computed: {
    // Bộ lọc Real-time tìm theo Tên, Gmail, Số điện thoại
    filteredReaders() {
      const searchKeyword = this.filter.name
        ? this.filter.name.trim().toLowerCase()
        : "";
      if (!searchKeyword) return this.readers;

      return this.readers.filter((reader) => {
        const nameMatch = reader.firstName
          ?.toLowerCase()
          .includes(searchKeyword);
        const emailMatch = reader.gmail?.toLowerCase().includes(searchKeyword);

        return nameMatch || emailMatch;
      });
    },
  },
  methods: {
    // Lấy toàn bộ danh sách độc giả từ MongoDB thông qua API
    async retrieveReaders() {
      try {
        this.readers = await ReaderService.getAll();
      } catch (error) {
        console.error("Lỗi lấy danh sách độc giả:", error);
      }
    },
    async searchReaders() {
      this.retrieveReaders();
    },

    // Xử lý bật/tắt (Khóa/Kích hoạt) tài khoản độc giả
    async toggleReaderStatus(reader) {
      const currentStatus = reader.isActive;
      const newStatus = !currentStatus;
      const actionText = currentStatus ? "KHÓA" : "KÍCH HOẠT";

      if (
        confirm(
          `Bạn có chắc chắn muốn ${actionText} tài khoản của độc giả ${reader.lastName} ${reader.firstName}?`,
        )
      ) {
        try {
          // Gọi hàm updateStatus ở file reader.service.js frontend
          await ReaderService.updateStatus(reader._id, newStatus);

          alert(`${actionText} tài khoản độc giả thành công!`);

          // Tải lại danh sách mới để cập nhật giao diện
          await this.retrieveReaders();
        } catch (error) {
          console.error("Lỗi thay đổi trạng thái độc giả:", error);
          alert("Có lỗi xảy ra khi cập nhật trạng thái độc giả!");
        }
      }
    },
  },
  // Tự động load danh sách độc giả khi vừa mở trang
  mounted() {
    this.retrieveReaders();
  },
};
</script>

<style scoped>
.table th,
.table td {
  vertical-align: middle;
}
</style>
