import axios from "axios";

const API = axios.create({
  baseURL: "https://cricketiq-d9pw.onrender.com"
});

export default API;
