import { toast } from 'react-toastify';

const STORAGE_KEY = 'apihub_provider_state_v1';

const createMockApiKey = (prefix = 'amp_live') => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const hex = Array.from(array, (value) => value.toString(16).padStart(2, '0')).join('');
  return `${prefix}_${hex}`;
};

const buildInitialState = () => ({
  profile: {
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
  },
  apis: [
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
        { id: 'plan-starter', name: 'Starter', price: 499, billingCycle: 'MONTHLY', requestLimit: 10000, description: 'Production-ready usage', status: 'ACTIVE' },
        { id: 'plan-pro', name: 'Pro', price: 1499, billingCycle: 'MONTHLY', requestLimit: 100000, description: 'High-volume model usage', status: 'ACTIVE' }
      ],
      documentation: {
        authGuide: 'Include your API key in the X-API-Key header.',
        baseEndpoint: 'https://api.example.com/v1/weather/current',
        headers: 'X-API-Key: your-key',
        requestExample: 'GET /weather/current\nAuthorization: Bearer ...',
        responseExample: '{\n  "temperature": 28,\n  "condition": "Clear"\n}',
        errorCodes: '400, 401, 404, 429, 500',
        markdown: '# Weather Intelligence API\n\nUse this endpoint to fetch current conditions and forecasts.'
      }
    },
    {
      id: 'api-vision',
      name: 'Vision AI Gateway',
      shortDescription: 'Image analysis and annotation APIs for product teams.',
      fullDescription: 'Vision AI Gateway gives teams OCR, label detection, and moderation support.',
      category: 'AI',
      version: '2.1',
      logo: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=120&q=80',
      status: 'APPROVED',
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
        { id: 'plan-free', name: 'Free', price: 0, billingCycle: 'FREE', requestLimit: 100, description: 'Basic access for experimentation', status: 'ACTIVE' },
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
      }
    },
    {
      id: 'api-payments',
      name: 'Payments Vault',
      shortDescription: 'Secure payment orchestration for multi-rail experiences.',
      fullDescription: 'Payments Vault helps teams process transactions, reconcile events and manage payment safety.',
      category: 'Payments',
      version: '3.0',
      logo: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=120&q=80',
      status: 'APPROVED',
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
        { id: 'plan-starter', name: 'Starter', price: 499, billingCycle: 'MONTHLY', requestLimit: 10000, description: 'Production-ready payments', status: 'ACTIVE' },
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
      }
    },
    {
      id: 'api-maps',
      name: 'Geo Atlas Maps',
      shortDescription: 'Interactive maps, geocoding and routing for modern apps.',
      fullDescription: 'Geo Atlas Maps brings geocoding, route planning, and map tiles into one developer-friendly API.',
      category: 'Maps',
      version: '4.2',
      logo: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=120&q=80',
      status: 'APPROVED',
      tags: ['maps', 'routing', 'geocoding'],
      baseUrl: 'https://maps.example.com/v4',
      authType: 'API_KEY',
      rateLimit: 700,
      timeout: 35,
      supportUrl: 'https://maps.example.com/support',
      subscribers: 880,
      requests: 18000,
      revenue: 6100,
      successRate: '97.1%',
      responseTime: '250ms',
      lastUpdated: '2026-08-05T09:10:00.000Z',
      createdAt: '2026-04-11T09:00:00.000Z',
      deleted: false,
      plans: [
        { id: 'plan-free', name: 'Free', price: 0, billingCycle: 'FREE', requestLimit: 100, description: 'Basic access for experimentation', status: 'ACTIVE' },
        { id: 'plan-boost', name: 'Boost', price: 799, billingCycle: 'MONTHLY', requestLimit: 25000, description: 'Higher volume requests', status: 'ACTIVE' }
      ],
      documentation: {
        authGuide: 'Pass your API key via the X-API-Key header.',
        baseEndpoint: 'https://maps.example.com/v4/geocode',
        headers: 'X-API-Key: your-key',
        requestExample: 'GET /geocode?q=London',
        responseExample: '{\n  "city": "London"\n}',
        errorCodes: '400, 401, 404, 429',
        markdown: '# Geo Atlas Maps\n\nUse this endpoint to geocode locations and build route experiences.'
      }
    }
  ],
  consumer: {
    profile: {
      fullName: 'Priya Menon',
      email: 'consumer@apihub.dev',
      displayName: 'Priya',
      companyName: 'Northwind Labs',
      website: 'https://northwindlabs.dev',
      country: 'India',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80'
    },
    subscriptions: [
      {
        id: 'sub-weather',
        apiId: 'api-weather',
        apiName: 'Weather Intelligence API',
        providerName: 'Northstar Labs',
        planId: 'plan-starter',
        planName: 'Starter',
        price: 499,
        billingCycle: 'MONTHLY',
        requestLimit: 10000,
        requestsUsed: 6250,
        status: 'ACTIVE',
        startedAt: '2026-07-10',
        renewalDate: '2026-09-10',
        successRate: '98.4%',
        responseTime: '210ms',
        docsAccess: true
      },
      {
        id: 'sub-vision',
        apiId: 'api-vision',
        apiName: 'Vision AI Gateway',
        providerName: 'Northstar Labs',
        planId: 'plan-pro',
        planName: 'Pro',
        price: 1499,
        billingCycle: 'MONTHLY',
        requestLimit: 100000,
        requestsUsed: 18200,
        status: 'ACTIVE',
        startedAt: '2026-06-20',
        renewalDate: '2026-09-20',
        successRate: '96.8%',
        responseTime: '320ms',
        docsAccess: true
      }
    ],
    apiKeys: [
      {
        id: 'key-weather',
        subscriptionId: 'sub-weather',
        label: 'Weather Intelligence API',
        key: 'amp_live_9b4f913aafc148ef0f2a807ba1c12911',
        maskedKey: 'amp_live_9b4f••••••••••••••',
        status: 'ACTIVE',
        createdAt: '2026-07-10',
        lastUsed: '2 hours ago'
      }
    ],
    usage: {
      metrics: {
        totalRequests: 24850,
        successfulRequests: 23680,
        failedRequests: 1170,
        remainingRequests: 75150,
        successRate: '95.3%',
        averageResponseTime: '248ms'
      },
      requestsSeries: [
        { name: 'Mon', value: 4200 },
        { name: 'Tue', value: 4800 },
        { name: 'Wed', value: 4550 },
        { name: 'Thu', value: 5200 },
        { name: 'Fri', value: 4900 },
        { name: 'Sat', value: 6100 }
      ],
      errorSeries: [
        { name: '4xx', value: 780 },
        { name: '5xx', value: 220 },
        { name: 'Timeouts', value: 170 }
      ],
      recentRequests: [
        { id: 1, time: '08:14', api: 'Weather Intelligence API', endpoint: '/weather/current', method: 'GET', status: 200, responseTime: '180ms' },
        { id: 2, time: '08:40', api: 'Vision AI Gateway', endpoint: '/vision/analyze', method: 'POST', status: 201, responseTime: '290ms' },
        { id: 3, time: '09:02', api: 'Weather Intelligence API', endpoint: '/weather/forecast', method: 'GET', status: 429, responseTime: '220ms' }
      ]
    },
    billing: {
      monthlySpend: 1998,
      activePaidPlans: 2,
      nextPayment: '2026-09-10',
      totalSpent: 8450,
      history: [
        { id: 'inv-001', date: '2026-08-01', api: 'Weather Intelligence API', plan: 'Starter', amount: 499, status: 'PAID', reference: 'DEMO-INV-001' },
        { id: 'inv-002', date: '2026-07-01', api: 'Vision AI Gateway', plan: 'Pro', amount: 1499, status: 'PAID', reference: 'DEMO-INV-002' }
      ]
    },
    checkout: null
  }
});

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

