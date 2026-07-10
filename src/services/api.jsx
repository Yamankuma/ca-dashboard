import axios from "axios";

const API = axios.create({
  baseURL: `${window.location.origin}/api`,
});

// AUTO TOKEN SEND

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;
