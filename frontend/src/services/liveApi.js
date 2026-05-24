import axios from "axios";

const LIVE_API = axios.create({

  baseURL: "https://cricketiq-d9pw.onrender.com"

});

export default LIVE_API;