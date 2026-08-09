import apiClient from './apiClient';
import { getStoredUser } from '../utils/auth';

const unwrapError = (error) => {
  const message = error?.response?.data?.message || error?.response?.data?.error;
  return new Error(message || error?.message || 'Unable to complete the consumer request.');
};

const request = async (operation) => {
  try {
    const response = await operation();
    return response.data;
  } catch (error) {
    throw unwrapError(error);
  }
};

const normalizeSubscription = (subscription) => ({
  ...subscription,
  id: subscription.subscriptionId,
  apiName: subscription.api?.name || 'API unavailable',
  providerName: 'Provider unavailable',
  planName: subscription.plan?.name || 'Plan unavailable',
  price: Number(subscription.plan?.price || 0),
  renewalDate: subscription.createdAt ? new Date(subscription.createdAt).toLocaleDateString() : 'Not available'
});

const normalizeSubscriptionDetails = (subscription) => ({
  ...subscription,
  id: subscription.subscriptionId,
  renewalDate: subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : 'Not available',
  requestLimit: subscription.usageSummary?.requestLimit ?? 0,
  requestsUsed: subscription.usageSummary?.totalRequests ?? 0,
  successRate: subscription.usageSummary?.totalRequests
    ? `${Math.round(((subscription.usageSummary.successfulRequests || 0) / subscription.usageSummary.totalRequests) * 100)}%`
    : 'Not available',
  responseTime: 'Not returned by backend',
  docsAccess: Boolean(subscription.documentationAvailable)
});

const buildRequestsSeries = (recentRequests) => {
  const counts = (recentRequests || []).reduce((acc, request) => {
    const key = request.timestamp ? new Date(request.timestamp).toLocaleDateString('en-IN') : 'Unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([name, value]) => ({ name, value }));
};

const normalizeUsage = (usage) => {
  const totalRequests = Number(usage?.totalRequests || 0);
  const successfulRequests = Number(usage?.successfulRequests || 0);
  const failedRequests = Number(usage?.failedRequests || 0);
  const recentRequests = (usage?.recentRequests || []).map((request) => ({
    ...request,
    time: request.timestamp ? new Date(request.timestamp).toLocaleString() : 'Not available',
    api: request.apiName || 'Unknown API',
    method: request.httpMethod,
    status: request.statusCode,
    responseTime: `${request.responseTimeMs} ms`
  }));

  return {
    ...usage,
    metrics: {
      totalRequests,
      successfulRequests,
      failedRequests,
      successRate: totalRequests ? `${Math.round((successfulRequests / totalRequests) * 100)}%` : 'Not available'
    },
    errorSeries: [
      { name: 'Successful', value: successfulRequests },
      { name: 'Failed', value: failedRequests }
    ],
    requestsSeries: usage?.requestsSeries?.length ? usage.requestsSeries : buildRequestsSeries(recentRequests),
    recentRequests
  };
};

export const consumerService = {
  getProfile: () => request(() => apiClient.get('/consumer/profile')),
  updateProfile: (profile) => request(() => apiClient.put('/consumer/profile', profile)),
  uploadProfileImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request(() => apiClient.post('/consumer/profile/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }));
  },
  getDashboard: () => request(() => apiClient.get('/consumer/dashboard')),
  getMarketplaceApis: (filters = {}) => request(() => apiClient.get(getStoredUser()?.role === 'CONSUMER' ? '/consumer/marketplace/apis' : '/marketplace/apis', { params: {
    page: filters.page ?? 0,
    size: filters.size ?? 12,
    search: filters.search || undefined,
    categoryId: filters.categoryId || undefined,
    pricing: filters.pricing || undefined,
    sort: filters.sort || 'NEWEST'
  } })),
  getMarketplaceApiById: (id) => request(() => apiClient.get(`${getStoredUser()?.role === 'CONSUMER' ? '/consumer/marketplace/apis' : '/marketplace/apis'}/${encodeURIComponent(id)}`)),
  getApiPlans: (id) => request(() => apiClient.get(`${getStoredUser()?.role === 'CONSUMER' ? '/consumer/marketplace/apis' : '/marketplace/apis'}/${encodeURIComponent(id)}/plans`)),
  getApiById: (id) => request(() => apiClient.get(`${getStoredUser()?.role === 'CONSUMER' ? '/consumer/marketplace/apis' : '/marketplace/apis'}/${encodeURIComponent(id)}`)),
  createSubscription: (apiId, planId) => request(() => apiClient.post('/consumer/subscriptions', { apiId, planId })),
  getSubscriptions: (filters = {}) => request(() => apiClient.get('/consumer/subscriptions', { params: {
    page: filters.page ?? 0,
    size: filters.size ?? 12,
    status: filters.status && filters.status !== 'ALL' ? filters.status : undefined,
    search: filters.search || undefined
  } })).then((page) => ({
    ...page,
    content: (page?.content || []).map(normalizeSubscription)
  })),
  getSubscriptionById: (id) => request(() => apiClient.get(`/consumer/subscriptions/${encodeURIComponent(id)}`)).then(normalizeSubscriptionDetails),
  cancelSubscription: (id) => request(() => apiClient.patch(`/consumer/subscriptions/${encodeURIComponent(id)}/cancel`)),
  getDocumentation: (id) => request(() => apiClient.get(`/consumer/subscriptions/${encodeURIComponent(id)}/documentation`)),
  getApiKeys: () => request(() => apiClient.get('/consumer/api-keys')),
  regenerateApiKey: (subscriptionId) => request(() => apiClient.post(`/consumer/subscriptions/${encodeURIComponent(subscriptionId)}/api-key/regenerate`)),
  revokeApiKey: (id) => request(() => apiClient.delete(`/consumer/api-keys/${encodeURIComponent(id)}`)),
  getUsage: (filters = {}) => request(() => apiClient.get('/consumer/usage', { params: {
    subscriptionId: filters.subscriptionId || undefined,
    range: filters.range || undefined
  } })).then(normalizeUsage),
  activateSubscription: (id) => request(() => apiClient.post(`/consumer/dev/subscriptions/${encodeURIComponent(id)}/activate`)),
  getBilling: () => { throw new Error('Billing history is not provided by the current backend.'); },
  getCheckoutState: async () => null,
  clearCheckoutState: async () => null
  ,
  // Payments
  createPaymentOrder: (subscriptionId) => request(() => apiClient.post('/consumer/payments/create-order', { subscriptionId })),
  verifyPayment: (payload) => request(() => apiClient.post('/consumer/payments/verify', payload))
};

export default consumerService;
