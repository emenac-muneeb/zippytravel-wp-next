// apiHelper.js

import axios from "axios";

export const BASE_URL = "https://admin.premierflights.co.uk/api";
export const WP_URL = "https://new.premierflights.co.uk/blog/wp-json/wp/v2/posts";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default api;
