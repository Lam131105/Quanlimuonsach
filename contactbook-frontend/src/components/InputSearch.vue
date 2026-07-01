<template>
  <div class="input-group">
    <input type="text" class="form-control" placeholder="Nhập thông tin cần tìm kiếm..." :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)" @keyup.enter="$emit('submit')" />
    <div class="input-group-append">
      <button class="btn btn-outline-secondary" type="button" @click="$emit('submit')">
        <i class="fas fa-search"></i> Tìm kiếm
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: { type: String, default: "" },
  },
  emits: ["update:modelValue", "submit"],
};
</script>