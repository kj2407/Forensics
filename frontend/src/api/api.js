import axios from "axios";

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api" });

// Attach JWT to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("forensics_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect on 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("forensics_token");
      localStorage.removeItem("forensics_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────────────
export const authAPI = {
  login:    (data) => API.post("/auth/login", data),
  register: (data) => API.post("/auth/register", data),
  me:       ()     => API.get("/auth/me"),
};

// ── Cases ─────────────────────────────────────────────────────
export const casesAPI = {
  getAll:  (params) => API.get("/cases", { params }),
  getById: (id)     => API.get(`/cases/${id}`),
  create:  (data)   => API.post("/cases", data),
  update:  (id, d)  => API.put(`/cases/${id}`, d),
  delete:  (id)     => API.delete(`/cases/${id}`),
};

// ── Evidence ─────────────────────────────────────────────────
export const evidenceAPI = {
  getAll:  (params) => API.get("/evidence", { params }),
  getById: (id)     => API.get(`/evidence/${id}`),
  create:  (data)   => API.post("/evidence", data),
  update:  (id, d)  => API.put(`/evidence/${id}`, d),
  delete:  (id)     => API.delete(`/evidence/${id}`),
};

// ── Reports ──────────────────────────────────────────────────
export const reportsAPI = {
  getAll:  (params) => API.get("/reports", { params }),
  getById: (id)     => API.get(`/reports/${id}`),
  create:  (data)   => API.post("/reports", data),
  update:  (id, d)  => API.put(`/reports/${id}`, d),
  delete:  (id)     => API.delete(`/reports/${id}`),
};

// ── Dashboard ────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => API.get("/dashboard/stats"),
};

// ── Users ────────────────────────────────────────────────────
export const usersAPI = {
  getAll:  ()      => API.get("/users"),
  getById: (id)    => API.get(`/users/${id}`),
  update:  (id, d) => API.put(`/users/${id}`, d),
  delete:  (id)    => API.delete(`/users/${id}`),
};

export default API;