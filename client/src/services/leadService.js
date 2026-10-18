import api from './api';

// Clean up any legacy dummy localStorage cache from early prototype
try {
  localStorage.removeItem('leadflow_leads_data');
} catch {}

export const AVAILABLE_STATUSES = ['New', 'Contacted', 'Qualified', 'Lost', 'Converted'];

export const leadService = {
  /**
   * Fetch leads with optional search, status filter, user filter, and pagination
   * Calls live MongoDB endpoint: GET /api/leads
   */
  async getLeads({ search = '', status = '', user = '', page = 1, limit = 5 } = {}) {
    const response = await api.get('/leads', {
      params: { search, status, user, page, limit }
    });

    return {
      success: true,
      data: response.data || [],
      meta: response.meta || {
        total: response.data?.length || 0,
        page,
        limit,
        totalPages: 1
      }
    };
  },

  /**
   * Fetch a single lead by ID
   * Calls: GET /api/leads/:id
   */
  async getLeadById(id) {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },

  /**
   * Create a new lead in MongoDB
   * Calls: POST /api/leads
   */
  async createLead(leadData) {
    const response = await api.post('/leads', leadData);
    return response.data;
  },

  /**
   * Update an existing lead in MongoDB
   * Calls: PUT /api/leads/:id
   */
  async updateLead(id, updateData) {
    const response = await api.put(`/leads/${id}`, updateData);
    return response.data;
  },

  /**
   * Soft-delete a lead in MongoDB
   * Calls: DELETE /api/leads/:id
   */
  async deleteLead(id) {
    const response = await api.delete(`/leads/${id}`);
    return response;
  }
};

export default leadService;
