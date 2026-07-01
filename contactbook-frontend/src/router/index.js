import { createRouter, createWebHistory } from "vue-router";
import LoanManager from "@/views/LoanManager.vue";
import BookManager from "@/views/BookManager.vue"; // Bắt buộc phải import file này

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "loanmanager",
      component: LoanManager,
    },
    {
      path: "/books",
      name: "bookmanager",
      component: BookManager, // Sử dụng trực tiếp
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
