// src/components/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001", // backend URL
  headers: {
    "Content-Type": "application/json", // default for JSON requests
  },
});

export default API;
