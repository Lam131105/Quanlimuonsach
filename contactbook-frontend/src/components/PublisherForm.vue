<template>
  <div class="card p-4 shadow-sm bg-light">
    <form @submit.prevent="$emit('submit', localPublisher)">
      <div class="form-group">
        <label for="name" class="font-weight-bold">
          <i class="fas fa-building text-muted mr-1"></i> Tên Nhà xuất bản:
        </label>
        <input
          type="text"
          id="name"
          class="form-control"
          v-model="localPublisher.name"
          placeholder="Ví dụ: NXB Kim Đồng, NXB Trẻ..."
          required
        />
      </div>

      <div class="form-group">
        <label for="address" class="font-weight-bold">
          <i class="fas fa-map-marker-alt text-muted mr-1"></i> Địa chỉ:
        </label>
        <input
          type="text"
          id="address"
          class="form-control"
          v-model="localPublisher.address"
          placeholder="Ví dụ: 62 Bà Triệu, Hoàn Kiếm, Hà Nội..."
          required
        />
      </div>

      <hr />

      <div class="d-flex justify-content-between mt-3">
        <button
          type="button"
          class="btn btn-secondary"
          @click="$emit('cancel')"
        >
          <i class="fas fa-arrow-left"></i> Quay lại
        </button>
        <div>
          <button
            v-if="showDelete"
            type="button"
            class="btn btn-danger mr-2"
            @click="$emit('delete')"
          >
            <i class="fas fa-trash-alt"></i> Xóa NXB
          </button>
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-save"></i> Lưu thay đổi
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  props: {
    publisher: { type: Object, required: true },
    showDelete: { type: Boolean, default: false },
  },
  emits: ["submit", "cancel", "delete"],
  data() {
    return {
      // Bản sao dữ liệu từ props để chỉnh sửa trên Form
      localPublisher: { ...this.publisher },
    };
  },
  watch: {
    // Lắng nghe dữ liệu thay đổi khi trang Sửa nhận dữ liệu từ Backend chậm hơn
    publisher: {
      handler(newVal) {
        this.localPublisher = { ...newVal };
      },
      deep: true,
    },
  },
};
</script>
