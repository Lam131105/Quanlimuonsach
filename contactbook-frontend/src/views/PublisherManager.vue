<template>
  <div class="container mt-3">
    <!-- Tiêu đề trang -->
    <div class="row">
      <div class="col-12">
        <h4 class="text-center text-danger mb-4 font-weight-bold">
          <i class="fas fa-building"></i> HỆ THỐNG QUẢN TRỊ NHÀ XUẤT BẢN
        </h4>
      </div>
    </div>

    <!-- Thanh công cụ: Ô tìm kiếm và Các nút chức năng chính -->
    <div class="row">
      <div class="col-12 mb-4">
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 bg-light p-3 rounded shadow-sm">
          
          <!-- Thanh tìm kiếm NXB -->
          <div class="search-box-wrapper w-100 mb-3 mb-md-0" style="max-width: 500px">
            <PublisherSearch v-model="filter" @submit="searchPublishers" />
          </div>

          <!-- Các nút thao tác thêm/xóa -->
          <div>
            <button
              class="btn btn-success font-weight-bold shadow-sm mr-2"
              @click="goToAddPublisher"
            >
              <i class="fas fa-plus-circle"></i> Thêm NXB mới
            </button>
            <button
              class="btn btn-outline-danger font-weight-bold shadow-sm"
              @click="removeAllPublishers"
            >
              <i class="fas fa-trash-alt"></i> Xóa tất cả
            </button>
          </div>
        </div>

        <!-- Bảng hiển thị danh sách Nhà xuất bản -->
        <h5 class="mb-3 font-weight-bold text-dark">
          <i class="fas fa-table"></i> Danh sách quản lý chi tiết
        </h5>

        <div
          v-if="filteredPublishers.length > 0"
          class="table-responsive bg-white rounded shadow-sm p-3 border"
        >
          <table class="table table-hover table-striped mb-0">
            <thead class="thead-light">
              <tr>
                <th scope="col" style="width: 15%">Mã NXB</th>
                <th scope="col" style="width: 30%">Tên Nhà xuất bản</th>
                <th scope="col" style="width: 35%">Địa chỉ</th>
                <th scope="col" style="width: 20%" class="text-center">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pub in filteredPublishers" :key="pub._id">
                <td>
                  <span class="badge badge-secondary px-2 py-1">
                    {{ pub.publisherid }}
                  </span>
                </td>
                <td class="font-weight-bold text-dark">{{ pub.name }}</td>
                <td class="text-muted small">
                  {{ pub.address || "Chưa cập nhật địa chỉ" }}
                </td>
                <td class="text-center">
                  <button
                    class="btn btn-sm btn-warning mr-2 font-weight-bold text-white shadow-sm"
                    @click="goToEditPublisher(pub._id)"
                  >
                    <i class="fas fa-edit"></i> Sửa
                  </button>
                  <button
                    class="btn btn-sm btn-danger font-weight-bold shadow-sm"
                    @click="deletePublisher(pub._id)"
                  >
                    <i class="fas fa-trash-alt"></i> Xóa
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Thông báo nếu danh sách rỗng hoặc tìm không ra kết quả -->
        <p v-else class="text-muted mt-3 text-center py-4 bg-light rounded">
          Không tìm thấy nhà xuất bản nào thỏa mãn điều kiện.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import PublisherService from "@/services/publisher.service"; // File service frontend của bạn
import PublisherSearch from "@/components/PublisherSearch.vue";
export default {
  components: {
    PublisherSearch,
  },
  data() {
    return {
      publishers: [], // Mảng hứng danh sách NXB từ DB về
      filter: {
        name: "", // Chuỗi từ khóa tìm kiếm
      },
    };
  },
  computed: {
    // Bộ lọc Real-time tìm kiếm theo cả Tên NXB và Địa chỉ
filteredPublishers() {
      const searchKeyword = this.filter.name ? this.filter.name.trim().toLowerCase() : "";
      if (!searchKeyword) return this.publishers;

      return this.publishers.filter((pub) => {
        const nameMatch = pub.name?.toLowerCase().includes(searchKeyword);
        const addressMatch = pub.address?.toLowerCase().includes(searchKeyword);
        return nameMatch || addressMatch; // Tìm trúng tên hoặc trúng địa chỉ đều được
      });
    },
  },
  methods: {
    // Hàm bốc dữ liệu từ API Backend về đổ vào bảng
    async retrievePublishers() {
      try {
        this.publishers = await PublisherService.getAll();
      } catch (error) {
        console.error("Lỗi lấy danh sách nhà xuất bản:", error);
      }
    },
    // Chạy lại hàm load dữ liệu khi bấm nút tìm kiếm
    async searchPublishers() {
      await this.retrievePublishers();
    },

    // --- CÁC HÀM ĐỢI SẴN GIAO DIỆN NÚT BẤM THEO YÊU CẦU ---
    goToAddPublisher() {
      this.$router.push({ name: "publisheradd" });
    },
    goToEditPublisher(id) {
      this.$router.push({ name: "publisheredit", params: { id: id } });
    },
    async deletePublisher(id) {
      if (
        confirm("Bạn có chắc chắn muốn XÓA nhà xuất bản này khỏi hệ thống?")
      ) {
        try {
          await PublisherService.delete(id);
          alert("Xóa nhà xuất bản thành công!");
          // Gọi Cách 1 (load lại data từ DB) bạn vừa chọn để cập nhật giao diện ngay
          await this.retrievePublishers();
        } catch (error) {
          console.error("Lỗi khi xóa nhà xuất bản:", error);
        }
      }
    },
    async removeAllPublishers() {
      if (
        confirm(
          "CẢNH BÁO NGUY HIỂM: Bạn có chắc chắn muốn xóa TOÀN BỘ nhà xuất bản?",
        )
      ) {
        try {
          await PublisherService.deleteAll();
          alert("Đã xóa sạch toàn bộ nhà xuất bản!");
          await this.retrievePublishers();
        } catch (error) {
          console.error("Lỗi khi xóa tất cả nhà xuất bản:", error);
        }
      }
    },
  },
  // Vừa vào trang quản trị NXB là tự bốc danh sách hiển thị luôn
  mounted() {
    this.retrievePublishers();
  },
};
</script>

<style scoped>
.table th,
.table td {
  vertical-align: middle;
}
</style>
