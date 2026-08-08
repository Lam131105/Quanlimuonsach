import { createRouter, createWebHistory } from "vue-router";
import LoanManager from "@/views/LoanManager.vue";
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
      path: "/",
      name: "loanmanager",
      component: LoanManager,
    },
    {
      path: "/categorymanager",
      name: "categorymanager",
      component: CategoryManager,
    },

    {
      path: "/categorymanager/:id",
      name: "categoryedit",
      component: CategoryEdit,
      props: true,
    },

    {
      path: "/categorymanager/add",
      name: "categoryadd",
      component: CategoryAdd,
      props: true,
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
      path: "/publishermanager",
      name: "publishermanager",
      component: PublisherManager,
    },

    {
      path: "/publishermanager/:id",
      name: "publisheredit",
      component: PublisherEdit,
      props: true,
    },

    {
      path: "/publishermanager/add",
      name: "publisheradd",
      component: PublisherAdd,
      props: true,
    },

    {
      path: "/staffmanager",
      name: "staffmanager",
      component: StaffManager,
    },

    {
      path: "/staffmanager/:id",
      name: "staffedit",
      component: StaffEdit,
      props: true,
    },

    {
      path: "/staffmanager/add",
      name: "staffadd",
      component: StaffAdd,
      props: true,
    },

    {
      path: "/readermanager",
      name: "readermanager",
      component: ReaderManager,
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
