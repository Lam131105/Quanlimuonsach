<template>
  <div id="app">
    <nav class="navbar navbar-expand-md navbar-dark bg-dark px-3 py-2">
      <div class="navbar-nav d-flex flex-row flex-wrap mt-0">
        <li class="nav-item">
          <router-link :to="{ name: 'book' }" class="nav-link p-2">
            Thư viện sách <i class="fas fa-book ml-1"></i>
          </router-link>
        </li>
        <li class="nav-item mr-3">
          <router-link :to="{ name: 'loanmanager' }" class="nav-link p-2">
            Quản lý mượn sách <i class="fas fa-address-book ml-1"></i>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link :to="{ name: 'bookmanager' }" class="nav-link p-2">
            Quản lý danh mục sách <i class="fas fa-book ml-1"></i>
          </router-link>
        </li>
      </div>
    </nav>

    <div class="container-fluid mt-4 px-4">
      <router-view />
    </div>
  </div>
</template>
