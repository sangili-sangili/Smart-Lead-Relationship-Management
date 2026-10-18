import api from './api';

const TOKEN_KEY = 'leadflow_token';
const USER_KEY = 'leadflow_user';

export const authService = {
  /**
   * Log in user with email & password
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ token: string, user: object }>}
   */
  async login({ email, password }) {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      const { token, user } = res.data;
      if (token) localStorage.setItem(TOKEN_KEY, token);
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
      return { token, user };
    }
    throw new Error(res.message || 'Login failed');
  },

  /**
   * Register a new user
   * @param {{ name: string, email: string, password: string, role?: string }} userData
   * @returns {Promise<{ token: string, user: object }>}
   */
  async register({ name, email, password, role }) {
    const res = await api.post('/auth/register', { name, email, password, role });
    if (res.success && res.data) {
      const { token, user } = res.data;
      if (token) localStorage.setItem(TOKEN_KEY, token);
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
      return { token, user };
    }
    throw new Error(res.message || 'Registration failed');
  },

  /**
   * Fetch current authenticated user from server
   * @returns {Promise<object>}
   */
  async getMe() {
    const res = await api.get('/auth/me');
    if (res.success && res.data?.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
      return res.data.user;
    }
    return null;
  },

  /**
   * Update profile information
   * @param {{ name?: string, email?: string, avatar?: string }} profileData
   * @returns {Promise<object>}
   */
  async updateProfile({ name, email, avatar }) {
    const res = await api.put('/auth/profile', { name, email, avatar });
    if (res.success && res.data?.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
      return res.data.user;
    }
    throw new Error(res.message || 'Failed to update profile');
  },

  /**
   * Change user password
   * @param {{ currentPassword: string, newPassword: string }} passwordData
   * @returns {Promise<object>}
   */
  async changePassword({ currentPassword, newPassword }) {
    const res = await api.put('/auth/change-password', { currentPassword, newPassword });
    if (res.success && res.data?.token) {
      localStorage.setItem(TOKEN_KEY, res.data.token);
    }
    return res;
  },

  /**
   * Fetch all users for assignment dropdowns
   * @returns {Promise<Array>}
   */
  async getUsers() {
    try {
      const res = await api.get('/auth/users');
      return res.data || [];
    } catch (err) {
      console.warn('Failed to fetch users from server, returning fallback', err);
      return [];
    }
  },

  /**
   * Log out user and clean localStorage
   */
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Get currently cached JWT token
   * @returns {string | null}
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get currently cached user object
   * @returns {object | null}
   */
  getCurrentUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  }
};

export default authService;
