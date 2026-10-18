import api from './api';

// Clean up any legacy dummy localStorage cache
try {
  localStorage.removeItem('leadflow_companies_data');
} catch {}

export const AVAILABLE_INDUSTRIES = [
  'IT',
  'Software',
  'Manufacturing',
  'Healthcare',
  'Finance',
  'Cloud Services',
  'Design & Media',
  'Artificial Intelligence'
];

export const companyService = {
  /**
   * Fetch paginated companies with search & industry filter
   * Calls live MongoDB endpoint: GET /api/companies
   */
  async getCompanies({ search = '', industry = '', page = 1, limit = 5 } = {}) {
    const response = await api.get('/companies', {
      params: { search, industry, page, limit }
    });

    const rawList = response.data || [];
    const companies = rawList.map((comp) => ({
      ...comp,
      id: comp._id || comp.id,
      totalLeads: comp.leadCount ?? comp.totalLeads ?? 0
    }));

    return {
      success: true,
      data: companies,
      meta: response.meta || {
        total: companies.length,
        page,
        limit,
        totalPages: 1
      }
    };
  },

  /**
   * Get single company by ID or name with associated leads
   * Calls: GET /api/companies/:idOrName
   */
  async getCompanyById(idOrName) {
    const response = await api.get(`/companies/${idOrName}`);
    const data = response.data || {};
    return {
      ...data,
      id: data._id || data.id,
      totalLeads: data.totalLeads ?? data.leadCount ?? (data.leads?.length || 0)
    };
  },

  /**
   * Create a new company in MongoDB
   * Calls: POST /api/companies
   */
  async createCompany(companyData) {
    const response = await api.post('/companies', companyData);
    return response.data;
  },

  /**
   * Update existing company in MongoDB
   * Calls: PUT /api/companies/:id
   */
  async updateCompany(id, updateData) {
    const response = await api.put(`/companies/${id}`, updateData);
    return response.data;
  },

  /**
   * Soft delete company in MongoDB
   * Calls: DELETE /api/companies/:id
   */
  async deleteCompany(id) {
    const response = await api.delete(`/companies/${id}`);
    return response;
  }
};

export default companyService;
