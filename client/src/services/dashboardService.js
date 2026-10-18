import api from './api';

export const dashboardService = {
  /**
   * Fetch aggregated dashboard metrics from backend
   */
  async getMetrics() {
    try {
      const res = await api.get('/dashboard/metrics');
      if (res && res.success && res.data) {
        return res.data;
      }
      return null;
    } catch (err) {
      console.warn('Dashboard metrics fetch error', err);
      return null;
    }
  }
};

export default dashboardService;
