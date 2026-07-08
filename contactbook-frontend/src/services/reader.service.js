import axios from "axios";

const commonConfig = {
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

class ReaderService {
  constructor(baseUrl = "/api/readers") {
    this.api = axios.create({
      baseURL: baseUrl,
      ...commonConfig,
    });
  }
  // async getAll() {
  //   return (await this.api.get("/")).data;
  // }
  async create(data) {
    return (await this.api.post("/", data)).data;
  }
  // async deleteAll() {
  //   return (await this.api.delete("/")).data;
  // }
  // async get(id) {
  //   return (await this.api.get(`/${id}`)).data;
  // }
  async update(id, data) {
    return (await this.api.put(`/${id}`, data)).data;
  }
  // async delete(id) {
  //   return (await this.api.delete(`/${id}`)).data;
  // }

  async login(data) {
    // data gồm { gmail, password }
    return (await this.api.post("/login", data)).data;
  }
}

export default new ReaderService();
