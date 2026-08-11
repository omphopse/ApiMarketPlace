import apiClient from './apiClient';

const unwrapError = (error) => {
  const message = error?.response?.data?.message || error?.response?.data?.error;
  return new Error(message || error?.message || 'Unable to complete the admin request.');
};

const request = async (operation) => {
  try {
    const response = await operation();
    return response.data;
  } catch (error) {
    throw unwrapError(error);
  }
};

const unsupported = (name) => {
  throw new Error(`${name} is not provided by the current backend.`);
};

const normalizeRole = (role) => String(role || '').replace(/^ROLE_/, '').toUpperCase();

export const adminService = {
  getDashboard: () => request(() => apiClient.get('/admin/dashboard')),
  getUsers: (filters = {}) => request(() => apiClient.get(filters.search ? '/admin/users/search' : '/admin/users', filters.search ? { params: { keyword: filters.search } } : undefined)),
  getUserById: (id) => request(() => apiClient.get(`/admin/users/${encodeURIComponent(id)}`)),
  deleteUser: (id) => request(() => apiClient.delete(`/admin/users/${encodeURIComponent(id)}`)),
  suspendUser: (id) => request(() => apiClient.put(`/admin/users/${encodeURIComponent(id)}/status`, { enabled: false })),
  reactivateUser: (id) => request(() => apiClient.put(`/admin/users/${encodeURIComponent(id)}/status`, { enabled: true })),
  getPendingProviders: () => request(() => apiClient.get('/admin/providers/pending')),
  approveProvider: (id) => request(() => apiClient.put(`/admin/providers/${encodeURIComponent(id)}/approve`)),
  rejectProvider: (id) => request(() => apiClient.put(`/admin/providers/${encodeURIComponent(id)}/reject`)),
  getApis: () => request(() => apiClient.get('/admin/apis')).then((content) => ({ content })),
  getApprovalQueue: () => request(() => apiClient.get('/admin/apis/pending')).then((content) => ({ content })),
  getApiById: (id) => request(() => apiClient.get(`/admin/apis/${encodeURIComponent(id)}`)),
  getApiForReview: (id) => request(() => apiClient.get(`/admin/apis/${encodeURIComponent(id)}`)),
  approveApi: (id) => request(() => apiClient.put(`/admin/apis/${encodeURIComponent(id)}/approve`)),
  rejectApi: (id) => request(() => apiClient.put(`/admin/apis/${encodeURIComponent(id)}/reject`)),
  changeApiStatus: (id, newStatus, reason) => request(() => apiClient.put(`/admin/apis/${encodeURIComponent(id)}/status`, { newStatus, reason })),
  getCategories: () => request(() => apiClient.get('/admin/categories')),
  getCategoryById: (id) => request(() => apiClient.get(`/admin/categories/${encodeURIComponent(id)}`)),
  createCategory: (category) => request(() => apiClient.post('/admin/categories', category)),
  updateCategory: (id, category) => request(() => apiClient.put(`/admin/categories/${encodeURIComponent(id)}`, category)),
  deactivateCategory: (id) => request(() => apiClient.delete(`/admin/categories/${encodeURIComponent(id)}`)),
  getAnalytics: () => request(() => apiClient.get('/admin/analytics')),
  getAuditLogs: () => request(() => apiClient.get('/admin/audit-logs')),
  getAuditLogById: (id) => request(() => apiClient.get(`/admin/audit-logs/${encodeURIComponent(id)}`)),
  getProviders: async () => (await adminService.getUsers()).filter((user) => normalizeRole(user.role) === 'PROVIDER'),
  getConsumers: async () => (await adminService.getUsers()).filter((user) => normalizeRole(user.role) === 'CONSUMER'),
  getProviderById: (id) => adminService.getUserById(id),
  getConsumerById: (id) => adminService.getUserById(id),
  getPayments: () => unsupported('Admin payment history'),
  getReports: () => unsupported('Admin reports'),
  getActivities: () => unsupported('Admin activity feed'),
  getSettings: () => unsupported('Admin settings'),
  updateSettings: () => unsupported('Admin settings'),
  exportReports: () => unsupported('Report export')
};

export default adminService;
