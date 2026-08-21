<template>
  <div class="container mt-5" style="max-width: 450px">
    <div class="card shadow border-0 rounded-lg mt-5">
      <div
        class="card-header bg-primary text-white text-center py-4 rounded-top"
      >
        <h4 class="mb-0 font-weight-bold">
          <i class="fas fa-sign-in-alt"></i> ĐĂNG NHẬP
        </h4>
        <small class="text-white-50"
          >Chào mừng bạn quay trở lại với thư viện</small
        >
      </div>

      <div class="card-body p-4 bg-light">
        <form @submit.prevent="handleLogin">
          <div class="form-group mb-3">
            <label for="gmail" class="font-weight-bold">Địa chỉ Gmail:</label>
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text"
                  ><i class="fas fa-envelope"></i
                ></span>
              </div>
              <input
                type="email"
                id="gmail"
                class="form-control"
                v-model="credentials.gmail"
                placeholder="Nhập gmail của bạn"
                required
              />
            </div>
          </div>

          <div class="form-group mb-4">
            <label for="password" class="font-weight-bold">Mật khẩu:</label>
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text"
                  ><i class="fas fa-lock"></i
                ></span>
              </div>
              <input
                type="password"
                id="password"
                class="form-control"
                v-model="credentials.password"
                placeholder="Nhập mật khẩu"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block font-weight-bold py-2 shadow-sm"
          >
            <i class="fas fa-key mr-1"></i> ĐĂNG NHẬP
          </button>
        </form>
      </div>

      <div class="card-footer bg-white text-center py-3 border-0">
        <span class="text-muted">Bạn chưa có tài khoản?</span>
        <router-link
          :to="{ name: 'register' }"
          class="ml-1 font-weight-bold text-success"
        >
          Đăng ký tài khoản mới
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import readerService from "@/services/reader.service";
import staffService from "@/services/staff.service";

export default {
  data() {
    return {
      credentials: {
        gmail: "",
        password: "",
      },
    };
  },
  methods: {
    async handleLogin() {
      try {
        let loggedInUser = null;
        let role = "";

        // 🔄 BƯỚC 1: Thử đăng nhập bằng tài khoản ĐỘC GIẢ trước
        try {
          const readerResponse = await readerService.login(this.credentials);
          if (readerResponse && readerResponse.user) {
            loggedInUser = readerResponse.user;
            role = "reader"; // Dán nhãn Độc giả
          }
        } catch (readerError) {
          // Nếu lỗi 401 (Sai thông tin độc giả), bỏ qua để chạy tiếp xuống luồng Nhân viên
          // Nếu là lỗi hệ thống khác (500, mất mạng), ném lỗi ra ngoài luôn
          if (readerError.response && readerError.response.status !== 401) {
            throw readerError;
          }
        }

        // 🔄 BƯỚC 2: Nếu chưa đăng nhập được bằng Độc giả, thử tiếp bằng NHÂN VIÊN
        if (!loggedInUser) {
          try {
            const staffResponse = await staffService.login(this.credentials);
            if (staffResponse && staffResponse.user) {
              loggedInUser = staffResponse.user;
              role = "staff"; // Dán nhãn Nhân viên
            }
          } catch (staffError) {
            // Nếu cả luồng Nhân viên cũng lỗi, ném lỗi ra để bắt ở khối catch to phía dưới
            throw staffError;
          }
        }

        // 🎉 BƯỚC 3: Xử lý khi đăng nhập thành công (Một trong hai luồng khớp)
        if (loggedInUser) {
          alert(
            `Đăng nhập thành công với vai trò: ${role === "staff" ? "Nhân viên" : "Độc giả"}!`,
          );

          // Gộp thêm trường role vào Object user trước khi lưu vào localStorage
          const userToSave = {
            ...loggedInUser,
            role: role,
          };

          localStorage.setItem("user", JSON.stringify(userToSave));

          // 🔀 Điều hướng thông minh dựa trên vai trò:
          if (role === "staff") {
            // Nếu là Nhân viên -> Phi thẳng vào trang Quản lý phiếu mượn sách
            this.$router.push({ name: "loanmanager" });
          } else {
            // Nếu là Độc giả -> Về trang xem danh mục sách
            this.$router.push({ name: "book" });
          }

          // Kích hoạt cập nhật lại thanh navbar cha
          this.$emit("login-success");
        } else {
          // Phòng hờ trường hợp lọt lưới không có user
          alert("Sai tài khoản Gmail hoặc Mật khẩu! Vui lòng thử lại.");
        }
      } catch (error) {
        console.error("Lỗi đăng nhập tổng:", error);
        if (error.response && error.response.status === 403) {
          // 🌟 Hiển thị đúng thông báo lỗi từ Backend gửi lên khi tài khoản bị khóa
          alert(error.response.data.message || "Tài khoản của bạn đã bị khóa!");
        } else if (error.response && error.response.status === 401) {
          alert("Sai tài khoản Gmail hoặc Mật khẩu! Vui lòng thử lại.");
        } else {
          alert("Đăng nhập thất bại. Hệ thống đang bận hoặc sai thông tin!");
        }
      }
    },
  },
};
</script>

<style scoped>
.card {
  border-radius: 12px;
}
.input-group-text {
  background-color: #e9ecef;
  color: #495057;
  width: 42px;
  justify-content: center;
}
</style>
