<template>
  <div class="container mt-3">
    <div class="row">
      <div class="col-md-12">
        <h4 class="text-center text-secondary mb-4">
          <i class="fas fa-address-book"></i> HỆ THỐNG QUẢN LÝ MƯỢN SÁCH
        </h4>
      </div>
    </div>

    <div class="row">
      <div class="col-md-7">
        <div class="mb-3">
          <InputSearch v-model="searchText" @submit="searchLoans" />
        </div>

        <h5 class="mt-4">
          <i class="fas fa-list"></i> Danh sách người mượn
        </h5>

        <LoanList v-if="filteredLoans.length > 0" :loans="filteredLoans" v-model:activeIndex="activeIndex" />
        <p v-else class="text-muted mt-3">Không có phiếu mượn sách nào.</p>

        <!-- <div class="mt-3 d-flex justify-content-between">
          <button class="btn btn-sm btn-primary" @click="goToAddLoan">
            <i class="fas fa-plus"></i> Thêm phiếu mới
          </button>
          <button class="btn btn-sm btn-danger" @click="removeAllLoans">
            <i class="fas fa-trash-alt"></i> Xóa tất cả
          </button>
        </div> -->
      </div>

      <div class="col-md-5">
        <div v-if="activeLoan">
          <h5 class="text-info">
            <i class="fas fa-info-circle"></i> Chi tiết phiếu mượn
          </h5>
          <div class="card p-3 shadow-sm bg-light">
            <LoanCard :loan="activeLoan" />

            <!-- <div class="mt-3">
              <router-link :to="{
                name: 'loan.edit',
                params: { id: activeLoan._id },
              }">
                <button class="btn btn-sm btn-warning">
                  <i class="fas fa-edit"></i> Chỉnh sửa thông tin
                </button>
              </router-link>
            </div> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import InputSearch from "@/components/InputSearch.vue";
import LoanList from "@/components/LoanList.vue";
import LoanCard from "@/components/LoanCard.vue";
import LoanService from "@/services/loan.service";

export default {
  components: {
    InputSearch,
    LoanList,
    LoanCard,
  },
  data() {
    return {
      loans: [],
      searchText: "",
      activeIndex: -1,
    };
  },
  watch: {
    // Giám sát tìm kiếm, nếu chuỗi tìm kiếm thay đổi thì reset vị trí đang chọn
    searchText() {
      this.activeIndex = -1;
    },
  },
  computed: {
    // Lọc danh sách người mượn dựa trên chuỗi tìm kiếm searchText
    filteredLoans() {
      if (!this.searchText) return this.loans;
      return this.loans.filter((loan) => {
        // Tìm kiếm không phân biệt chữ hoa chữ thường theo Tên người mượn hoặc Tên sách
        const nameMatch = loan.borrowerName?.toLowerCase().includes(this.searchText.toLowerCase());
        const bookMatch = loan.bookTitle?.toLowerCase().includes(this.searchText.toLowerCase());
        return nameMatch || bookMatch;
      });
    },
    // Trả về phiếu mượn cụ thể đang được người dùng click chọn
    activeLoan() {
      if (this.activeIndex < 0) return null;
      return this.filteredLoans[this.activeIndex];
    },
  },
  methods: {
    // Hàm gọi API lấy tất cả phiếu mượn từ backend
    async retrieveLoans() {
      try {
        this.loans = await LoanService.getAll();
      } catch (error) {
        console.log(error);
      }
    },
    // Hàm xử lý tìm kiếm khi bấm nút
    async searchLoans() {
      try {
        this.activeIndex = -1; // Reset lại dòng được chọn về mặc định khi tìm kiếm mới
        this.loans = await LoanService.getAll(); // Lấy lại dữ liệu mới nhất
      } catch (error) {
        console.log(error);
      }
    },
    // Hàm xóa toàn bộ phiếu mượn
    // async removeAllLoans() {
    //   if (confirm("Bạn có chắc chắn muốn xóa TOÀN BỘ danh sách mượn sách?")) {
    //     try {
    //       await LoanService.deleteAll();
    //       this.activeIndex = -1;
    //       this.retrieveLoans();
    //     } catch (error) {
    //       console.log(error);
    //     }
    //   }
    // },
    // goToAddLoan() {
    //   this.$router.push({ name: "loan.add" });
    // },
  },
  // Khi trang web vừa tải xong, tự động gọi API lấy dữ liệu lên
  mounted() {
    this.retrieveLoans();
  },
};
</script>
