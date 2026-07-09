<template>
  <div id="app" class="bg-light min-vh-100">
    <nav
      class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm px-4 py-2 main-navbar"
    >
      <button
        class="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item">
            <router-link
              :to="{ name: 'book' }"
              class="nav-link px-3 d-flex align-items-center"
              active-class="active"
            >
              <i class="fas fa-book mr-1.5"></i> Thư viện sách
            </router-link>
          </li>

          <li class="nav-item">
            <router-link
              :to="{ name: 'loanmanager' }"
              class="nav-link px-3 d-flex align-items-center"
              active-class="active"
            >
              <i class="fas fa-tasks mr-1.5"></i> Quản lý mượn sách
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              :to="{ name: 'bookmanager' }"
              class="nav-link px-3 d-flex align-items-center"
              active-class="active"
            >
              <i class="fas fa-cogs mr-1.5"></i> Quản lý danh mục sách
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
              :to="{ name: 'categorymanager' }"
              class="nav-link px-3 d-flex align-items-center"
              active-class="active"
            >
              <i class="fas fa-cogs mr-1.5"></i> Quản lí thư viện
            </router-link>
          </li>
        </ul>

        <ul class="navbar-nav ml-auto align-items-center">
          <template v-if="!currentUser">
            <li class="nav-item">
              <router-link
                :to="{ name: 'login' }"
                class="nav-link px-3"
                active-class="active"
              >
                <i class="fas fa-sign-in-alt mr-1"></i> Đăng nhập
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                :to="{ name: 'register' }"
                class="btn btn-outline-warning btn-sm px-3 ml-2 font-weight-bold rounded-pill"
              >
                <i class="fas fa-user-plus mr-1"></i> Đăng ký
              </router-link>
            </li>
          </template>

          <template v-else>
            <li class="nav-item d-flex align-items-center">
              <div
                class="user-avatar shadow-sm mr-2"
                :title="`Xin chào, ${currentUser.lastName} ${currentUser.firstName}`"
              >
                {{ getFirstLetter(currentUser.lastName) }}
              </div>
              <span class="text-white font-weight-bold mr-3 name-display">
                Hi, {{ currentUser.firstName }}
              </span>
            </li>
            <li class="nav-item">
              <button
                @click="handleLogout"
                class="btn btn-sm btn-link text-danger nav-link px-2 logout-btn"
                title="Đăng xuất tài khoản"
              >
                <i class="fas fa-power-off"></i>
              </button>
            </li>
          </template>
        </ul>
      </div>
    </nav>

    <div class="container-fluid mt-4 px-4">
      <router-view @login-success="checkLoginStatus" />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentUser: null,
    };
  },
  methods: {
    // Kiểm tra xem trong localStorage đã lưu thông tin user chưa
    checkLoginStatus() {
      const user = localStorage.getItem("user");
      if (user) {
        this.currentUser = JSON.parse(user);
      } else {
        this.currentUser = null;
      }
    },
    // Hàm lấy chữ cái đầu tiên viết hoa của Họ (lastName)
    getFirstLetter(lastName) {
      if (!lastName) return "U";
      return lastName.trim().charAt(0).toUpperCase();
    },
    // Xử lý khi bấm Đăng xuất
    handleLogout() {
      if (confirm("Bạn có chắc chắn muốn đăng xuất tài khoản?")) {
        localStorage.removeItem("user");
        this.currentUser = null;
        this.$router.push({ name: "login" });
      }
    },
  },
  mounted() {
    // Khi trang web vừa tải xong, kiểm tra ngay trạng thái đăng nhập
    this.checkLoginStatus();
  },
};
</script>

<style scoped>
.main-navbar .nav-link {
  transition: all 0.3s ease;
  font-weight: 500;
}
.main-navbar .nav-link:hover {
  color: #ffc107 !important; /* Đổi chữ sang màu vàng rực khi hover */
}
.main-navbar .nav-link.active {
  color: #007bff !important; /* Trang hiện tại đang đứng sẽ có màu xanh primary rõ ràng */
  font-weight: bold;
}

/* 🟢 CSS CHO VÒNG TRÒN AVATAR CHỮ CÁI ĐẦU 🟢 */
.user-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(
    135deg,
    #007bff,
    #00d2ff
  ); /* Hiệu ứng màu gradient hiện đại */
  color: white;
  border-radius: 50%; /* Ép thành hình tròn xoe */
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  border: 2px solid #ffffff;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.user-avatar:hover {
  transform: scale(1.1); /* Phóng to nhẹ khi rê chuột vào */
}

/* 🔴 Nút logout */
.logout-btn:hover {
  color: #dc3545 !important;
  text-decoration: none;
}

@media (max-width: 991px) {
  .name-display {
    display: none; /* Tránh tràn màn hình trên điện thoại nhỏ */
  }
}
</style>
