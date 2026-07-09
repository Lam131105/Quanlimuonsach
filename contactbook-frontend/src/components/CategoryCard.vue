<template>
  <div class="card shadow-sm border border-light rounded">
    <div class="card-header bg-light font-weight-bold text-secondary">
      <i class="fas fa-info-circle mr-1"></i> Chi tiết thể loại
    </div>
    <div class="card-body">
      <div class="p-1 mb-2">
        <strong>Mã thể loại:</strong>
        <span class="badge badge-secondary ml-1 px-2 py-1">{{
          category.categoryid
        }}</span>
      </div>
      <div class="p-1 mb-2">
        <strong>Tên thể loại:</strong>
        {{ category.name }}
      </div>
      <div class="p-1 mb-2">
        <strong>Mô tả / Ghi chú:</strong>
        <p
          class="text-muted small mt-1 pl-2 border-left"
          style="white-space: pre-line"
        >
          {{ category.description || "Không có mô tả cho thể loại này." }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    category: { type: Object, required: true },
  },
};
</script>
