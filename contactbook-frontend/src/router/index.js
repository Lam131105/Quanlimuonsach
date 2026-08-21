import { createRouter, createWebHistory } from "vue-router";
import LoanManager from "@/views/LoanManager.vue";
import LoanAdd from "@/views/LoanAdd.vue";
import BookReturn from "@/views/BookReturn.vue";
import MyLoans from "@/views/MyLoans.vue";

import Book from "@/views/Book.vue";
import BookDetail from "@/views/BookDetail.vue";
import BookManager from "@/views/BookManager.vue";
import BookAdd from "@/views/BookAdd.vue";
import BookEdit from "@/views/BookEdit.vue";

import CategoryManager from "@/views/CategoryManager.vue";
import CategoryAdd from "@/views/CategoryAdd.vue";
import CategoryEdit from "@/views/CategoryEdit.vue";

import PublisherManager from "@/views/PublisherManager.vue";
import PublisherAdd from "@/views/PublisherAdd.vue";
import PublisherEdit from "@/views/PublisherEdit.vue";

import StaffManager from "@/views/StaffManager.vue";
import StaffAdd from "@/views/StaffAdd.vue";
import StaffEdit from "@/views/StaffEdit.vue";

import ReaderManager from "@/views/ReaderManager.vue";

import ReaderRegister from "@/views/ReaderRegister.vue";
import ReaderLogin from "@/views/ReaderLogin.vue";
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/loanmanager",
      name: "loanmanager",
      component: LoanManager,
      meta: { requiresStaff: true },
    },

    // {
    //   path: "/loanmanager/:id",
    //   name: "loanedit",
    //   component: LoanEdit,
    //   props: true,
    // },
    {
      path: "/loanmanager/:loanid/return",
      name: "bookreturn",
      component: BookReturn,
      meta: { requiresStaff: true },
    },
    {
      path: "/loanmanager/add",
      name: "loanadd",
      component: LoanAdd,
      props: true,
      meta: { requiresStaff: true },
    },

    {
      path: "/myloans",
      name: "myloans",
      component: MyLoans,
    },

    {
      path: "/categorymanager",
      name: "categorymanager",
      component: CategoryManager,
      meta: { requiresStaff: true },
    },

    {
      path: "/categorymanager/:id",
      name: "categoryedit",
      component: CategoryEdit,
      props: true,
      meta: { requiresStaff: true },
    },

    {
      path: "/categorymanager/add",
      name: "categoryadd",
      component: CategoryAdd,
      props: true,
      meta: { requiresStaff: true },
    },

    {
      path: "/",
      name: "book",
      component: Book,
    },

    {
      path: "/book/:id",
      name: "bookdetail",
      component: BookDetail,
      props: true,
    },
    {
      path: "/bookmanager",
      name: "bookmanager",
      component: BookManager,
      props: true,
      meta: { requiresStaff: true },
    },
    {
      path: "/bookmanager/edit/:id",
      name: "bookedit",
      component: BookEdit,
      props: true,
      meta: { requiresStaff: true },
    },

    {
      path: "/bookmanager/add",
      name: "bookadd",
      component: BookAdd,
      props: true,
      meta: { requiresStaff: true },
    },

    {
      path: "/publishermanager",
      name: "publishermanager",
      component: PublisherManager,
      meta: { requiresStaff: true },
    },

    {
      path: "/publishermanager/:id",
      name: "publisheredit",
      component: PublisherEdit,
      props: true,
      meta: { requiresStaff: true },
    },

    {
      path: "/publishermanager/add",
      name: "publisheradd",
      component: PublisherAdd,
      props: true,
      meta: { requiresStaff: true },
    },

    {
      path: "/staffmanager",
      name: "staffmanager",
      component: StaffManager,
      meta: { requiresStaff: true },
    },

    {
      path: "/staffmanager/:id",
      name: "staffedit",
      component: StaffEdit,
      props: true,
      meta: { requiresStaff: true },
    },

    {
      path: "/staffmanager/add",
      name: "staffadd",
      component: StaffAdd,
      props: true,
      meta: { requiresStaff: true },
    },

    {
      path: "/readermanager",
      name: "readermanager",
      component: ReaderManager,
      meta: { requiresStaff: true },
    },

    {
      path: "/register/",
      name: "register",
      component: ReaderRegister,
      props: true,
    },
    {
      path: "/login/",
      name: "login",
      component: ReaderLogin,
      props: true,
    },
    {
      path: "/:pathMatch(.*)*",
      name: "notfound",
      component: () => import("@/views/NotFound.vue"),
    },
  ],
});

router.beforeEach((to, from, next) => {
  // 1. Kiểm tra xem trang đích có bắt buộc quyền Staff hay không
  if (to.matched.some(record => record.meta.requiresStaff)) {
    
    // 2. Lấy dữ liệu user đã lưu từ hàm handleLogin của bạn
    const userLocal = localStorage.getItem("user");
    
    // TH1: Hoàn toàn chưa đăng nhập bất kỳ tài khoản nào
    if (!userLocal) {
      alert("Hệ thống yêu cầu đăng nhập tài khoản nhân viên!");
      return next({ name: "login" }); // Đẩy về trang đăng nhập chung của bạn
    }
    
    const user = JSON.parse(userLocal);
    
    // TH2: Đã đăng nhập nhưng trường role KHÔNG PHẢI là 'staff' (Tức là Độc giả định vào lén)
    if (user.role !== "staff") {
      alert("Tài khoản của bạn là Độc giả, không có quyền truy cập khu vực Quản lý! Vui lòng đăng nhập bằng tài khoản nhân viên");
     return next({ name: "login" });
    }
    
    // TH3: Đúng role === "staff" -> Cho đi qua suôn sẻ
    next();
    
  } else {
    // Các trang không yêu cầu bảo vệ (trang xem sách, trang chủ...) -> Cho qua thoải mái
    next();
  }
});

export default router;
