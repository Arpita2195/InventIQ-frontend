import axios from "axios";

// PRODUCTION BACKEND URL (Render)
// Note: Hardcoded for reliable connection in simple deployments. 
// If using env vars, ensure VITE_API_URL is set in Vercel.
const apiUrl = "https://inventiq-backend-wcm4.onrender.com";
const api = axios.create({ baseURL: `${apiUrl}/api` });

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("inventiq_user") || "{}");
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("inventiq_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export default api;
