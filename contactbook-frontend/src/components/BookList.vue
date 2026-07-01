<template>
  <ul class="list-group">
    <li class="list-group-item d-flex justify-content-between align-items-center" v-for="(book, index) in books"
      :key="book._id" :class="{ active: index === activeIndex }" @click="$emit('update:activeIndex', index)">
      <div>
        <i class="fas fa-book mr-2"></i>
        <strong>{{ book.name }}</strong>
        <span class="d-block text-muted small" :class="{ 'text-white-50': index === activeIndex }">
          Tác giả: {{ book.auth || 'Chưa cập nhật' }}
        </span>
      </div>
      <span class="badge badge-secondary p-1.5">{{ book.category || 'N/A' }}</span>
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    books: { type: Array, default: () => [] },
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

.list-group-item:hover {
  background-color: #f8f9fa;
}

.list-group-item.active {
  background-color: #007bff;
  /* Màu xanh đậm đại diện cho quản lý sách */
  border-color: #007bff;
}

.list-group-item.active:hover {
  background-color: #007bff;
}
</style>