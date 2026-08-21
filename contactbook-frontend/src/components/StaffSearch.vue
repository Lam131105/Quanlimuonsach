<template>
  <div class="row no-gutters shadow-sm rounded border bg-white p-2 w-100">
    <!-- Ô nhập từ khóa tìm kiếm nhân viên -->
    <div class="col col-md-11 pr-2">
      <div class="input-group input-group-sm">
        <div class="input-group-prepend">
          <span class="input-group-text bg-transparent border-right-0 text-muted">
            <!-- Icon ID card/User đại diện cho nhân viên -->
            <i class="fas fa-id-card"></i>
          </span>
        </div>
        <input
          type="text"
          class="form-control border-left-0"
          placeholder="Nhập tên nhân viên hoặc email"
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
  name: "StaffSearch",
  props: {
    modelValue: {
      type: Object,
      default: () => ({ name: "" }),
    },
  },
  emits: ["update:modelValue", "submit"],
  methods: {
    updateFilter(key, value) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        [key]: value,
      });
    },
  },
};
</script>