<template>
  <div class="row no-gutters shadow-sm rounded border bg-white p-2 w-100">
    <!-- Ô nhập tên thể loại (Chiếm phần lớn không gian) -->
    <div class="col col-md-11 pr-2">
      <div class="input-group input-group-sm">
        <div class="input-group-prepend">
          <span
            class="input-group-text bg-transparent border-right-0 text-muted"
          >
            <!-- Đổi icon thành danh mục/tag cho đúng nghĩa Thể loại -->
            <i class="fas fa-tags"></i>
          </span>
        </div>
        <input
          type="text"
          class="form-control border-left-0"
          placeholder="Nhập tên thể loại cần tìm..."
          :value="modelValue.name"
          @input="updateFilter('name', $event.target.value)"
          @keyup.enter="$emit('submit')"
        />
      </div>
    </div>

    <!-- Nút Tìm kiếm -->
    <div class="col-auto col-md-1">
      <button
        class="btn btn-primary btn-sm btn-block"
        type="button"
        @click="$emit('submit')"
      >
        <i class="fas fa-search"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "CategoryFilter",
  props: {
    // modelValue lúc này cực kỳ đơn giản, chỉ cần chứa trường name
    modelValue: {
      type: Object,
      default: () => ({ name: "" }),
    },
  },
  emits: ["update:modelValue", "submit"],
  methods: {
    // Hàm cập nhật từ khóa tìm kiếm phát lên cho trang cha quản lý
    updateFilter(key, value) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        [key]: value,
      });
    },
  },
};
</script>

<style scoped>
/* Bạn có thể thêm CSS riêng tại đây nếu cần tinh chỉnh */
</style>
