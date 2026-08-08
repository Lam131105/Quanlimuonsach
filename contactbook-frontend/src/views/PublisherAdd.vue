<template>
  <div class="container mt-3" style="max-width: 600px">
    <h4 class="text-center text-success mb-4 font-weight-bold">
      <i class="fas fa-plus-circle"></i> THÊM NHÀ XUẤT BẢN MỚI
    </h4>

    <PublisherForm
      :publisher="newPublisher"
      :showDelete="false"
      @submit="createPublisher"
      @cancel="goBack"
    />
  </div>
</template>

<script>
import PublisherService from "@/services/publisher.service";
import PublisherForm from "@/components/PublisherForm.vue";

export default {
  components: {
    PublisherForm,
  },
  data() {
    return {
      // Khởi tạo Object NXB rỗng ban đầu dựa theo các trường của Backend
      newPublisher: {
        name: "",
        address: "",
      },
    };
  },
  methods: {
    async createPublisher(data) {
      try {
        await PublisherService.create(data);
        alert("Thêm nhà xuất bản mới thành công!");
        this.goBack(); // Quay về trang quản lý chính
      } catch (error) {
        console.error(error);
        alert("Có lỗi xảy ra khi thêm Nhà xuất bản mới!");
      }
    },
    goBack() {
      this.$router.push({ name: "publishermanager" });
    },
  },
};
</script>
