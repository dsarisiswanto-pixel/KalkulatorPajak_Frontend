import axios from "axios";

const api = axios.create({
    baseURL: "http://103.163.37.26:3039/api",
    headers: {
        "Content-Type": "application/json",
    } 
    // baseURL: "http://192.168.111.164:8000/api",
});

export default api;