const readState = () => {
  if (typeof window === 'undefined') return buildInitialState();
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const initialState = buildInitialState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
    return initialState;
  }

  const parsed = JSON.parse(stored);
  const base = buildInitialState();
  return {
    ...base,
    ...parsed,
    apis: parsed.apis || base.apis,
    consumer: {
      profile: { ...base.consumer.profile, ...(parsed.consumer?.profile || {}) },
      subscriptions: parsed.consumer?.subscriptions || base.consumer.subscriptions,
      apiKeys: parsed.consumer?.apiKeys || base.consumer.apiKeys,
      usage: { ...base.consumer.usage, ...(parsed.consumer?.usage || {}) },
      billing: { ...base.consumer.billing, ...(parsed.consumer?.billing || {}) },
      checkout: parsed.consumer?.checkout || null
    }
  };
};

const writeState = (state) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
};

export const consumerService = {
  async getDashboard() {
    await delay();
    const state = readState();
    const visibleApis = state.apis.filter((api) => !api.deleted && ['APPROVED', 'PUBLISHED'].includes(api.status));
    const activeSubscriptions = state.consumer.subscriptions.filter((subscription) => subscription.status === 'ACTIVE');
    return {
      stats: [
        { label: 'Active APIs', value: activeSubscriptions.length.toString(), change: '+2' },
        { label: 'Requests This Month', value: state.consumer.usage.metrics.totalRequests.toLocaleString('en-IN'), change: '+12%' },
        { label: 'Remaining Requests', value: state.consumer.usage.metrics.remainingRequests.toLocaleString('en-IN'), change: '75%' },
        { label: 'Monthly Spend', value: `₹${state.consumer.billing.monthlySpend.toLocaleString('en-IN')}`, change: '+3%' },
        { label: 'API Keys', value: state.consumer.apiKeys.length.toString(), change: '2 active' },
        { label: 'Success Rate', value: state.consumer.usage.metrics.successRate, change: '+1.2%' }
      ],
      subscriptions: activeSubscriptions.slice(0, 3),
      usageSeries: state.consumer.usage.requestsSeries,
      recommendedApis: visibleApis.slice(0, 3)
    };
  },

  async getMarketplaceApis(filters = {}) {
    await delay();
    const state = readState();
    let apis = state.apis.filter((api) => !api.deleted && ['APPROVED', 'PUBLISHED'].includes(api.status));
    const search = filters.search?.toLowerCase() || '';
    if (search) {
      apis = apis.filter((api) => [api.name, api.shortDescription, api.category, api.tags?.join(' ') || '', api.providerName || 'Northstar Labs'].join(' ').toLowerCase().includes(search));
    }
    if (filters.category && filters.category !== 'All') {
      apis = apis.filter((api) => api.category === filters.category);
    }
    if (filters.pricing && filters.pricing !== 'All') {
      const hasFreePlan = api => (api.plans || []).some((plan) => Number(plan.price) === 0);
      if (filters.pricing === 'Free') {
        apis = apis.filter((api) => hasFreePlan(api));
      } else {
        apis = apis.filter((api) => !hasFreePlan(api));
      }
    }
    if (filters.provider) {
      apis = apis.filter((api) => (api.providerName || 'Northstar Labs').toLowerCase().includes(filters.provider.toLowerCase()));
    }
    switch (filters.sort) {
      case 'NEWEST':
        apis.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'NAME_ASC':
        apis.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'PRICE_ASC':
        apis.sort((a, b) => (a.plans?.[0]?.price || 0) - (b.plans?.[0]?.price || 0));
        break;
      case 'PRICE_DESC':
        apis.sort((a, b) => (b.plans?.[0]?.price || 0) - (a.plans?.[0]?.price || 0));
        break;
      case 'POPULAR':
        apis.sort((a, b) => b.subscribers - a.subscribers);
        break;
      default:
        apis.sort((a, b) => b.subscribers - a.subscribers);
    }
    const page = Number(filters.page || 0);
    const size = Number(filters.size || 12);
    const start = page * size;
    const end = start + size;
    return {
      content: apis.slice(start, end),
      page,
      size,
      totalElements: apis.length,
      totalPages: Math.max(1, Math.ceil(apis.length / size)),
      first: page === 0,
      last: page >= Math.max(0, Math.ceil(apis.length / size) - 1)
    };
  },

  async getMarketplaceApiById(id) {
    await delay();
    const state = readState();
    return state.apis.find((api) => api.id === id && !api.deleted && ['APPROVED', 'PUBLISHED'].includes(api.status)) || null;
  },

  async getApiPlans(apiId) {
    await delay();
    const api = await this.getMarketplaceApiById(apiId);
    return api?.plans || [];
  },

  async getApiById(id) { return this.getMarketplaceApiById(id); },

  async getSubscriptions(filters = {}) {
    await delay();
    const state = readState();
    let subscriptions = state.consumer.subscriptions;
    const search = filters.search?.toLowerCase() || '';
    if (search) {
      subscriptions = subscriptions.filter((subscription) => subscription.apiName.toLowerCase().includes(search));
    }
    if (filters.status && filters.status !== 'ALL') {
      subscriptions = subscriptions.filter((subscription) => subscription.status === filters.status);
    }
    switch (filters.sort) {
      case 'RENEWAL':
        subscriptions.sort((a, b) => a.renewalDate.localeCompare(b.renewalDate));
        break;
      case 'PRICE':
        subscriptions.sort((a, b) => b.price - a.price);
        break;
      default:
        subscriptions.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
    }
    return subscriptions;
  },

  async getSubscriptionById(id) {
    await delay();
    const state = readState();
    return state.consumer.subscriptions.find((subscription) => subscription.id === id) || null;
  },

  async createSubscription(apiId, planId) {
    await delay();
    const state = readState();
    const api = state.apis.find((candidate) => candidate.id === apiId);
    const plan = api?.plans?.find((candidate) => candidate.id === planId);
    if (!api || !plan) {
      throw new Error('Unable to find the selected API or plan.');
    }
    const subscription = {
      id: `sub-${Date.now()}`,
      apiId: api.id,
      apiName: api.name,
      providerName: api.providerName || 'Northstar Labs',
      planId: plan.id,
      planName: plan.name,
      price: Number(plan.price),
      billingCycle: plan.billingCycle,
      requestLimit: Number(plan.requestLimit),
      requestsUsed: 0,
      status: 'PENDING',
      startedAt: new Date().toISOString().slice(0, 10),
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      successRate: api.successRate || '98.0%',
      responseTime: api.responseTime || '250ms',
      docsAccess: Boolean(plan.price >= 0)
    };
    state.consumer.subscriptions = [subscription, ...state.consumer.subscriptions];
    const key = {
      id: `key-${Date.now()}`,
      subscriptionId: subscription.id,
      label: api.name,
      key: createMockApiKey('amp_live'),
      maskedKey: `${createMockApiKey('amp_live').slice(0, 16)}••••••••`,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().slice(0, 10),
      lastUsed: 'Just now'
    };
    state.consumer.apiKeys = [{ ...key, maskedKey: `${key.key.slice(0, 12)}••••••` }, ...state.consumer.apiKeys];
    state.consumer.checkout = { apiId, planId, status: 'SUCCESS', subscriptionId: subscription.id, key };
    writeState(state);
    return subscription;
  },

  async createPendingSubscription(apiId, planId) {
    await delay();
    const state = readState();
    const api = state.apis.find((candidate) => candidate.id === apiId);
    const plan = api?.plans?.find((candidate) => candidate.id === planId);
    if (!api || !plan) {
      throw new Error('Unable to find the selected API or plan.');
    }
    const subscription = {
      id: `sub-${Date.now()}`,
      apiId: api.id,
      apiName: api.name,
      providerName: api.providerName || 'Northstar Labs',
      planId: plan.id,
      planName: plan.name,
      price: Number(plan.price),
      billingCycle: plan.billingCycle,
      requestLimit: Number(plan.requestLimit),
      requestsUsed: 0,
      status: 'PENDING',
      startedAt: new Date().toISOString().slice(0, 10),
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      successRate: api.successRate || '98.0%',
      responseTime: api.responseTime || '250ms',
      docsAccess: Boolean(plan.price >= 0)
    };
    state.consumer.subscriptions = [subscription, ...state.consumer.subscriptions];
    state.consumer.checkout = { apiId, planId, status: 'PENDING', subscriptionId: subscription.id };
    writeState(state);
    return subscription;
  },

  async getApiKeys() {
    await delay();
    const state = readState();
    return state.consumer.apiKeys;
  },

  async regenerateApiKey(subscriptionId) {
    await delay();
    const state = readState();
    const subscription = state.consumer.subscriptions.find((candidate) => candidate.id === subscriptionId);
    if (!subscription) throw new Error('Subscription not found.');
    const existing = state.consumer.apiKeys.find((key) => key.subscriptionId === subscriptionId);
    if (existing) {
      existing.status = 'REVOKED';
    }
    const newKey = {
      id: `key-${Date.now()}`,
      subscriptionId,
      label: subscription.apiName,
      key: createMockApiKey('amp_live'),
      maskedKey: `${createMockApiKey('amp_live').slice(0, 12)}••••••`,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().slice(0, 10),
      lastUsed: 'Just now'
    };
    state.consumer.apiKeys = [newKey, ...state.consumer.apiKeys.filter((key) => key.subscriptionId !== subscriptionId)];
    writeState(state);
    return newKey;
  },

  async revokeApiKey(keyId) {
    await delay();
    const state = readState();
    state.consumer.apiKeys = state.consumer.apiKeys.map((key) => key.id === keyId ? { ...key, status: 'REVOKED' } : key);
    writeState(state);
    return true;
  },

  async cancelSubscription(id) {
    await delay();
    const state = readState();
    state.consumer.subscriptions = state.consumer.subscriptions.map((subscription) => subscription.id === id ? { ...subscription, status: 'CANCELLED' } : subscription);
    state.consumer.apiKeys = state.consumer.apiKeys.map((key) => key.subscriptionId === id ? { ...key, status: 'REVOKED' } : key);
    writeState(state);
    return true;
  },

  async getDocumentation(subscriptionId) {
    await delay();
    const state = readState();
    const subscription = state.consumer.subscriptions.find((candidate) => candidate.id === subscriptionId);
    const api = state.apis.find((candidate) => candidate.id === subscription?.apiId);
    return api ? { subscription, api, documentation: api.documentation } : null;
  },

  async getUsage(filters = {}) {
    await delay();
    const state = readState();
    return {
      metrics: state.consumer.usage.metrics,
      requestsSeries: state.consumer.usage.requestsSeries,
      errorSeries: state.consumer.usage.errorSeries,
      recentRequests: state.consumer.usage.recentRequests.filter((request) => (!filters.apiId || request.api === state.apis.find((api) => api.id === filters.apiId)?.name) && (!filters.range || true))
    };
  },

  async getBilling() {
    await delay();
    const state = readState();
    return state.consumer.billing;
  },

  async getProfile() {
    await delay();
    const state = readState();
    return state.consumer.profile;
  },

  async updateProfile(data) {
    await delay();
    const state = readState();
    state.consumer.profile = { ...state.consumer.profile, ...data };
    writeState(state);
    return state.consumer.profile;
  },

  async getCheckoutState() {
    await delay();
    const state = readState();
    return state.consumer.checkout;
  },

  async clearCheckoutState() {
    await delay();
    const state = readState();
    state.consumer.checkout = null;
    writeState(state);
    return true;
  }
};

export default consumerService;
