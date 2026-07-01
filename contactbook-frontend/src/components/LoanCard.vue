<template>
  <div>
    <div class="p-1">
      <strong>Tên người mượn:</strong>
      {{ loan.borrowerName }}
    </div>
    <div class="p-1">
      <strong>Sách mượn:</strong>
      {{ loan.bookTitle }}
    </div>
    <div class="p-1">
      <strong>Ngày mượn:</strong>
      {{ loan.loanDate }}
    </div>
    <div class="p-1">
      <strong>Điện thoại:</strong>
      {{ loan.phone }}
    </div>
    <div class="p-1">
      <strong>Trạng thái:</strong>
      <span v-if="loan.isReturned" class="badge badge-success">
        <i class="fas fa-check"></i> Đã trả sách
      </span>
      <span v-else class="badge badge-danger">
        <i class="fas fa-times"></i> Đang mượn
      </span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    loan: { type: Object, required: true },
  },
};
</script>
