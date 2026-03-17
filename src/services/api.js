import axios from "axios";

const api = axios.create({
    baseURL: "http://192.168.111.164:8000/api",
});

export default api;