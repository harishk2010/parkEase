import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err.response?.data || err)
);

export const floorAPI = {
  getAll: () => api.get('/floors'),
  getById: (id) => api.get(`/floors/${id}`),
  create: (data) => api.post('/floors', data),
  update: (id, data) => api.put(`/floors/${id}`, data),
  delete: (id) => api.delete(`/floors/${id}`),
  getOccupancySummary: () => api.get('/floors/occupancy-summary'),
};

export const vehicleTypeAPI = {
  getAll: () => api.get('/vehicle-types'),
  getById: (id) => api.get(`/vehicle-types/${id}`),
  create: (data) => api.post('/vehicle-types', data),
  update: (id, data) => api.put(`/vehicle-types/${id}`, data),
  addSubClass: (id, data) => api.post(`/vehicle-types/${id}/subclasses`, data),
  removeSubClass: (id, subClassId) => api.delete(`/vehicle-types/${id}/subclasses/${subClassId}`),
  delete: (id) => api.delete(`/vehicle-types/${id}`),
};

export const ticketAPI = {
  getAll: (params) => api.get('/tickets', { params }),
  getById: (id) => api.get(`/tickets/${id}`),
  getByTicketNumber: (num) => api.get(`/tickets/number/${num}`),
  getActive: () => api.get('/tickets/active'),
  create: (data) => api.post('/tickets', data),
  processExit: (ticketNumber) => api.patch(`/tickets/exit/${ticketNumber}`),
  cancel: (id) => api.patch(`/tickets/${id}/cancel`),
  getDailyStats: (date) => api.get('/tickets/stats/daily', { params: { date } }),
};

export const paymentAPI = {
  getAll: (params) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  getByTicketId: (ticketId) => api.get(`/payments/ticket/${ticketId}`),
  create: (data) => api.post('/payments', data),
  confirm: (id, transactionId) => api.patch(`/payments/${id}/confirm`, { transactionId }),
  refund: (id, reason) => api.patch(`/payments/${id}/refund`, { reason }),
  getRevenueStats: (params) => api.get('/payments/stats/revenue', { params }),
  getDailyRevenue: (days) => api.get('/payments/stats/daily', { params: { days } }),
  getMethodBreakdown: () => api.get('/payments/stats/methods'),
};
