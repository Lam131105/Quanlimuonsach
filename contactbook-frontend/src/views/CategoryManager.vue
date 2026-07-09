<template>
  <div class="container mt-3">
    <div class="row">
      <div class="col-md-12">
        <h4 class="text-center text-secondary mb-4">
          <i class="fas fa-tags"></i> HỆ THỐNG QUẢN LÝ THỂ LOẠI SÁCH
        </h4>
      </div>
    </div>

    <div class="row">
      <div class="col-md-7">
        <div class="mb-3">
          <InputSearch v-model="searchText" @submit="searchCategories" />
        </div>

        <h5 class="mt-4">
          <i class="fas fa-list-ul"></i> Danh sách thể loại hiện có
        </h5>

        <CategoryList
          v-if="filteredCategories.length > 0"
          :categories="filteredCategories"
          v-model:activeIndex="activeIndex"
        />
        <p v-else class="text-muted mt-3">Không tìm thấy thể loại sách nào.</p>
      </div>

      <div class="col-md-5">
        <div v-if="activeCategory">
          <h5 class="text-info">
            <i class="fas fa-info-circle"></i> Chi tiết thể loại
          </h5>
          <div class="card p-3 shadow-sm bg-light">
            <CategoryCard :category="activeCategory" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import InputSearch from "@/components/InputSearch.vue";
import CategoryList from "@/components/CategoryList.vue";
import CategoryCard from "@/components/CategoryCard.vue";
import CategoryService from "@/services/category.service";

export default {
  components: {
    InputSearch,
    CategoryList,
    CategoryCard,
  },
  data() {
    return {
      categories: [], // Lưu danh sách tất cả thể loại tải từ backend về
      searchText: "",
      activeIndex: -1, // Lưu vị trí dòng đang được chọn trong danh sách
    };
  },
  watch: {
    // Giám sát ô tìm kiếm, nếu thay đổi chữ gõ vào thì xóa mục đang chọn tránh bị lệch index
    searchText() {
      this.activeIndex = -1;
    },
  },
  computed: {
    // Lọc danh sách thể loại dựa trên chuỗi tìm kiếm searchText
    filteredCategories() {
      if (!this.searchText) return this.categories;
      return this.categories.filter((cat) => {
        // Tìm kiếm không phân biệt chữ hoa chữ thường theo Tên thể loại hoặc Mô tả thể loại
        const nameMatch = cat.name
          ?.toLowerCase()
          .includes(this.searchText.toLowerCase());
        const descMatch = cat.description
          ?.toLowerCase()
          .includes(this.searchText.toLowerCase());
        return nameMatch || descMatch;
      });
    },
    // Trả về đối tượng thể loại cụ thể đang được người dùng click chọn
    activeCategory() {
      if (this.activeIndex < 0) return null;
      return this.filteredCategories[this.activeIndex];
    },
  },
  methods: {
    // Hàm gọi API lấy tất cả thể loại từ backend
    async retrieveCategories() {
      try {
        this.categories = await CategoryService.getAll();
      } catch (error) {
        console.log(error);
      }
    },
    // Hàm xử lý tải lại danh sách thể loại mới nhất khi bấm nút tìm kiếm
    async searchCategories() {
      try {
        this.activeIndex = -1;
        this.categories = await CategoryService.getAll();
      } catch (error) {
        console.log(error);
      }
    },
    // goToAddCategory() {
    //   this.$router.push({ name: "category.add" });
    // },
  },
  // Khi component được gắn vào DOM, tự động kéo dữ liệu thể loại lên giao diện ngay lập tức
  mounted() {
    this.retrieveCategories();
  },
};
</script>
