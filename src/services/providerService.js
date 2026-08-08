import { toast } from 'react-toastify';

const STORAGE_KEY = 'apihub_provider_state_v1';
const DRAFT_KEY = 'apihub_provider_draft_v1';

const defaultProfile = {
  fullName: 'Aarav Patel',
  email: 'provider@apihub.dev',
  companyName: 'Northstar Labs',
  website: 'https://northstarlabs.dev',
  description: 'Northstar Labs builds secure developer tooling for modern teams.',
  supportEmail: 'support@northstarlabs.dev',
  contactNumber: '+91 98765 43210',
  country: 'India',
  logo: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=120&q=80',
  publishedApis: 18
};

const defaultApis = [
  {
    id: 'api-weather',
    name: 'Weather Intelligence API',
    shortDescription: 'Real-time weather and forecasting data for global products.',
    fullDescription: 'Weather Intelligence API delivers precise weather, alerts, and historical climate insights for apps, dashboards, and mobile teams.',
    category: 'Weather',
    version: '1.0',
    logo: 'https://images.unsplash.com/photo-1533651181853-3b7a1e4d3d5b?auto=format&fit=crop&w=120&q=80',
    status: 'APPROVED',
    tags: ['forecast', 'alerts', 'weather'],
    baseUrl: 'https://api.example.com/v1',
    authType: 'API_KEY',
    rateLimit: 1000,
    timeout: 30,
    supportUrl: 'https://support.example.com',
    subscribers: 1840,
    requests: 48000,
    revenue: 12400,
    successRate: '98.4%',
    responseTime: '210ms',
    lastUpdated: '2026-08-03T10:15:00.000Z',
    createdAt: '2026-06-01T09:00:00.000Z',
    deleted: false,
    plans: [
      { id: 'plan-free', name: 'Free', price: 0, billingCycle: 'FREE', requestLimit: 100, description: 'Basic access for experimentation', status: 'ACTIVE' },
      { id: 'plan-starter', name: 'Starter', price: 499, billingCycle: 'MONTHLY', requestLimit: 10000, description: 'Production-ready usage', status: 'ACTIVE' }
    ],
    documentation: {
      authGuide: 'Include your API key in the X-API-Key header.',
      baseEndpoint: 'https://api.example.com/v1/weather/current',
      headers: 'X-API-Key: your-key',
      requestExample: 'GET /weather/current\nAuthorization: Bearer ...',
      responseExample: '{\n  "temperature": 28,\n  "condition": "Clear"\n}',
      errorCodes: '400, 401, 404, 429, 500',
      markdown: '# Weather Intelligence API\n\nUse this endpoint to fetch current conditions and forecasts.'
    },
    activity: [
      { id: 'a1', label: 'API published', time: '2 days ago' },
      { id: 'a2', label: 'Starter plan added', time: '1 day ago' },
      { id: 'a3', label: 'Documentation updated', time: '6 hours ago' }
    ],
    rejectionReason: ''
  },
  {
    id: 'api-vision',
    name: 'Vision AI Gateway',
    shortDescription: 'Image analysis and annotation APIs for product teams.',
    fullDescription: 'Vision AI Gateway gives teams OCR, label detection, and moderation support.',
    category: 'AI',
    version: '2.1',
    logo: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=120&q=80',
    status: 'PENDING',
    tags: ['ai', 'ocr', 'vision'],
    baseUrl: 'https://ai.example.com/v2',
    authType: 'BEARER_TOKEN',
    rateLimit: 500,
    timeout: 45,
    supportUrl: 'https://help.northstarlabs.dev',
    subscribers: 1320,
    requests: 31000,
    revenue: 9800,
    successRate: '96.8%',
    responseTime: '320ms',
    lastUpdated: '2026-08-01T16:30:00.000Z',
    createdAt: '2026-07-01T09:00:00.000Z',
    deleted: false,
    plans: [
      { id: 'plan-pro', name: 'Pro', price: 1499, billingCycle: 'MONTHLY', requestLimit: 100000, description: 'High-volume model usage', status: 'ACTIVE' }
    ],
    documentation: {
      authGuide: 'Use a bearer token from the developer dashboard.',
      baseEndpoint: 'https://ai.example.com/v2/analyze',
      headers: 'Authorization: Bearer <token>',
      requestExample: 'POST /analyze\nContent-Type: application/json',
      responseExample: '{\n  "labels": ["car", "person"],\n  "confidence": 0.96\n}',
      errorCodes: '400, 401, 429, 500',
      markdown: '# Vision AI Gateway\n\nUse this endpoint to extract labels and metadata from images.'
    },
    activity: [
      { id: 'b1', label: 'Submitted for review', time: '1 day ago' },
      { id: 'b2', label: 'Plans adjusted', time: '6 hours ago' }
    ],
    rejectionReason: ''
  },
  {
    id: 'api-payments',
    name: 'Payments Vault',
    shortDescription: 'Secure payment orchestration for multi-rail experiences.',
    fullDescription: 'Payments Vault helps teams process transactions, reconcile events and manage payment safety.',
    category: 'Payments',
    version: '3.0',
    logo: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=120&q=80',
    status: 'REJECTED',
    tags: ['payments', 'settlement'],
    baseUrl: 'https://payments.example.com/v3',
    authType: 'OAUTH2',
    rateLimit: 200,
    timeout: 60,
    supportUrl: 'https://payments.example.com/support',
    subscribers: 410,
    requests: 8000,
    revenue: 3200,
    successRate: '94.2%',
    responseTime: '380ms',
    lastUpdated: '2026-07-21T14:10:00.000Z',
    createdAt: '2026-05-06T11:00:00.000Z',
    deleted: false,
    plans: [
      { id: 'plan-enterprise', name: 'Enterprise', price: 2499, billingCycle: 'MONTHLY', requestLimit: 1000000, description: 'High-volume payments', status: 'ACTIVE' }
    ],
    documentation: {
      authGuide: 'Use OAuth2 client credentials.',
      baseEndpoint: 'https://payments.example.com/v3/charges',
      headers: 'Authorization: Bearer <token>',
      requestExample: 'POST /charges\nContent-Type: application/json',
      responseExample: '{\n  "id": "ch_123",\n  "status": "succeeded"\n}',
      errorCodes: '400, 401, 404, 429, 500',
      markdown: '# Payments Vault\n\nUse this endpoint to create and reconcile payment charges.'
    },
    activity: [
      { id: 'c1', label: 'Rejected for missing docs', time: '2 days ago' },
      { id: 'c2', label: 'Feedback shared with provider', time: '1 day ago' }
    ],
    rejectionReason: 'Please provide more complete authentication documentation.'
  }
];

