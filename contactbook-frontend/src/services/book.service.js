import axios from "axios";

class BookService {
  constructor(baseUrl = "/api/books") {
    this.api = axios.create({
      baseURL: baseUrl,
      headers: {
        Accept: "application/json",
        // Không ép cứng Content-Type toàn cục ở đây nữa để Axios tự động nhận diện
      },
    });
  }

  async getAll() {
    return (await this.api.get("/")).data;
  }

  // SỬA HÀM CREATE: Ép kiểu multipart/form-data khi gửi kèm file
  async create(data) {
    return (
      await this.api.post("/", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    ).data;
  }

  // SỬA HÀM UPDATE: Tương tự như create, vì sửa sách cũng có thể đổi ảnh mới
  async update(id, data) {
    return (
      await this.api.put(`/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    ).data;
  }

  async deleteAll() {
    return (await this.api.delete("/")).data;
  }

  async get(id) {
    return (await this.api.get(`/${id}`)).data;
  }

  async delete(id) {
    return (await this.api.delete(`/${id}`)).data;
  }
}

export default new BookService();
