import apiClient from './apiClient';

const unwrapError = (error) => {
  const payload = error?.response?.data;
  const fieldErrors = payload?.details && typeof payload.details === 'object'
    ? Object.entries(payload.details).map(([field, message]) => `${field}: ${message}`).join('; ')
    : '';
  const message = fieldErrors || payload?.message || payload?.error;
  return new Error(message || error?.message || 'Unable to complete the provider request.');
};

const request = async (operation) => {
  try {
    const response = await operation();
    return response.data;
  } catch (error) {
    // preserve server payload for higher-level error handling (field errors)
    const err = unwrapError(error);
    try {
      err.payload = error?.response?.data;
    } catch (_) {
      // ignore
    }
    throw err;
  }
};

const toPlanRequest = (plan = {}) => ({
  planName: plan.planName ?? plan.name,
  price: plan.price,
  billingCycle: plan.billingCycle,
  requestLimit: plan.requestLimit,
  active: plan.active ?? plan.status !== 'INACTIVE'
});

const toApiRequest = (api = {}) => ({
  name: api.name,
  description: api.description ?? api.fullDescription ?? api.shortDescription,
  shortDescription: api.shortDescription,
  fullDescription: api.fullDescription,
  baseUrl: normalizeBaseUrl(api.baseUrl),
  categoryId: api.categoryId ?? api.category,
  logo: api.logo && api.logo.length <= 255 && !api.logo.startsWith('data:') ? api.logo : null,
  version: api.version,
  authenticationType: api.authenticationType ?? api.authType,
  rateLimit: Number(api.rateLimit),
  supportUrl: api.supportUrl,
  timeout: api.timeout != null ? Number(api.timeout) : null,
  tags: Array.isArray(api.tags) ? api.tags : api.tags?.split?.(',').map((tag) => tag.trim()).filter(Boolean),
  plans: api.plans?.map(toPlanRequest),
  documentation: api.documentation ? {
    authenticationGuide: api.documentation.authenticationGuide ?? api.documentation.authGuide,
    baseEndpoint: api.documentation.baseEndpoint,
    headers: api.documentation.headers,
    requestExample: api.documentation.requestExample,
    responseExample: api.documentation.responseExample,
    errorCodes: api.documentation.errorCodes,
    markdown: api.documentation.markdown
  } : null
});

const normalizeBaseUrl = (value) => {
  const trimmed = String(value || '').trim();
  if (!trimmed || /^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const unsupported = (name) => {
  throw new Error(`${name} is not provided by the current backend.`);
};

export const providerService = {
  getProfile: () => request(() => apiClient.get('/provider/profile')),
  updateProfile: (profile) => request(() => apiClient.put('/provider/profile', profile)),
  getDashboard: () => request(() => apiClient.get('/provider/dashboard')),
  getApis: (filters = {}) => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.status && filters.status !== 'ALL') params.status = filters.status;
    if (filters.category) params.category = filters.category;
    if (filters.sort) params.sort = filters.sort;
    return request(() => apiClient.get('/provider/apis', { params }));
  },
  getApiById: (id) => request(() => apiClient.get(`/provider/apis/${encodeURIComponent(id)}`)),
  createApi: (api) => request(() => apiClient.post('/provider/apis', toApiRequest(api))),
  updateApi: (id, api) => request(() => apiClient.put(`/provider/apis/${encodeURIComponent(id)}`, toApiRequest(api))),
  deleteApi: (id) => request(() => apiClient.delete(`/provider/apis/${encodeURIComponent(id)}`)),
  submitApi: (id) => request(() => apiClient.patch(`/provider/apis/${encodeURIComponent(id)}/submit`)),
  archiveApi: (id) => request(() => apiClient.patch(`/provider/apis/${encodeURIComponent(id)}/archive`)),
  getPlans: (id) => request(() => apiClient.get(`/provider/apis/${encodeURIComponent(id)}/plans`)),
  createPlan: (id, plan) => request(() => apiClient.post(`/provider/apis/${encodeURIComponent(id)}/plans`, toPlanRequest(plan))),
  updatePlan: (id, plan) => request(() => apiClient.put(`/provider/plans/${encodeURIComponent(id)}`, toPlanRequest(plan))),
  deletePlan: (id) => request(() => apiClient.delete(`/provider/plans/${encodeURIComponent(id)}`)),
  getDocumentation: (id) => request(() => apiClient.get(`/provider/apis/${encodeURIComponent(id)}/documentation`)),
  createDocumentation: (id, documentation) => request(() => apiClient.post(`/provider/apis/${encodeURIComponent(id)}/documentation`, documentation)),
  saveDocumentation: (id, documentation) => request(() => apiClient.put(`/provider/apis/${encodeURIComponent(id)}/documentation`, documentation)),
  getCategories: () => request(() => apiClient.get('/provider/categories')),
  getApis: (filters = {}) => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.status && filters.status !== 'ALL') params.status = filters.status;
    if (filters.category) params.category = filters.category;
    if (filters.sort) params.sort = filters.sort;
    return request(() => apiClient.get('/provider/apis', { params }));
  },
  uploadLogo: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request(() => apiClient.post('/provider/upload', formData));
  },
  getDraft: async () => null,
  saveDraft: async (draft) => draft,
  getSubscribers: (id, page = 0, size = 10) => request(() => apiClient.get(`/provider/apis/${encodeURIComponent(id)}/subscribers?page=${page}&size=${size}`)),
  getRevenue: () => unsupported('Provider revenue'),
  getAnalytics: () => unsupported('Provider analytics')
};

export default providerService;
