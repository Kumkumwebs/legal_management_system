import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


// ================= REQUEST INTERCEPTOR =================
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access_token");
    const token = localStorage.getItem("token");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else if (token) {
      config.headers.Authorization = `Token ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// ================= RESPONSE INTERCEPTOR =================
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // ✅ Unauthorized → logout only if NOT already on login page
    if (status === 401) {
      const isOnLoginPage = window.location.pathname === '/login';
      if (!isOnLoginPage) {
        console.warn("Unauthorized - logging out");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    // Forbidden (permission issue)
    if (status === 403) {
      console.warn("Forbidden - permission denied");
    }

    // Debug 400 errors
    if (status === 400) {
      console.error("Bad Request:", error.response.data);
    }

    return Promise.reject(error);
  }
);

export default apiClient;


// ─── PLANS ──────────────────────────────────────────────
export const plansAPI = {
  getAll: () => apiClient.get("/plans/"),
  subscribe: (id) => apiClient.post(`/plans/${id}/subscribe/`, {}),
  getActive: () => apiClient.get("/subscriptions/active/"),
};