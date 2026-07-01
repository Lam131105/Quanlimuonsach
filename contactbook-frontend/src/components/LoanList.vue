<template>
  <ul class="list-group">
    <li class="list-group-item" v-for="(loan, index) in loans" :key="loan._id"
      :class="{ active: index === activeIndex }" @click="$emit('update:activeIndex', index)">
      <i class="fas fa-book-reader mr-2"></i> {{ loan.borrowerName }}
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    loans: { type: Array, default: () => [] },
    activeIndex: { type: Number, default: -1 },
  },
  emits: ["update:activeIndex"],
};
</script>

<style scoped>
.list-group-item {
  cursor: pointer;
}

.list-group-item.active {
  background-color: #5a6268;
  /* Màu xám thư viện thay cho màu xanh contact */
  border-color: #5a6268;
}
</style>