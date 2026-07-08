import { createRouter, createWebHistory } from "vue-router";
import LoanManager from "@/views/LoanManager.vue";
import Book from "@/views/Book.vue"; // Bắt buộc phải import file này
import BookManager from "@/views/BookManager.vue";
import BookDetail from "@/views/BookDetail.vue";
import BookAdd from "@/views/BookAdd.vue";
import BookEdit from "@/views/BookEdit.vue";
import ReaderRegister from "@/views/ReaderRegister.vue";
import ReaderLogin from "@/views/ReaderLogin.vue";
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "loanmanager",
      component: LoanManager,
    },
    {
      path: "/book",
      name: "book",
      component: Book, // Sử dụng trực tiếp
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
    },
    {
      path: "/bookmanager/edit/:id",
      name: "bookedit",
      component: BookEdit,
      props: true,
    },

    {
      path: "/bookmanager/add",
      name: "bookadd",
      component: BookAdd,
      props: true,
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
    // {
    //   path: "/loans/add",
    //   name: "loan.add",
    //   component: () => import("@/views/LoanAdd.vue"),
    // },
    // {
    //   path: "/loans/edit/:id",
    //   name: "loan.edit",
    //   component: () => import("@/views/LoanEdit.vue"),
    //   props: true,
    // },
    {
      path: "/:pathMatch(.*)*",
      name: "notfound",
      component: () => import("@/views/NotFound.vue"),
    },
  ],
});

export default router;