const defaultSubscribers = [
  { id: 'sub-1', name: 'Meera Shah', email: 'meera@octo.dev', api: 'Weather Intelligence API', plan: 'Starter', status: 'Active', started: '2026-07-14', renewal: '2026-09-14', requests: 14500, revenue: 499 },
  { id: 'sub-2', name: 'Arjun Rao', email: 'arjun@finflow.ai', api: 'Vision AI Gateway', plan: 'Pro', status: 'Active', started: '2026-07-09', renewal: '2026-09-09', requests: 11850, revenue: 1499 },
  { id: 'sub-3', name: 'Naina Verma', email: 'naina@lumenlabs.co', api: 'Payments Vault', plan: 'Enterprise', status: 'Paused', started: '2026-06-20', renewal: '2026-08-20', requests: 8700, revenue: 2499 }
];

const buildInitialState = () => ({
  profile: defaultProfile,
  apis: defaultApis,
  subscribers: defaultSubscribers,
  revenue: {
    metrics: {
      monthlyRevenue: 12400,
      totalRevenue: 26400,
      mrr: 12400,
      activePaidSubscriptions: 86,
      averageRevenuePerSubscriber: 144,
      pendingPayout: 5200
    },
    series: [
      { name: 'Jan', value: 7200 },
      { name: 'Feb', value: 8100 },
      { name: 'Mar', value: 9400 },
      { name: 'Apr', value: 10700 },
      { name: 'May', value: 11800 },
      { name: 'Jun', value: 12400 }
    ],
    byApi: [
      { name: 'Weather', value: 6400 },
      { name: 'Vision AI', value: 3500 },
      { name: 'Payments', value: 2500 }
    ],
    byPlan: [
      { name: 'Free', value: 900 },
      { name: 'Starter', value: 4200 },
      { name: 'Pro', value: 7200 }
    ],
    transactions: [
      { id: 1, consumer: 'Meera Shah', api: 'Weather Intelligence API', plan: 'Starter', amount: 499, status: 'Settled', createdAt: '2026-08-03' },
      { id: 2, consumer: 'Arjun Rao', api: 'Vision AI Gateway', plan: 'Pro', amount: 1499, status: 'Settled', createdAt: '2026-08-02' },
      { id: 3, consumer: 'Naina Verma', api: 'Payments Vault', plan: 'Enterprise', amount: 2499, status: 'Pending', createdAt: '2026-08-01' }
    ]
  },
  analytics: {
    metrics: {
      totalRequests: 124000,
      successfulRequests: 118000,
      failedRequests: 6000,
      successRate: '95.2%',
      averageLatency: '218ms',
      uniqueConsumers: 318
    },
    requestsSeries: [
      { name: 'Mon', value: 18000 },
      { name: 'Tue', value: 22000 },
      { name: 'Wed', value: 20500 },
      { name: 'Thu', value: 24800 },
      { name: 'Fri', value: 23800 },
      { name: 'Sat', value: 26000 }
    ],
    errorSeries: [
      { name: '4xx', value: 1800 },
      { name: '5xx', value: 900 },
      { name: 'Timeouts', value: 600 },
      { name: 'Rate limited', value: 300 }
    ],
    topEndpoints: [
      { endpoint: '/weather/current', method: 'GET', requests: 18200, successRate: '99.1%', latency: '180ms' },
      { endpoint: '/vision/analyze', method: 'POST', requests: 10200, successRate: '97.8%', latency: '320ms' },
      { endpoint: '/payments/charge', method: 'POST', requests: 8400, successRate: '95.4%', latency: '280ms' }
    ]
  }
});

