<template>
  <div>
    <!-- Nếu có dữ liệu mượn thì render ra cấu trúc lưới Grid -->
    <div v-if="loans.length > 0" class="loan-grid">
      <MyLoansCard 
        v-for="loan in loans" 
        :key="loan._id"
        :loan="loan"
        :books="books"
        @cancel-loan="$emit('cancel-loan', $event)"
        @view-detail="$emit('view-detail', $event)"
      />
    </div>

    <!-- Trường hợp rỗng (Empty State) -->
    <div v-else class="text-center text-muted py-5 empty-state">
      <i class="fas fa-folder-open fa-3x mb-3 text-secondary"></i>
      <p class="lead">Bạn không có phiếu mượn nào trong danh mục này.</p>
    </div>
  </div>
</template>

<script>
import MyLoansCard from "./MyLoansCard.vue";

export default {
  name: "MyLoansList",
  components: {
    MyLoansCard
  },
  props: {
    loans: { type: Array, required: true },
    books: { type: Array, required: true }
  }
};
</script>

<style scoped>
/* Định nghĩa lưới Grid tự co giãn siêu mượt theo kích thước thiết bị */
.loan-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}
.empty-state {
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #dee2e6;
}
</style>