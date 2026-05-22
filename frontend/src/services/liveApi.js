import axios from "axios";

const LIVE_API = axios.create({

  baseURL: "http://127.0.0.1:8000"

});

export default LIVE_API;