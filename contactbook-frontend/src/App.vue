<template>
  <div id="app">
    <nav class="navbar navbar-expand navbar-dark bg-dark">
      <a href="/" class="navbar-brand">Ứng dụng Thư viện</a>
      <div class="mr-auto navbar-nav">
        <li class="nav-item">
          <router-link :to="{ name: 'loanmanager' }" class="nav-link">
            Quản lý mượn sách <i class="fas fa-address-book"></i>
          </router-link>
        </li>

        <li class="nav-item">
          <router-link :to="{ name: 'bookmanager' }" class="nav-link">
            Quản lý danh mục sách <i class="fas fa-book"></i>
          </router-link>
        </li>
      </div>
    </nav>

    <div class="container mt-3">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
}
</script>