const delay = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms));

const readState = () => {
  if (typeof window === 'undefined') {
    return buildInitialState();
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const initialState = buildInitialState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
    return initialState;
  }
  return JSON.parse(stored);
};

const writeState = (state) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
};

const readDraft = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(DRAFT_KEY);
};

const writeDraft = (draft) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }
};

const clearDraft = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(DRAFT_KEY);
  }
};

export const providerService = {
  async getDashboard() {
    await delay();
    const state = readState();
    const published = state.apis.filter((api) => api.status === 'APPROVED' && !api.deleted).length;
    const pending = state.apis.filter((api) => api.status === 'PENDING' && !api.deleted).length;
    const totalSubscribers = state.apis.reduce((sum, api) => sum + api.subscribers, 0);
    const requests = state.apis.reduce((sum, api) => sum + api.requests, 0);
    const revenue = state.apis.reduce((sum, api) => sum + api.revenue, 0);
    return {
      stats: [
        { label: 'Total APIs', value: state.apis.filter((api) => !api.deleted).length.toString(), change: '+3' },
        { label: 'Published APIs', value: published.toString(), change: '+2' },
        { label: 'Pending APIs', value: pending.toString(), change: '1 urgent' },
        { label: 'Subscribers', value: totalSubscribers.toLocaleString('en-IN'), change: '+14%' },
        { label: 'Monthly Revenue', value: `₹${revenue.toLocaleString('en-IN')}`, change: '+8%' },
        { label: 'API Requests', value: requests.toLocaleString('en-IN'), change: '+19%' }
      ],
      recentApis: state.apis.filter((api) => !api.deleted).slice(0, 3),
      revenueSeries: [
        { name: 'Jan', value: 6200 },
        { name: 'Feb', value: 7800 },
        { name: 'Mar', value: 7400 },
        { name: 'Apr', value: 9800 },
        { name: 'May', value: 11200 },
        { name: 'Jun', value: 12400 }
      ],
      usageSeries: [
        { name: 'Mon', value: 1400 },
        { name: 'Tue', value: 2000 },
        { name: 'Wed', value: 1870 },
        { name: 'Thu', value: 2440 },
        { name: 'Fri', value: 2320 },
        { name: 'Sat', value: 2900 }
      ],
      activity: [
        { id: 1, label: 'Weather API submitted for review', time: '2 hours ago' },
        { id: 2, label: 'Payments plan updated', time: '5 hours ago' },
        { id: 3, label: 'Vision AI documentation refreshed', time: '1 day ago' }
      ]
    };
  },

  async getApis(filters = {}) {
    await delay();
    const state = readState();
    let apis = state.apis.filter((api) => !api.deleted);
    const search = filters.search?.toLowerCase() || '';
    if (search) {
      apis = apis.filter((api) => [api.name, api.shortDescription, api.category, api.version].join(' ').toLowerCase().includes(search));
    }
    if (filters.status && filters.status !== 'ALL') {
      apis = apis.filter((api) => api.status === filters.status);
    }
    if (filters.category) {
      apis = apis.filter((api) => api.category === filters.category);
    }
    switch (filters.sort) {
      case 'OLDEST':
        apis.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'NAME_ASC':
        apis.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'NAME_DESC':
        apis.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'MOST_REQUESTS':
        apis.sort((a, b) => b.requests - a.requests);
        break;
      case 'MOST_SUBSCRIBERS':
        apis.sort((a, b) => b.subscribers - a.subscribers);
        break;
      default:
        apis.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
    }
    return apis;
  },

  async getApiById(id) {
    await delay();
    const state = readState();
    return state.apis.find((api) => api.id === id && !api.deleted) || null;
  },

  async createApi(data) {
    await delay();
    const state = readState();
    const api = {
      id: `api-${Date.now()}`,
      name: data.name || 'Untitled API',
      shortDescription: data.shortDescription || 'Draft API',
      fullDescription: data.fullDescription || '',
      category: data.category || 'Developer Tools',
      version: data.version || '1.0',
      logo: data.logo || 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=120&q=80',
      status: data.status || 'DRAFT',
      tags: data.tags || [],
      baseUrl: data.baseUrl || '',
      authType: data.authType || 'API_KEY',
      rateLimit: data.rateLimit || 1000,
      timeout: data.timeout || 30,
      supportUrl: data.supportUrl || '',
      subscribers: 0,
      requests: 0,
      revenue: 0,
      successRate: '0%',
      responseTime: '0ms',
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      deleted: false,
      plans: data.plans || [],
      documentation: data.documentation || {
        authGuide: '',
        baseEndpoint: '',
        headers: '',
        requestExample: '',
        responseExample: '',
        errorCodes: '',
        markdown: ''
      },
      activity: data.activity || [{ id: `activity-${Date.now()}`, label: 'Draft created', time: 'Just now' }],
      rejectionReason: ''
    };
    state.apis = [api, ...state.apis];
    writeState(state);
    clearDraft();
    return api;
  },

  async updateApi(id, data) {
    await delay();
    const state = readState();
    state.apis = state.apis.map((api) => api.id === id ? { ...api, ...data, lastUpdated: new Date().toISOString() } : api);
    writeState(state);
    return state.apis.find((api) => api.id === id);
  },

  async deleteApi(id) {
    await delay();
    const state = readState();
    state.apis = state.apis.map((api) => api.id === id ? { ...api, deleted: true, status: 'ARCHIVED' } : api);
    writeState(state);
    return true;
  },

  async archiveApi(id) {
    await delay();
    const state = readState();
    state.apis = state.apis.map((api) => api.id === id ? { ...api, status: 'ARCHIVED' } : api);
    writeState(state);
    return true;
  },

  async submitApi(id) {
    await delay();
    const state = readState();
    state.apis = state.apis.map((api) => api.id === id ? { ...api, status: 'PENDING', submittedAt: new Date().toISOString() } : api);
    writeState(state);
    return state.apis.find((api) => api.id === id);
  },

  async getPlans(apiId) {
    await delay();
    const api = await this.getApiById(apiId);
    return api?.plans || [];
  },

  async createPlan(apiId, data) {
    await delay();
    const state = readState();
    state.apis = state.apis.map((api) => api.id === apiId ? { ...api, plans: [...(api.plans || []), { id: `plan-${Date.now()}`, ...data }], lastUpdated: new Date().toISOString() } : api);
    writeState(state);
    return true;
  },

  async updatePlan(apiId, planId, data) {
    await delay();
    const state = readState();
    state.apis = state.apis.map((api) => api.id === apiId ? { ...api, plans: (api.plans || []).map((plan) => plan.id === planId ? { ...plan, ...data } : plan), lastUpdated: new Date().toISOString() } : api);
    writeState(state);
    return true;
  },

  async deletePlan(apiId, planId) {
    await delay();
    const state = readState();
    state.apis = state.apis.map((api) => api.id === apiId ? { ...api, plans: (api.plans || []).filter((plan) => plan.id !== planId), lastUpdated: new Date().toISOString() } : api);
    writeState(state);
    return true;
  },

  async getDocumentation(apiId) {
    await delay();
    const api = await this.getApiById(apiId);
    return api?.documentation || null;
  },

  async saveDocumentation(apiId, data) {
    await delay();
    const state = readState();
    state.apis = state.apis.map((api) => api.id === apiId ? { ...api, documentation: data, lastUpdated: new Date().toISOString() } : api);
    writeState(state);
    return true;
  },

  async getSubscribers() {
    await delay();
    const state = readState();
    return state.subscribers;
  },

  async getRevenue() {
    await delay();
    const state = readState();
    return state.revenue;
  },

  async getAnalytics() {
    await delay();
    const state = readState();
    return state.analytics;
  },

  async getProfile() {
    await delay();
    const state = readState();
    return state.profile;
  },

  async updateProfile(data) {
    await delay();
    const state = readState();
    state.profile = { ...state.profile, ...data };
    writeState(state);
    return state.profile;
  },

  async saveDraft(draft) {
    await delay(200);
    writeDraft(draft);
    return draft;
  },

  async getDraft() {
    await delay(200);
    const draft = readDraft();
    return draft ? JSON.parse(draft) : null;
  },

  async resetMockData() {
    await delay();
    const initialState = buildInitialState();
    writeState(initialState);
    clearDraft();
    toast.success('Mock data restored.');
    return initialState;
  }
};

export default providerService;
