<template>
  <div class="card p-4 shadow border-0 rounded-lg bg-white">
    <!-- Thêm hiệu ứng hiển thị khi đang tra cứu mã để nhân viên biết -->
    <div v-if="isSearching" class="text-center my-3 text-primary">
      <div class="spinner-border spinner-border-sm mr-2" role="status"></div>
      <span>Đang xác thực thông tin mã ngắn...</span>
    </div>

    <form @submit.prevent="submitForm" v-show="!isSearching">

      <!-- 1. Mã Nhân Viên (Hiển thị Mã ngắn gọn + Tên để nhân viên dễ kiểm tra) -->
      <div class="form-group mb-3">
        <label class="font-weight-bold text-secondary">
          <i class="fas fa-user-shield mr-1"></i> Nhân viên đang thao tác:
        </label>
        <input
          type="text"
          v-model="displayStaffInfo"
          class="form-control bg-light text-success font-weight-bold"
          readonly
          required
        />
        <small class="form-text text-muted"
          >Hệ thống tự động ghi nhận theo tài khoản đăng nhập của bạn.</small
        >
      </div>

      <!-- 2. Ô nhập Mã Độc giả ngắn (Ví dụ: DG001) -->
      <div class="form-group mb-3">
        <label class="font-weight-bold text-dark">
          <i class="fas fa-id-card mr-1"></i> Mã Độc giả (Ví dụ: DG001):
        </label>
        <input
          type="text"
          v-model="shortCodes.readerid"
          class="form-control border-primary text-uppercase"
          required
          placeholder="Nhập mã thẻ độc giả ngắn gọn..."
        />
      </div>

      <!-- 3. Ô nhập Mã Sách ngắn (Ví dụ: MS001) -->
      <div class="form-group mb-3">
        <label class="font-weight-bold text-dark">
          <i class="fas fa-book mr-1"></i> Mã Sách (Ví dụ: MS001):
        </label>
        <input
          type="text"
          v-model="shortCodes.bookid"
          class="form-control border-primary text-uppercase"
          required
          placeholder="Nhập mã sách ngắn gọn..."
        />
      </div>

      <!-- 4. Số lượng mượn -->
      <div class="form-group mb-4">
        <label class="font-weight-bold text-dark">
          <i class="fas fa-layer-group mr-1"></i> Số lượng mượn:
        </label>
        <input
          type="number"
          v-model.number="shortCodes.quantity"
          class="form-control"
          min="1"
          required
        />
      </div>

      <hr class="my-4" />

      <!-- 5. Các nút nút bấm hành động -->
      <div class="d-flex justify-content-between align-items-center">
        <button
          type="button"
          class="btn btn-outline-secondary px-4"
          @click="$emit('cancel')"
        >
          <i class="fas fa-arrow-left mr-1"></i> Quay lại
        </button>

        <button
          type="submit"
          class="btn btn-primary px-4 font-weight-bold shadow-sm"
          :disabled="isSearching"
        >
          <i class="fas fa-check mr-1"></i> {{ submitButtonText }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import BookService from "@/services/book.service";
import ReaderService from "@/services/reader.service";

export default {
  name: "LoanForm",
  props: {
    loan: {
      type: Object,
      default: () => ({ readerid: "", bookid: "", quantity: 1, status: "Borrowed", staffid: "" })
    },
    submitButtonText: {
      type: String,
      default: "Hoàn Tất"
    }
  },
  data() {
    return {
      isSearching: false,
      displayStaffInfo: "", // 🎯 Biến dùng riêng để HIỂN THỊ mã ngắn và tên lên giao diện
      shortCodes: {
        staffid: "", // 🎯 Biến này âm thầm GIỮ ID DÀI (_id) để Backend không bị lỗi
        readerid: "",
        bookid: "",
        quantity: 1,
        status: "Borrowed"
      }
    };
  },
  methods: {
    // Lấy thông tin nhân viên từ localStorage
    getStaffFromLocal() {
      const userLocal = localStorage.getItem("user");
      if (userLocal) {
        const staff = JSON.parse(userLocal);
        
        // 1. Âm thầm lưu ID dài vào dữ liệu để Backend xử lý
        this.shortCodes.staffid = staff._id; 
        
        // 2. Ráp Mã ngắn + Tên để hiển thị cho nhân viên dễ kiểm tra
        const shortId = staff.staffid || "NV"; 
        const firstName = staff.firstName ;
        const lastName = staff.lastName ;
        this.displayStaffInfo = `[${shortId}] - ${lastName} ${firstName}`; 

      } else {
        alert("⚠️ Vui lòng đăng nhập tài khoản nhân viên trước!");
        this.$emit('cancel');
      }
    },

    async submitForm() {
      this.isSearching = true;
      try {
        const allBooks = await BookService.getAll();
        const allReaders = await ReaderService.getAll();

        const matchedBook = allBooks.find(b => b.bookid?.toUpperCase() === this.shortCodes.bookid.trim().toUpperCase());
        const matchedReader = allReaders.find(r => r.readerid?.toUpperCase() === this.shortCodes.readerid.trim().toUpperCase() );
       

        // 1. Kiểm tra sự tồn tại của Mã Sách
        if (!matchedBook) {
          alert(`❌ Lỗi: Không tìm thấy cuốn sách nào có mã ngắn là "${this.shortCodes.bookid}"!`);
          this.isSearching = false;
          return;
        }
        
        // 2. Kiểm tra sự tồn tại của Mã Độc Giả
        if (!matchedReader) {
          alert(`❌ Lỗi: Không tìm thấy độc giả nào có mã ngắn là "${this.shortCodes.readerid}"!`);
          this.isSearching = false;
          return;
        }

         // 2. Kiểm tra sự tồn tại của Mã Độc Giả
        if ( matchedReader.isActive == false) {
          alert(`❌ Lỗi:Tài khoản của độc giả có mã "${this.shortCodes.readerid}" hiện tại đã bị khóa!`);
          this.isSearching = false;
          return;
        }

        // 3. 🚨 BƯỚC QUAN TRỌNG: Kiểm tra số lượng tồn kho 
        // (Lưu ý: Thay matchedBook.quantity bằng matchedBook.inStock nếu DB của bạn đặt tên khác)
        const currentStock = matchedBook.quantity || 0; 
        const requestedQuantity = Number(this.shortCodes.quantity);

        if (requestedQuantity > currentStock) {
          alert(`🚨 Lỗi số lượng: Không thể lập phiếu mượn!\n\n- Sách: "${matchedBook.name}"\n- Số lượng trong kho: ${currentStock} cuốn\n- Số lượng yêu cầu: ${requestedQuantity} cuốn\n=> Vui lòng điều chỉnh lại số lượng nhập.`);
          this.isSearching = false;
          return;
        }

        // 4. 🎯 TRÍCH XUẤT THÔNG TIN VÀ HIỂN THỊ THÔNG BÁO XÁC NHẬN
        const bookName = matchedBook.name;
        const readerName = `${matchedReader.lastName || ""} ${matchedReader.firstName || ""}`.trim();

        const isConfirmed = confirm(
          `📝 XÁC NHẬN LẬP PHIẾU MƯỢN TẠI QUẦY\n\n` +
          `👤 Độc giả: ${readerName} [${matchedReader.readerid}]\n` +
          `📚 Sách mượn: ${bookName} [${matchedBook.bookid}]\n` +
          `🔢 Số lượng: ${requestedQuantity} cuốn\n\n` +
          `Bạn có chắc chắn muốn hoàn tất lập phiếu mượn này không?`
        );

        // Nếu nhân viên bấm "Hủy" (Cancel) trong hộp thoại confirm thì dừng lại không bắn dữ liệu lên
        if (!isConfirmed) {
          this.isSearching = false;
          return;
        }

        // ĐÓNG GÓI DỮ LIỆU ĐÃ DỊCH THÀNH ID DÀI HỆ THỐNG
        const finalPayload = {
          staffid: this.shortCodes.staffid, 
          bookid: matchedBook._id,       
          readerid: matchedReader._id,   
          quantity: requestedQuantity,
          status: this.shortCodes.status
        };

        this.$emit("submit:loan", finalPayload);

      } catch (error) {
        console.error("Lỗi tra cứu mã định danh hoặc kiểm tra kho:", error);
        alert("Có lỗi xảy ra trong quá trình kiểm tra thông tin phiếu mượn!");
      } finally {
        this.isSearching = false;
      }
    }
  },
  mounted() {
    this.getStaffFromLocal();
    this.shortCodes.quantity = this.loan.quantity;
  }
};
</script>
