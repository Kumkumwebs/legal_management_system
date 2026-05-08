import apiClient from "./client";


// ─── AUTH ───────────────────────────────────────────────
export const authAPI = {
  login: (credentials) => apiClient.post("/auth/login/", credentials),
  addUser: (data) => apiClient.post("/auth/add-user/", data),
  getUsers: () => apiClient.get("/auth/users/"),
  inviteUser: (data) => apiClient.post("/auth/invite/firm/", data),
  acceptInvite: (data) => apiClient.post("/auth/accept-invite/", data),
};


// ─── CLIENTS ────────────────────────────────────────────
export const clientsAPI = {
  getAll: (params) => apiClient.get("/clients/", { params }),
  getOne: (id) => apiClient.get(`/clients/${id}/`),
  create: (data) => apiClient.post("/clients/", data),
  update: (id, data) => apiClient.put(`/clients/${id}/`, data),
  remove: (id) => apiClient.delete(`/clients/${id}/`),
};


// ─── CASES ──────────────────────────────────────────────
export const casesAPI = {
  getAll: (params) => apiClient.get("/cases/", { params }),
  getOne: (id) => apiClient.get(`/cases/${id}/`),
  create: (data) => apiClient.post("/cases/", data),
  update: (id, data) => apiClient.put(`/cases/${id}/`, data),
  delete: (id) => apiClient.delete(`/cases/${id}/`),
};


// ─── DOCUMENTS ──────────────────────────────────────────
export const documentsAPI = {
  getAll: (params) => apiClient.get("/documents/", { params }),

  upload: (formData) =>
    apiClient.post("/documents/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  download: (id) =>
    apiClient.get(`/documents/${id}/download/`, {
      responseType: "blob",
    }),

  delete: (id) =>
    apiClient.delete(`/documents/${id}/`),
};

// ─── PAYMENTS ───────────────────────────────────────────
export const paymentsAPI = {
  getAll: (params) => apiClient.get("/payments/", { params }),
  create: (data) => apiClient.post("/payments/", data),
  update: (id, data) => apiClient.patch(`/payments/${id}/`, data),  
  delete: (id) => apiClient.delete(`/payments/${id}/`),            
};


// ─── FIRMS ──────────────────────────────────────────────
export const firmsAPI = {
  getAll: (params) => apiClient.get("/firms/", { params }),
  getOne: (id) => apiClient.get(`/firms/${id}/`),
  create: (data) => apiClient.post("/firms/", data),
  update: (id, data) => apiClient.put(`/firms/${id}/`, data),
  remove: (id) => apiClient.delete(`/firms/${id}/`),

  toggleActive: (id) => apiClient.post(`/firms/${id}/toggle_active/`),
  toggleBlock: (id) => apiClient.post(`/firms/${id}/toggle_block/`),

  createWithAdmin: (data) => apiClient.post("/admin/create-firm/", data),
};


// ─── PLANS ──────────────────────────────────────────────
export const plansAPI = {
  getAll: () => apiClient.get("/plans/"),

  subscribe: (id) =>
    apiClient.post(`/plans/${id}/subscribe/`, {}),

  getActive: () =>
    apiClient.get("/subscriptions/active/"),
  create: (payload) =>  apiClient.post(`/plans/`, payload),
  update: (id) => apiClient.put(`/plans/${id}/`),
  delete: (id) => apiClient.delete(`/plans/${id}/`),
};


export const hearingsAPI = {
  getAll: (params) => apiClient.get("/hearings/", { params }),
  create: (data) => apiClient.post("/hearings/", data),
  update: (id, data) => apiClient.put(`/hearings/${id}/`, data),
  delete: (id) => apiClient.delete(`/hearings/${id}/`),
};


export const teamAPI = {
  getAll: () => apiClient.get("/team/"), 
};