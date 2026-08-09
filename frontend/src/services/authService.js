import apiClient from './apiClient';
import { getStoredUser, setStoredUser, clearStoredUser } from '../utils/auth';

const normalizeRole = (role) => {
  const normalized = String(role || '').toUpperCase();
  return normalized.startsWith('ROLE_') ? normalized.replace(/^ROLE_/, '') : normalized;
};

const buildStoredUser = ({ token, type, role, userId, fullName, email }) => ({
  token,
  type,
  role: normalizeRole(role),
  userId,
  fullName,
  name: fullName,
  email
});

const getErrorMessage = (error) => {
  const payload = error?.response?.data;
  const serverMessage = payload?.message || payload?.error || payload?.details?.message;
  return serverMessage || error?.message || 'Unable to complete the request.';
};

const authService = {
  async login({ email, password }) {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const user = buildStoredUser(response.data);
      setStoredUser(user);
      return user;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async register({ name, email, password, role }) {
    const normalizedRole = normalizeRole(role);

    try {
      const response = await apiClient.post('/auth/register', {
        fullName: name,
        email,
        password,
        role: normalizedRole
      });
      const user = buildStoredUser(response.data);
      setStoredUser(user);
      return user;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async logout() {
    clearStoredUser();
  },

  getCurrentUser() {
    return getStoredUser();
  },

  async restoreSession() {
    const stored = getStoredUser();
    if (!stored) {
      return null;
    }

    if (!stored.token) {
      clearStoredUser();
      return null;
    }

    try {
      const response = await apiClient.get('/auth/me');
      const user = buildStoredUser({
        token: stored.token,
        type: stored.type,
        role: response.data.role,
        fullName: response.data.fullName,
        email: response.data.email,
        userId: response.data.id
      });
      setStoredUser(user);
      return user;
    } catch (error) {
      clearStoredUser();
      return null;
    }
  },

  isAuthenticated() {
    return Boolean(this.getCurrentUser());
  },

  hasRole(role) {
    const user = this.getCurrentUser();
    return Boolean(user && normalizeRole(user.role) === normalizeRole(role));
  }
};

export default authService;
