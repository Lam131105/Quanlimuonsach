<template>
  <div class="container mt-5" style="max-width: 450px">
    <div class="card shadow border-0 rounded-lg mt-5">
      <div
        class="card-header bg-primary text-white text-center py-4 rounded-top"
      >
        <h4 class="mb-0 font-weight-bold">
          <i class="fas fa-sign-in-alt"></i> ĐĂNG NHẬP ĐỘC GIẢ
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
        const response = await readerService.login(this.credentials);

        alert("Đăng nhập thành công!");
        // Lưu thông tin user đăng nhập vào localStorage để các trang khác biết ai đang đăng nhập
        localStorage.setItem("user", JSON.stringify(response.user));
        // Chuyển người dùng về trang chủ danh mục sách (book.vue)
        this.$router.push({ name: "book" });
        // Cập nhật thanh điều hướng sau khi đăng nhập
        this.$emit("login-success");
      } catch (error) {
        console.log(error);
        if (error.response && error.response.status === 401) {
          alert("Sai tài khoản Gmail hoặc Mật khẩu! Vui lòng thử lại.");
        } else {
          alert("Đăng nhập thất bại. Hệ thống đang bận!");
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
