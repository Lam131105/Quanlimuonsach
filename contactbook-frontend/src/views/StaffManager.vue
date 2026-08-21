<template>
  <div class="container mt-3">
    <!-- Tiêu đề trang -->
    <div class="row">
      <div class="col-12">
        <h4 class="text-center text-danger mb-4 font-weight-bold">
          <i class="fas fa-users-cog"></i> HỆ THỐNG QUẢN TRỊ NHÂN VIÊN
        </h4>
      </div>
    </div>

    <!-- Thanh công cụ: Ô tìm kiếm và nút Thêm mới -->
    <div class="row">
      <div class="col-12 mb-4">
        <div
          class="d-flex flex-wrap justify-content-between align-items-center mb-4 bg-light p-3 rounded shadow-sm"
        >
          <div
            class="search-box-wrapper w-100 mb-3 mb-md-0"
            style="max-width: 500px"
          >
            <StaffSearch v-model="filter" @submit="searchStaffs" />
          </div>
          <div>
            <button
              class="btn btn-success font-weight-bold shadow-sm"
              @click="goToAddStaff"
            >
              <i class="fas fa-user-plus"></i> Thêm nhân viên mới
            </button>
          </div>
        </div>

        <!-- Bảng hiển thị danh sách Nhân viên -->
        <h5 class="mb-3 font-weight-bold text-dark">
          <i class="fas fa-table"></i> Danh sách quản lý chi tiết
        </h5>

        <div
          v-if="filteredStaffs.length > 0"
          class="table-responsive bg-white rounded shadow-sm p-3 border"
        >
          <table class="table table-hover table-striped mb-0">
            <thead class="thead-light">
              <tr>
                <th scope="col" style="width: 10%">Mã NV</th>
                <th scope="col" style="width: 20%">Họ và Tên</th>
                <th scope="col" style="width: 20%">Thông tin liên hệ</th>
                <th scope="col" style="width: 15%">Giới tính / Ngày sinh</th>
                <th scope="col" style="width: 15%">Trạng thái</th>
                <th scope="col" style="width: 20%" class="text-center">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="staff in filteredStaffs" :key="staff._id">
                <td>
                  <span class="badge badge-secondary px-2 py-1">{{
                    staff.staffid
                  }}</span>
                </td>
                <td class="font-weight-bold text-dark">
                  {{ staff.lastName }} {{ staff.firstName }}
                </td>
                <td>
                  <div class="small">
                    <i class="fas fa-envelope text-muted mr-1"></i>
                    {{ staff.gmail }}
                  </div>
                  <div class="small mt-1">
                    <i class="fas fa-phone text-muted mr-1"></i>
                    {{ staff.phone }}
                  </div>
                </td>
                <td class="small text-muted">
                  <div>{{ staff.gender }}</div>
                  <div class="mt-1">{{ staff.birthDay }}</div>
                </td>
                <td>
                  <!-- Badge hiển thị trạng thái xanh / đỏ trực quan -->
                  <span
                    :class="
                      staff.isActive
                        ? 'badge badge-success'
                        : 'badge badge-danger'
                    "
                    class="px-2 py-1 shadow-sm font-weight-bold"
                  >
                    {{
                      staff.isActive ? "Đang hoạt động" : "Đã khóa tài khoản"
                    }}
                  </span>
                </td>
                <td class="text-center">
                  <button
                    class="btn btn-sm btn-warning mr-2 font-weight-bold text-white shadow-sm"
                    @click="goToEditStaff(staff._id)"
                  >
                    <i class="fas fa-edit"></i> Sửa
                  </button>

                  <!-- Nút Toggle Trạng thái thay thế nút Xóa -->
                  <button
                    :class="
                      staff.isActive
                        ? 'btn-outline-danger'
                        : 'btn-outline-primary'
                    "
                    class="btn btn-sm font-weight-bold shadow-sm"
                    @click="toggleStaffStatus(staff)"
                  >
                    <i
                      :class="
                        staff.isActive
                          ? 'fas fa-user-slash'
                          : 'fas fa-user-check'
                      "
                    ></i>
                    {{ staff.isActive ? " Khóa" : " Kích hoạt" }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Thông báo nếu danh sách trống hoặc tìm không ra kết quả -->
        <p v-else class="text-muted mt-3 text-center py-4 bg-light rounded">
          Không tìm thấy nhân viên nào thỏa mãn điều kiện.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import StaffService from "@/services/staff.service"; // 1. Mở import service thật ra
import StaffSearch from "@/components/StaffSearch.vue";

export default {
  components: {
    StaffSearch,
  },
  data() {
    return {
      staffs: [],
     filter: {
        name: "", // Từ khóa tìm kiếm gõ từ file con
      },
    };
  },
  computed: {
    filteredStaffs() {
      const searchKeyword = this.filter.name
        ? this.filter.name.trim().toLowerCase()
        : "";
      if (!searchKeyword) return this.staffs;

      return this.staffs.filter((staff) => {
        const nameMatch = staff.firstName?.toLowerCase().includes(searchKeyword);
        const emailMatch = staff.gmail?.toLowerCase().includes(searchKeyword);

        // Trúng 1 trong các điều kiện: Tên, SĐT, hoặc Chức vụ đều hiển thị
        return nameMatch || emailMatch;
      });
    },
  },
  methods: {
    // 2. Cập nhật hàm bốc dữ liệu thật từ DB lên giao diện
    async retrieveStaffs() {
      try {
        this.staffs = await StaffService.getAll();
      } catch (error) {
        console.error("Lỗi lấy danh sách nhân viên:", error);
      }
    },
    async searchStaffs() {
      await this.retrieveStaffs();
    },

    goToAddStaff() {
      this.$router.push({ name: "staffadd" });
    },
    goToEditStaff(id) {
      this.$router.push({ name: "staffedit", params: { id: id } });
    },

    // 3. 🎯 HÀM QUAN TRỌNG: Xử lý bật/tắt trạng thái hoạt động tài khoản
    async toggleStaffStatus(staff) {
      const currentStatus = staff.isActive;
      const newStatus = !currentStatus; // Đảo trạng thái: true -> false hoặc false -> true
      const actionText = currentStatus ? "KHÓA" : "KÍCH HOẠT";

      if (
        confirm(
          `Bạn có chắc chắn muốn ${actionText} tài khoản của nhân viên ${staff.lastName} ${staff.firstName}?`,
        )
      ) {
        try {
          // Gọi API PATCH xuống Backend để thay đổi trạng thái trong MongoDB
          await StaffService.updateStatus(staff._id, newStatus);

          alert(`${actionText} tài khoản nhân viên thành công!`);

          // Áp dụng "Cách 1" quen thuộc: Load lại danh sách mới nhất để cập nhật giao diện ngay lập tức
          await this.retrieveStaffs();
        } catch (error) {
          console.error("Lỗi thay đổi trạng thái nhân viên:", error);
          alert("Có lỗi xảy ra khi thay đổi trạng thái nhân viên!");
        }
      }
    },
  },
  mounted() {
    this.retrieveStaffs();
  },
};
</script>
<style scoped>
.table th,
.table td {
  vertical-align: middle;
}
</style>
