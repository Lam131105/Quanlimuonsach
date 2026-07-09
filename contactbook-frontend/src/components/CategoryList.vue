<template>
  <ul class="list-group">
    <li
      class="list-group-item"
      v-for="(cat, index) in categories"
      :key="cat._id"
      :class="{ active: index === activeIndex }"
      @click="$emit('update:activeIndex', index)"
    >
      <i class="fas fa-tags mr-2 text-muted"></i> {{ cat.name }}
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    categories: { type: Array, default: () => [] },
    activeIndex: { type: Number, default: -1 },
  },
  emits: ["update:activeIndex"],
};
</script>

<style scoped>
.list-group-item {
  cursor: pointer;
  transition: all 0.2s ease;
}

.list-group-item.active {
  background-color: #5a6268;
  border-color: #5a6268;
}
</style>
