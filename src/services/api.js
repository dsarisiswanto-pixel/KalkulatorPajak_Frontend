import axios from "axios";

const api = axios.create({
    baseURL: "http://103.163.37.26:3039/api",
    headers: {
        "Content-Type": "application/json",
    } 
});

export default api;