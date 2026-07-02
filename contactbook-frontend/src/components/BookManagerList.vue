<template>
  <div class="table-responsive shadow-sm rounded border">
    <table class="table table-hover table-striped mb-0 align-middle">
      <thead class="bg-dark text-white">
        <tr>
          <th scope="col" style="width: 5%">#</th>
          <th scope="col" style="width: 12%">Ảnh bìa</th>
          <th scope="col" style="width: 30%">Tên cuốn sách</th>
          <th scope="col" style="width: 20%">Tác giả</th>
          <th scope="col" style="width: 15%">Thể loại</th>
          <th scope="col" style="width: 18%" class="text-center">Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(book, index) in books" :key="book._id">
          <th scope="row" class="font-weight-bold">{{ index + 1 }}</th>

          <td>
            <img
              v-if="book.imgUrl"
              :src="getBookImage(book.imgUrl)"
              alt="Bìa"
              class="img-thumbnail table-book-img"
              @error="handleImageError"
            />
            <div
              v-else
              class="no-img-thumb rounded d-flex align-items-center justify-content-center"
            >
              <i class="fas fa-book text-secondary small"></i>
            </div>
          </td>

          <td class="font-weight-bold text-primary">{{ book.name }}</td>

          <td class="text-secondary">{{ book.auth || "Chưa cập nhật" }}</td>

          <td>
            <span class="badge badge-secondary p-2">{{
              book.category || "N/A"
            }}</span>
          </td>

          <td class="text-center">
            <div class="btn-group btn-group-sm" role="group">
              <button
                class="btn btn-warning text-dark font-weight-bold mr-1 rounded"
                @click="$emit('edit', book._id)"
                title="Chỉnh sửa"
              >
                <i class="fas fa-edit"></i> Sửa
              </button>

              <button
                class="btn btn-danger font-weight-bold rounded"
                @click="$emit('delete', book._id)"
                title="Xóa sách"
              >
                <i class="fas fa-trash-alt"></i> Xóa
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    books: { type: Array, default: () => [] },
  },
  emits: ["edit", ["delete"]],
  methods: {
    getBookImage(imageName) {
      if (!imageName) return "";
      return new URL(`/src/assets/imgbook/${imageName}`, import.meta.url).href;
    },
    handleImageError(e) {
      e.target.style.display = "none";
    },
  },
};
</script>

<style scoped>
.table-book-img {
  width: 50px;
  height: 65px;
  object-fit: cover;
}
.no-img-thumb {
  width: 50px;
  height: 65px;
  background-color: #e9ecef;
  border: 1px dashed #ced4da;
}
.table td,
.table th {
  vertical-align: middle;
}
</style>
