<template>
  <div v-if="contact" class="page">
    <h4>Thêm mới Liên hệ</h4>
    <ContactForm :contact="contact" @submit:contact="createContact" />
    <p>{{ message }}</p>
  </div>
</template>
<script>
import ContactForm from "@/components/ContactForm.vue";
import ContactService from "@/services/loan.service";
export default {
  components: {
    ContactForm,
  },

  data() {
    return {

      contact: {
        name: "",
        email: "",
        address: "",
        phone: "",
        favorite: false,
      },
      message: "",
    };
  },
  methods: {
    async createContact(data) {
      try {

        await ContactService.create(data);
        this.message = "Liên hệ mới đã được thêm";


        setTimeout(() => {
          this.$router.push({ name: "contactbook" });
        }, 1000);
      } catch (error) {
        console.log(error);
        this.message = "Có lỗi xảy ra khi thêm liên hệ";
      }
    },
  },

};
</script>