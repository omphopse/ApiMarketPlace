import { toast } from 'react-toastify';
import { providerService } from './providerService';
import { consumerService } from './consumerService';

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

const getProviderState = () => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem('apihub_provider_state_v1');
  return raw ? JSON.parse(raw) : null;
};

const writeProviderState = (state) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('apihub_provider_state_v1', JSON.stringify(state));
  }
};

const buildActivity = (actor, action, target, details) => ({
  id: `activity-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  actor,
  action,
  target,
  details,
  timestamp: new Date().toISOString(),
  role: actor?.role || 'ADMIN'
});

const readState = () => {
  const state = getProviderState();
  if (!state) {
    return {
      profile: {},
      apis: [],
      subscribers: [],
      revenue: {},
      analytics: {},
      categories: [],
      payments: [],
      activities: [],
      users: [],
      settings: {}
    };
  }
  return {
    ...state,
    apis: state.apis || [],
    categories: state.categories || [],
    payments: state.payments || [],
    activities: state.activities || [],
    users: state.users || [],
    settings: state.settings || {}
  };
};

const ensureSeedData = () => {
  if (typeof window === 'undefined') return;
  const state = getProviderState();
  if (!state) {
    const fallback = {
      profile: {},
      apis: [],
      subscribers: [],
      revenue: {},
      analytics: {},
      categories: [],
      payments: [],
      activities: [],
      users: [],
      settings: {}
    };
    writeProviderState(fallback);
  }
};

export const adminService = {
  async getDashboard() {
    await delay();
    ensureSeedData();
    const state = readState();
    const providerState = getProviderState();
    const apis = providerState?.apis || [];
    const visibleApis = apis.filter((api) => !api.deleted);
    const pending = visibleApis.filter((api) => api.status === 'PENDING').length;
    const approved = visibleApis.filter((api) => ['APPROVED', 'PUBLISHED'].includes(api.status)).length;
    const rejected = visibleApis.filter((api) => api.status === 'REJECTED').length;
    const archived = visibleApis.filter((api) => api.status === 'ARCHIVED').length;
    const subscriptions = (providerState?.consumer?.subscriptions || []).length;
    const payments = (providerState?.payments || []).length;
    const revenue = visibleApis.reduce((sum, api) => sum + (Number(api.revenue) || 0), 0);

    return {
      stats: [
        { label: 'Total Users', value: '3', change: '+8%' },
        { label: 'Total Providers', value: '1', change: '+2%' },
        { label: 'Total Consumers', value: '1', change: '+5%' },
        { label: 'Published APIs', value: approved.toString(), change: '+1' },
        { label: 'Pending Approvals', value: pending.toString(), change: 'Live queue' },
        { label: 'Active Subscriptions', value: subscriptions.toString(), change: '+3' },
        { label: 'Platform Revenue', value: `₹${revenue.toLocaleString('en-IN')}`, change: '+12%' },
        { label: 'API Requests', value: visibleApis.reduce((sum, api) => sum + (Number(api.requests) || 0), 0).toLocaleString('en-IN'), change: '+9%' }
      ],
      pendingApis: visibleApis.filter((api) => api.status === 'PENDING').slice(0, 4),
      activityFeed: (providerState?.activities || []).slice(0, 6),
      statusDistribution: [
        { name: 'Draft', value: visibleApis.filter((api) => api.status === 'DRAFT').length },
        { name: 'Pending', value: pending },
        { name: 'Approved', value: approved },
        { name: 'Rejected', value: rejected },
        { name: 'Archived', value: archived }
      ],
      growthData: [
        { name: 'Jan', users: 1, providers: 1, consumers: 1, apis: 1 },
        { name: 'Feb', users: 1, providers: 1, consumers: 1, apis: 2 },
        { name: 'Mar', users: 2, providers: 1, consumers: 1, apis: 3 },
        { name: 'Apr', users: 2, providers: 1, consumers: 1, apis: 4 },
        { name: 'May', users: 3, providers: 1, consumers: 1, apis: 4 },
        { name: 'Jun', users: 3, providers: 1, consumers: 1, apis: 5 }
      ]
    };
  },

  async getApprovalQueue(filters = {}) {
    await delay();
    const state = readState();
    const providerState = getProviderState();
    const apis = (providerState?.apis || []).filter((api) => !api.deleted);
    let filtered = [...apis];
    const search = (filters.search || '').toLowerCase();
    if (search) {
      filtered = filtered.filter((api) => [api.name, api.category, api.shortDescription, api.providerName || 'Northstar Labs'].join(' ').toLowerCase().includes(search));
    }
    if (filters.status && filters.status !== 'ALL') {
      filtered = filtered.filter((api) => api.status === filters.status);
    }
    if (filters.category) {
      filtered = filtered.filter((api) => api.category === filters.category);
    }
    if (filters.provider) {
      filtered = filtered.filter((api) => (api.providerName || 'Northstar Labs').toLowerCase().includes(filters.provider.toLowerCase()));
    }
    filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return {
      content: filtered,
      page: 0,
      size: 20,
      totalElements: filtered.length,
      totalPages: 1,
      first: true,
      last: true
    };
  },

  async getApiForReview(apiId) {
    await delay();
    const state = readState();
    const providerState = getProviderState();
    return (providerState?.apis || []).find((api) => api.id === apiId) || null;
  },

  async approveApi(apiId) {
    await delay();
    const state = getProviderState();
    if (!state) return null;
    state.apis = state.apis.map((api) => api.id === apiId ? { ...api, status: 'APPROVED', approvedAt: new Date().toISOString(), approvedBy: 'Admin', rejectionReason: '', activity: [...(api.activity || []), { id: `activity-${Date.now()}`, label: 'Approved by admin', time: 'Just now' }] } : api);
    state.activities = [buildActivity({ name: 'Admin', role: 'ADMIN' }, 'API_APPROVED', apiId, 'API approved and published to marketplace'), ...(state.activities || [])];
    writeProviderState(state);
    toast.success('API approved successfully.');
    return state.apis.find((api) => api.id === apiId);
  },

  async rejectApi(apiId, reason) {
    await delay();
    const state = getProviderState();
    if (!state) return null;
    state.apis = state.apis.map((api) => api.id === apiId ? { ...api, status: 'REJECTED', rejectedAt: new Date().toISOString(), rejectedBy: 'Admin', rejectionReason: reason, activity: [...(api.activity || []), { id: `activity-${Date.now()}`, label: 'Rejected by admin', time: 'Just now' }] } : api);
    state.activities = [buildActivity({ name: 'Admin', role: 'ADMIN' }, 'API_REJECTED', apiId, reason), ...(state.activities || [])];
    writeProviderState(state);
    toast.success('API rejected.');
    return state.apis.find((api) => api.id === apiId);
  },

  async getApis(filters = {}) {
    await delay();
    const state = getProviderState();
    const apis = (state?.apis || []).filter((api) => !api.deleted);
    let filtered = [...apis];
    const search = (filters.search || '').toLowerCase();
    if (search) {
      filtered = filtered.filter((api) => [api.name, api.category, api.providerName || 'Northstar Labs', api.shortDescription].join(' ').toLowerCase().includes(search));
    }
    if (filters.status && filters.status !== 'ALL') {
      filtered = filtered.filter((api) => api.status === filters.status);
    }
    if (filters.category) {
      filtered = filtered.filter((api) => api.category === filters.category);
    }
    if (filters.provider) {
      filtered = filtered.filter((api) => (api.providerName || 'Northstar Labs').toLowerCase().includes(filters.provider.toLowerCase()));
    }
    filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return {
      content: filtered,
      page: 0,
      size: 20,
      totalElements: filtered.length,
      totalPages: 1,
      first: true,
      last: true
    };
  },

  async getApiById(apiId) {
    await delay();
    const state = getProviderState();
    return (state?.apis || []).find((api) => api.id === apiId) || null;
  },

  async archiveApi(apiId) {
    await delay();
    const state = getProviderState();
    state.apis = state.apis.map((api) => api.id === apiId ? { ...api, status: 'ARCHIVED', archivedAt: new Date().toISOString() } : api);
    state.activities = [buildActivity({ name: 'Admin', role: 'ADMIN' }, 'API_ARCHIVED', apiId, 'API archived from marketplace'), ...(state.activities || [])];
    writeProviderState(state);
    toast.success('API archived.');
    return true;
  },

  async getUsers(filters = {}) {
    await delay();
    const state = getProviderState();
    const users = (state?.users || []).length ? state.users : [
      { id: 'user-admin', name: 'Admin User', email: 'admin@apihub.dev', role: 'ADMIN', status: 'ACTIVE', joinedAt: '2026-06-01', lastActive: '2h ago' },
      { id: 'user-provider', name: 'Aarav Patel', email: 'provider@apihub.dev', role: 'PROVIDER', status: 'ACTIVE', joinedAt: '2026-05-12', lastActive: '4h ago' },
      { id: 'user-consumer', name: 'Priya Menon', email: 'consumer@apihub.dev', role: 'CONSUMER', status: 'ACTIVE', joinedAt: '2026-06-18', lastActive: '1h ago' }
    ];
    return users.filter((user) => {
      const search = (filters.search || '').toLowerCase();
      if (search && ![user.name, user.email].join(' ').toLowerCase().includes(search)) return false;
      if (filters.role && filters.role !== 'ALL' && user.role !== filters.role) return false;
      if (filters.status && filters.status !== 'ALL' && user.status !== filters.status) return false;
      return true;
    });
  },

  async getUserById(userId) {
    await delay();
    const users = await this.getUsers();
    return users.find((user) => user.id === userId) || null;
  },

  async suspendUser(userId, reason) {
    await delay();
    const state = getProviderState();
    if (!state) return null;
    state.users = (state.users || []).map((user) => user.id === userId ? { ...user, status: 'SUSPENDED', suspensionReason: reason } : user);
    state.activities = [buildActivity({ name: 'Admin', role: 'ADMIN' }, 'USER_SUSPENDED', userId, reason), ...(state.activities || [])];
    writeProviderState(state);
    toast.success('User suspended.');
    return true;
  },

  async reactivateUser(userId) {
    await delay();
    const state = getProviderState();
    if (!state) return null;
    state.users = (state.users || []).map((user) => user.id === userId ? { ...user, status: 'ACTIVE', suspensionReason: '' } : user);
    state.activities = [buildActivity({ name: 'Admin', role: 'ADMIN' }, 'USER_REACTIVATED', userId, 'Account reactivated'), ...(state.activities || [])];
    writeProviderState(state);
    toast.success('User reactivated.');
    return true;
  },

  async getProviders() {
    await delay();
    const state = getProviderState();
    return [{ id: 'provider-1', name: 'Aarav Patel', company: 'Northstar Labs', status: 'ACTIVE', joinedAt: '2026-05-12', revenue: 26400, publishedApis: 3, pendingApis: 1, subscribers: 2 }];
  },

  async getProviderById(providerId) {
    await delay();
    const providers = await this.getProviders();
    return providers.find((provider) => provider.id === providerId) || null;
  },

  async getConsumers() {
    await delay();
    const state = getProviderState();
    return [{ id: 'consumer-1', name: 'Priya Menon', company: 'Northwind Labs', status: 'ACTIVE', joinedAt: '2026-06-18', subscriptions: 2, requests: 24850, monthlySpend: 1998 }];
  },

  async getConsumerById(consumerId) {
    await delay();
    const consumers = await this.getConsumers();
    return consumers.find((consumer) => consumer.id === consumerId) || null;
  },

  async getCategories() {
    await delay();
    const state = getProviderState();
    const categories = (state?.categories || []).length ? state.categories : [
      { id: 'cat-ai', name: 'AI', description: 'Artificial intelligence APIs', icon: '🤖', status: 'ACTIVE', slug: 'ai', createdAt: '2026-06-01', apiCount: 1 },
      { id: 'cat-weather', name: 'Weather', description: 'Weather and climate APIs', icon: '🌦️', status: 'ACTIVE', slug: 'weather', createdAt: '2026-06-02', apiCount: 1 },
      { id: 'cat-payments', name: 'Payments', description: 'Payments and billing APIs', icon: '💳', status: 'ACTIVE', slug: 'payments', createdAt: '2026-06-03', apiCount: 1 }
    ];
    return categories;
  },

  async createCategory(data) {
    await delay();
    const state = getProviderState();
    const category = { id: `cat-${Date.now()}`, slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'), name: data.name, description: data.description, icon: data.icon || '📦', status: data.status || 'ACTIVE', createdAt: new Date().toISOString(), apiCount: 0 };
    state.categories = [...(state.categories || []), category];
    state.activities = [buildActivity({ name: 'Admin', role: 'ADMIN' }, 'CATEGORY_CREATED', category.id, data.name), ...(state.activities || [])];
    writeProviderState(state);
    toast.success('Category created.');
    return category;
  },

  async updateCategory(id, data) {
    await delay();
    const state = getProviderState();
    state.categories = (state.categories || []).map((category) => category.id === id ? { ...category, ...data } : category);
    writeProviderState(state);
    return true;
  },

  async deactivateCategory(id) {
    await delay();
    const state = getProviderState();
    state.categories = (state.categories || []).map((category) => category.id === id ? { ...category, status: 'INACTIVE' } : category);
    writeProviderState(state);
    toast.success('Category deactivated.');
    return true;
  },

  async getPayments(filters = {}) {
    await delay();
    const state = getProviderState();
    const payments = (state?.payments || []).length ? state.payments : [
      { id: 'pay-1', reference: 'DEMO-PAY-0001', consumer: 'Priya Menon', provider: 'Northstar Labs', api: 'Weather Intelligence API', plan: 'Starter', amount: 499, platformFee: 49, providerShare: 450, status: 'SETTLED', date: '2026-08-03' },
      { id: 'pay-2', reference: 'DEMO-PAY-0002', consumer: 'Priya Menon', provider: 'Northstar Labs', api: 'Vision AI Gateway', plan: 'Pro', amount: 1499, platformFee: 150, providerShare: 1349, status: 'SETTLED', date: '2026-08-01' }
    ];
    return payments;
  },

  async getReports(filters = {}) {
    await delay();
    return {
      userGrowth: [
        { name: 'Jan', value: 1 },
        { name: 'Feb', value: 1 },
        { name: 'Mar', value: 2 },
        { name: 'Apr', value: 2 },
        { name: 'May', value: 3 },
        { name: 'Jun', value: 3 }
      ],
      apiGrowth: [
        { name: 'Jan', value: 1 },
        { name: 'Feb', value: 2 },
        { name: 'Mar', value: 3 },
        { name: 'Apr', value: 4 },
        { name: 'May', value: 4 },
        { name: 'Jun', value: 5 }
      ],
      revenueGrowth: [
        { name: 'Jan', value: 1200 },
        { name: 'Feb', value: 1800 },
        { name: 'Mar', value: 2600 },
        { name: 'Apr', value: 3200 },
        { name: 'May', value: 3700 },
        { name: 'Jun', value: 4200 }
      ],
      approvalRate: 85,
      metrics: {
        totalUsers: 3,
        totalProviders: 1,
        totalConsumers: 1,
        totalApis: 5,
        subscriptions: 2,
        revenue: 4200
      }
    };
  },

  async getActivities(filters = {}) {
    await delay();
    const state = getProviderState();
    return (state?.activities || []).slice(0, 20);
  },

  async getSettings() {
    await delay();
    const state = getProviderState();
    return state?.settings || {
      marketplaceName: 'APIHub',
      supportEmail: 'support@apihub.dev',
      defaultCurrency: 'INR',
      allowProviderRegistration: true,
      allowConsumerRegistration: true,
      requireApiApproval: true,
      allowResubmission: true,
      showRejectionReasonsToProviders: true,
      paymentProvider: 'Razorpay — Not Connected',
      platformFeePercent: 10,
      currency: 'INR'
    };
  },

  async updateSettings(data) {
    await delay();
    const state = getProviderState();
    state.settings = { ...(state.settings || {}), ...data };
    writeProviderState(state);
    toast.success('Settings updated.');
    return state.settings;
  },

  async exportReports() {
    await delay();
    const report = await this.getReports();
    const rows = [
      ['Metric', 'Value'],
      ['Users', report.metrics.totalUsers],
      ['Providers', report.metrics.totalProviders],
      ['Consumers', report.metrics.totalConsumers],
      ['APIs', report.metrics.totalApis],
      ['Subscriptions', report.metrics.subscriptions],
      ['Revenue', report.metrics.revenue]
    ];
    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `apihub-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported.');
    return true;
  }
};

export default adminService;
