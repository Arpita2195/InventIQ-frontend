import api from './axiosInstance'

// --- Inventory API ---
export const inventoryApi = {
  getAll: () => api.get('/inventory'),
  getLowStock: () => api.get('/inventory/low-stock'),
  add: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  remove: (id) => api.delete(`/inventory/${id}`),
  classify: (name) => api.get(`/inventory/classify?name=${name}`),
}

// --- Chat API ---
export const chatApi = {
  send: (message) => api.post('/chat', { message }),
  getHistory: () => api.get('/chat/history'),
  getReports: (days = 7) => api.get(`/chat/reports?days=${days}`),
}

// --- Auth API ---
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
}

// --- Billing API ---
export const billApi = {
  getAll: () => api.get('/bills'),
  getOne: (id) => api.get(`/bills/${id}`),
  create: (data) => api.post('/bills', data),
  getStats: () => api.get('/bills/stats'),
}

// --- Notification API ---
export const notificationApi = {
  get: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
}

// --- Supplier API ---
export const supplierApi = {
  get: () => api.get('/suppliers'),
  add: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  remove: (id) => api.delete(`/suppliers/${id}`),
}

// --- Customer (Khata) API ---
export const customerApi = {
  get: () => api.get('/customers'),
  add: (data) => api.post('/customers', data),
  updateUdhar: (id, data) => api.put(`/customers/${id}/udhar`, data),
  remove: (id) => api.delete(`/customers/${id}`),
}
