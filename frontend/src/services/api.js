import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3101/api",
});

export default api;
