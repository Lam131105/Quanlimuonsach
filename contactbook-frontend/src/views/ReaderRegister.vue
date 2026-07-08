<template>
  <div class="container mt-5 mb-5" style="max-width: 600px">
    <div class="card shadow border-0 rounded-lg">
      <div
        class="card-header bg-primary text-white text-center py-3 rounded-top"
      >
        <h4 class="mb-0 font-weight-bold">
          <i class="fas fa-user-plus"></i> ĐĂNG KÝ TÀI KHOẢN ĐỘC GIẢ
        </h4>
        <small class="text-white-50"
          >Vui lòng điền đầy đủ thông tin để đăng ký mượn sách</small
        >
      </div>

      <div class="card-body p-4 bg-light">
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="gmail" class="font-weight-bold"
              >Địa chỉ Gmail (Tài khoản đăng nhập chính):</label
            >
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
                v-model="reader.gmail"
                placeholder="Ví dụ: nguyenvana@gmail.com"
                required
              />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group col-md-6">
              <label for="lastName" class="font-weight-bold"
                >Họ và chữ lót:</label
              >
              <input
                type="text"
                id="lastName"
                class="form-control"
                v-model="reader.lastName"
                placeholder="Ví dụ: Nguyễn Văn"
                required
              />
            </div>
            <div class="form-group col-md-6">
              <label for="firstName" class="font-weight-bold"
                >Tên độc giả:</label
              >
              <input
                type="text"
                id="firstName"
                class="form-control"
                v-model="reader.firstName"
                placeholder="Ví dụ: Anh"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group col-md-6">
              <label for="birthDay" class="font-weight-bold">Ngày sinh:</label>
              <input
                type="date"
                id="birthDay"
                class="form-control"
                v-model="reader.birthDay"
                required
              />
            </div>
            <div class="form-group col-md-6">
              <label class="font-weight-bold d-block">Giới tính:</label>
              <div class="mt-2">
                <div class="form-check form-check-inlinemr-3">
                  <input
                    class="form-check-input"
                    type="radio"
                    id="genderNam"
                    value="Nam"
                    v-model="reader.gender"
                    required
                  />
                  <label
                    class="form-check-input-label ml-1 mr-3"
                    for="genderNam"
                    >Nam</label
                  >
                </div>
                <div class="form-check form-check-inline">
                  <input
                    class="form-check-input"
                    type="radio"
                    id="genderNu"
                    value="Nữ"
                    v-model="reader.gender"
                  />
                  <label class="form-check-input-label ml-1" for="genderNu"
                    >Nữ</label
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="phone" class="font-weight-bold"
              >Số điện thoại (Tài khoản):</label
            >
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text"
                  ><i class="fas fa-phone"></i
                ></span>
              </div>
              <input
                type="tel"
                id="phone"
                class="form-control"
                v-model="reader.phone"
                placeholder="Nhập số điện thoại của bạn"
                pattern="[0-9]{10}"
                title="Số điện thoại phải gồm 10 chữ số"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="address" class="font-weight-bold"
              >Địa chỉ cư trú:</label
            >
            <input
              type="text"
              id="address"
              class="form-control"
              v-model="reader.address"
              placeholder="Số nhà, tên đường, xã/phường, quận/huyện..."
            />
          </div>

          <div class="form-group">
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
                v-model="reader.password"
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                minlength="6"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword" class="font-weight-bold"
              >Nhập lại mật khẩu:</label
            >
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text"
                  ><i class="fas fa-check-double"></i
                ></span>
              </div>
              <input
                type="password"
                id="confirmPassword"
                class="form-control"
                v-model="confirmPassword"
                placeholder="Xác nhận lại mật khẩu chính xác"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block font-weight-bold mt-4 py-2 shadow-sm"
          >
            <i class="fas fa-paper-plane mr-1"></i> HOÀN TẤT ĐĂNG KÝ
          </button>
        </form>
      </div>

      <div class="card-footer bg-white text-center py-3 border-0">
        <span class="text-muted">Bạn đã có tài khoản rồi?</span>
        <router-link
          :to="{ name: 'login' }"
          class="ml-1 font-weight-bold text-primary"
          >Đăng nhập ngay</router-link
        >
      </div>
    </div>
  </div>
</template>

<script>
import ReaderService from "@/services/reader.service"; // Đảm bảo bạn đã có file service kết nối tới API độc giả

export default {
  data() {
    return {
      reader: {
        lastName: "",
        firstName: "",
        birthDay: "",
        gender: "Nam", // Mặc định chọn Nam
        gmail: "",
        address: "",
        phone: "",
        password: "",
      },
      confirmPassword: "", // Biến tạm dùng để đối chiếu mật khẩu ở Front-end
    };
  },
  methods: {
    async handleRegister() {
      // 1. Kiểm tra khớp mật khẩu ở phía Frontend trước khi gọi API
      if (this.reader.password !== this.confirmPassword) {
        alert("Mật khẩu xác nhận không trùng khớp! Vui lòng kiểm tra lại.");
        return;
      }

      try {
        // 2. Gọi service gửi dữ liệu JSON sang Backend xử lý lưu MongoDB
        await ReaderService.create(this.reader);

        alert(
          "Đăng ký tài khoản thành công! Hệ thống sẽ chuyển bạn sang trang Đăng nhập.",
        );

        // 3. Chuyển hướng người dùng về trang Đăng nhập (nếu đã cài đặt route login)
        this.$router.push({ name: "login" });
      } catch (error) {
        console.log(error);
        // Kiểm tra xem lỗi trả về từ Backend có phải trùng số điện thoại không để báo cho người dùng
        if (error.response && error.response.status === 400) {
          alert(
            "Lỗi: Dữ liệu không hợp lệ hoặc số điện thoại đã được đăng ký!",
          );
        } else {
          alert("Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại!");
        }
      }
    },
  },
};
</script>

<style scoped>
/* Bo góc nhẹ cho card nhìn hiện đại và mềm mại hơn */
.card {
  border-radius: 12px;
}
.input-group-text {
  background-color: #e9ecef;
  color: #495057;
  width: 42px;
  justify-content: center;
}
.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
</style>
