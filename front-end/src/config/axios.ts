import axios from "axios";
import { API_URL_BACK_END } from "./env";

const api = axios.create({
  baseURL: API_URL_BACK_END,
});

export default api;
