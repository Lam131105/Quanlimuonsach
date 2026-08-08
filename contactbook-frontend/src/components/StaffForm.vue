<template>
  <div class="card p-4 shadow-sm bg-light">
    <form @submit.prevent="$emit('submit', localStaff)">
      <div class="row">
        <!-- Họ và Tên -->
        <div class="col-md-6 form-group">
          <label for="lastName" class="font-weight-bold">Họ và tên đệm:</label>
          <input
            type="text"
            id="lastName"
            class="form-control"
            v-model="localStaff.lastName"
            placeholder="Ví dụ: Nguyễn Văn"
            required
          />
        </div>
        <div class="col-md-6 form-group">
          <label for="firstName" class="font-weight-bold">Tên nhân viên:</label>
          <input
            type="text"
            id="firstName"
            class="form-control"
            v-model="localStaff.firstName"
            placeholder="Ví dụ: A"
            required
          />
        </div>
      </div>

      <div class="row">
        <!-- Ngày sinh và Giới tính -->
        <div class="col-md-6 form-group">
          <label for="birthDay" class="font-weight-bold">Ngày sinh:</label>
          <input
            type="text"
            id="birthDay"
            class="form-control"
            v-model="localStaff.birthDay"
            placeholder="Ví dụ: 13/11/2005 hoặc 2005-11-13"
            required
          />
        </div>
        <div class="col-md-6 form-group">
          <label for="gender" class="font-weight-bold">Giới tính:</label>
          <select
            id="gender"
            class="form-control"
            v-model="localStaff.gender"
            required
          >
            <option value="" disabled selected>-- Chọn giới tính --</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
        </div>
      </div>

      <div class="row">
        <!-- Gmail và Số điện thoại -->
        <div class="col-md-6 form-group">
          <label for="gmail" class="font-weight-bold">Địa chỉ Gmail:</label>
          <input
            type="email"
            id="gmail"
            class="form-control"
            v-model="localStaff.gmail"
            placeholder="nhanvien@gmail.com"
            required
          />
        </div>
        <div class="col-md-6 form-group">
          <label for="phone" class="font-weight-bold">Số điện thoại:</label>
          <input
            type="tel"
            id="phone"
            class="form-control"
            v-model="localStaff.phone"
            placeholder="0909xxxxxx"
            required
          />
        </div>
      </div>

      <!-- Địa chỉ -->
      <div class="form-group">
        <label for="address" class="font-weight-bold"
          >Địa chỉ thường trú:</label
        >
        <input
          type="text"
          id="address"
          class="form-control"
          v-model="localStaff.address"
          placeholder="Ví dụ: Cao Lãnh, Đồng Tháp..."
          required
        />
      </div>

      <!-- Mật khẩu (Chỉ hiện khi THÊM MỚI nhân viên, trang Sửa sẽ ẩn đi) -->
      <div v-if="!isEdit" class="form-group">
        <label for="password" class="font-weight-bold"
          >Mật khẩu tài khoản:</label
        >
        <input
          type="password"
          id="password"
          class="form-control"
          v-model="localStaff.password"
          placeholder="Nhập mật khẩu ban đầu"
          required
        />
      </div>

      <hr />

      <!-- Hàng nút bấm -->
      <div class="d-flex justify-content-between mt-3">
        <button
          type="button"
          class="btn btn-secondary font-weight-bold shadow-sm"
          @click="$emit('cancel')"
        >
          <i class="fas fa-arrow-left"></i> Quay lại
        </button>
        <button
          type="submit"
          class="btn btn-primary font-weight-bold shadow-sm"
        >
          <i class="fas fa-save"></i> Lưu dữ liệu
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  props: {
    staff: { type: Object, required: true },
    isEdit: { type: Boolean, default: false }, // Biến cờ phân biệt thêm / sửa
  },
  emits: ["submit", "cancel"],
  data() {
    return {
      localStaff: { ...this.staff },
    };
  },
  watch: {
    staff: {
      handler(newVal) {
        this.localStaff = { ...newVal };
      },
      deep: true,
    },
  },
};
</script>
