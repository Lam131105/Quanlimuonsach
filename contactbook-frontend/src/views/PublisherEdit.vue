<template>
  <div class="container mt-3" style="max-width: 600px">
    <h4 class="text-center text-primary mb-4 font-weight-bold">
      <i class="fas fa-edit"></i> HIỆU CHỈNH NHÀ XUẤT BẢN
    </h4>

    <!-- Chỉ hiển thị Form khi dữ liệu cũ đã được tải về thành công -->
    <PublisherForm
      v-if="publisher"
      :publisher="publisher"
      :showDelete="true"
      @submit="updatePublisher"
      @cancel="goBack"
      @delete="deletePublisher"
    />
    <p v-else class="text-center text-muted">
      Đang tải dữ liệu nhà xuất bản...
    </p>
  </div>
</template>

<script>
import PublisherService from "@/services/publisher.service";
import PublisherForm from "@/components/PublisherForm.vue";

export default {
  components: {
    PublisherForm,
  },
  props: {
    id: { type: String, required: true }, // Lấy ID động từ Router URL thanh địa chỉ
  },
  data() {
    return {
      publisher: null,
    };
  },
  methods: {
    // Bốc thông tin cũ từ CSDL lên
    async getPublisher(id) {
      try {
        this.publisher = await PublisherService.get(id);
      } catch (error) {
        console.error(error);
        // Nếu gõ bừa ID không có thật, đẩy sang trang 404
        this.$router.push({
          name: "notfound",
          params: { pathMatch: this.$route.path.split("/").slice(1) },
        });
      }
    },
    // Hàm thực thi lưu thông tin đã sửa
    async updatePublisher(data) {
      try {
        await PublisherService.update(this.id, data);
        alert("Cập nhật nhà xuất bản thành công!");
        this.goBack();
      } catch (error) {
        console.error(error);
        alert("Có lỗi xảy ra khi cập nhật thông tin!");
      }
    },
    // Hàm thực thi xóa ngay trong giao diện trang sửa
    async deletePublisher() {
      if (confirm("Bạn có chắc chắn muốn XÓA nhà xuất bản này không?")) {
        try {
          await PublisherService.delete(this.id);
          alert("Xóa nhà xuất bản thành công!");
          this.goBack();
        } catch (error) {
          console.error(error);
        }
      }
    },
    goBack() {
      this.$router.push({ name: "publishermanager" });
    },
  },
  // Vừa vào trang thì gọi dữ liệu NXB cũ đổ vào form ngay lập tức
  created() {
    this.getPublisher(this.id);
  },
};
</script>
