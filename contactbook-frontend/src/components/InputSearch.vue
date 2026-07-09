<!-- <template>
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
</script> -->

<template>
  <div class="row no-gutters shadow-sm rounded border bg-white p-2">
    <div class="col-md-5 mb-2 mb-md-0 pr-md-2">
      <div class="input-group input-group-sm">
        <div class="input-group-prepend">
          <span
            class="input-group-text bg-transparent border-right-0 text-muted"
          >
            <i class="fas fa-book"></i>
          </span>
        </div>
        <input
          type="text"
          class="form-control border-left-0"
          placeholder="Nhập tên sách, tác giả..."
          :value="modelValue.name"
          @input="updateFilter('name', $event.target.value)"
          @keyup.enter="$emit('submit')"
        />
      </div>
    </div>

    <div class="col-md-3 mb-2 mb-md-0 pr-md-2">
      <select
        class="form-control form-control-sm text-muted"
        :value="modelValue.publisherId"
        @change="updateFilter('publisherId', $event.target.value)"
      >
        <option value="">-- Tất cả NXB --</option>
        <option v-for="pub in publishers" :key="pub._id" :value="pub._id">
          {{ pub.name }}
        </option>
      </select>
    </div>

    <div class="col-md-3 mb-2 mb-md-0 pr-md-2">
      <select
        class="form-control form-control-sm text-muted"
        :value="modelValue.categoryId"
        @change="updateFilter('categoryId', $event.target.value)"
      >
        <option value="">-- Tất cả Thể loại --</option>
        <option v-for="cat in categories" :key="cat._id" :value="cat._id">
          {{ cat.name }}
        </option>
      </select>
    </div>

    <div class="col-md-1">
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
import CategoryService from "@/services/category.service";
import PublisherService from "@/services/publisher.service";

export default {
  props: {
    // Kiểu dữ liệu modelValue lúc này nhận vào là một Object gồm 3 trường
    modelValue: {
      type: Object,
      default: () => ({ name: "", publisherId: "", categoryId: "" }),
    },
  },
  emits: ["update:modelValue", "submit"],
  data() {
    return {
      categories: [], // Dùng để chứa danh sách thể loại đổ vào dropdown
      publishers: [], // Dùng để chứa danh sách NXB đổ vào dropdown
    };
  },
  methods: {
    // Hàm cập nhật gián tiếp từng thuộc tính của Object bộ lọc phát ra ngoài trang cha
    updateFilter(key, value) {
      this.$emit("update:modelValue", {
        ...this.modelValue,
        [key]: value,
      });
    },
    async fetchCategories() {
      try {
        this.categories = await CategoryService.getAll();
      } catch (error) {
        console.error("Lỗi lấy danh sách thể loại:", error);
      }
    },
    async fetchPublishers() {
      try {
        this.publishers = await PublisherService.getAll();
      } catch (error) {
        console.error("Lỗi lấy danh sách NXB:", error);
      }
    },
  },
  created() {
    this.fetchCategories();
    this.fetchPublishers();
  },
};
</script>
