<template>
  <div class="card p-4 shadow-sm bg-light">
    <form @submit.prevent="$emit('submit', localCategory)">
      <div class="form-group">
        <label for="name" class="font-weight-bold">
          <i class="fas fa-tag text-muted mr-1"></i> Tên thể loại:
        </label>
        <input
          type="text"
          id="name"
          class="form-control"
          v-model="localCategory.name"
          placeholder="Ví dụ: Truyện tranh, Khoa học viễn tưởng..."
          required
        />
      </div>

      <div class="form-group">
        <label for="description" class="font-weight-bold">
          <i class="fas fa-align-left text-muted mr-1"></i> Mô tả / Ghi chú:
        </label>
        <textarea
          id="description"
          class="form-control"
          rows="4"
          v-model="localCategory.description"
          placeholder="Nhập mô tả ngắn cho thể loại này..."
        ></textarea>
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
            <i class="fas fa-trash-alt"></i> Xóa thể loại
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
    category: { type: Object, required: true },
    showDelete: { type: Boolean, default: false },
  },
  emits: ["submit", "cancel", "delete"],
  data() {
    return {
      // Clone dữ liệu từ prop ra biến local để chỉnh sửa
      localCategory: { ...this.category },
    };
  },
  watch: {
    // Theo dõi dữ liệu truyền vào (dành cho trang Sửa khi API load xong)
    category: {
      handler(newVal) {
        this.localCategory = { ...newVal };
      },
      deep: true,
    },
  },
};
</script>
