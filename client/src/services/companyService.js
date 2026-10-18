import api from './api';
import { leadService } from './leadService';

const STORAGE_KEY = 'leadflow_companies_data';

export const DEFAULT_COMPANIES = [
  {
    id: 'comp-1',
    name: 'ABC Corp',
    industry: 'IT',
    location: 'Chennai',
    website: 'www.abc-corp.com',
    email: 'contact@abc-corp.com',
    phone: '+91 (044) 4321-8765',
    description: 'Leading provider of enterprise IT architecture and cloud consulting services.',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    isDeleted: false
  },
  {
    id: 'comp-2',
    name: 'TechSol',
    industry: 'Software',
    location: 'Bangalore',
    website: 'www.techsol.io',
    email: 'hello@techsol.io',
    phone: '+91 (080) 6543-2109',
    description: 'Specialized in scalable microservices and full-stack SaaS solutions.',
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    isDeleted: false
  },
  {
    id: 'comp-3',
    name: 'Globex',
    industry: 'Manufacturing',
    location: 'Coimbatore',
    website: 'www.globex.org',
    email: 'info@globex.org',
    phone: '+91 (0422) 2345-6789',
    description: 'Precision manufacturing and industrial robotics hardware distribution.',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    isDeleted: false
  },
  {
    id: 'comp-4',
    name: 'NextGen',
    industry: 'Healthcare',
    location: 'Madurai',
    website: 'www.nextgen.tech',
    email: 'support@nextgen.tech',
    phone: '+91 (0452) 7890-1234',
    description: 'Digital health monitoring systems and diagnostic AI platforms.',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    isDeleted: false
  },
  {
    id: 'comp-5',
    name: 'Acme Corp',
    industry: 'Finance',
    location: 'Trichy',
    website: 'www.acme-corp.com',
    email: 'biz@acme-corp.com',
    phone: '+91 (0431) 3456-7890',
    description: 'Financial asset management, automated compliance and payroll technology.',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    isDeleted: false
  },
  {
    id: 'comp-6',
    name: 'Apex Cloud',
    industry: 'Cloud Services',
    location: 'Hyderabad',
    website: 'www.apexcloud.net',
    email: 'sales@apexcloud.net',
    phone: '+91 (040) 8901-2345',
    description: 'Multi-cloud orchestration and DevOps automation infrastructure.',
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    isDeleted: false
  },
  {
    id: 'comp-7',
    name: 'InnoWave',
    industry: 'Design & Media',
    location: 'Kochi',
    website: 'www.innowave.studio',
    email: 'team@innowave.studio',
    phone: '+91 (0484) 9012-3456',
    description: 'Creative design, branding systems and digital UI/UX consultancy.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    isDeleted: false
  },
  {
    id: 'comp-8',
    name: 'Quantix AI',
    industry: 'Artificial Intelligence',
    location: 'Pune',
    website: 'www.quantix.ai',
    email: 'contact@quantix.ai',
    phone: '+91 (020) 4567-8901',
    description: 'Predictive intelligence modeling and generative workflow automation.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    isDeleted: false
  }
];

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

const getStoredCompanies = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_COMPANIES));
      return DEFAULT_COMPANIES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read companies from storage', err);
    return DEFAULT_COMPANIES;
  }
};

const saveStoredCompanies = (companies) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
  } catch (err) {
    console.error('Failed to save companies to storage', err);
  }
};

export const companyService = {
  /**
   * Fetch paginated companies with search & industry filter
   */
  async getCompanies({ search = '', industry = '', page = 1, limit = 5 } = {}) {
    try {
      const response = await api.get('/companies', {
        params: { search, industry, page, limit }
      });
      if (response && response.data && response.data.length > 0) {
        return response;
      }
    } catch {
      // Fallback to local store
    }

    let companies = getStoredCompanies().filter((c) => !c.isDeleted);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      companies = companies.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          (c.website && c.website.toLowerCase().includes(q))
      );
    }

    if (industry && industry !== 'All Industries') {
      companies = companies.filter((c) => c.industry.toLowerCase() === industry.toLowerCase());
    }

    // Attach dynamic associated lead count to each company
    const leadsRes = await leadService.getLeads({ limit: 1000 });
    const allLeads = leadsRes.data || [];

    const enhancedCompanies = companies.map((comp) => {
      const associated = allLeads.filter(
        (l) => l.company && l.company.toLowerCase() === comp.name.toLowerCase()
      );
      return {
        ...comp,
        totalLeads: associated.length
      };
    });

    const total = enhancedCompanies.length;
    const startIndex = (page - 1) * limit;
    const paginated = enhancedCompanies.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: paginated,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit))
      }
    };
  },

  /**
   * Get single company by ID or name with associated leads
   */
  async getCompanyById(idOrName) {
    try {
      const response = await api.get(`/companies/${idOrName}`);
      if (response && response.data) return response.data;
    } catch {
      // Fallback
    }

    const companies = getStoredCompanies().filter((c) => !c.isDeleted);
    const company = companies.find(
      (c) =>
        c.id === idOrName ||
        c.name.toLowerCase() === decodeURIComponent(idOrName).toLowerCase()
    );

    if (!company) {
      throw new Error('Company not found');
    }

    // Fetch associated leads
    const leadsRes = await leadService.getLeads({ limit: 1000 });
    const allLeads = leadsRes.data || [];
    const associatedLeads = allLeads.filter(
      (l) => l.company && l.company.toLowerCase() === company.name.toLowerCase()
    );

    return {
      ...company,
      totalLeads: associatedLeads.length,
      leads: associatedLeads
    };
  },

  /**
   * Create a new company
   */
  async createCompany(companyData) {
    try {
      const response = await api.post('/companies', companyData);
      if (response && response.data) return response.data;
    } catch {
      // Fallback
    }

    const companies = getStoredCompanies();
    const newCompany = {
      id: `comp-${Date.now()}`,
      ...companyData,
      createdAt: new Date().toISOString(),
      isDeleted: false
    };

    companies.unshift(newCompany);
    saveStoredCompanies(companies);
    return newCompany;
  },

  /**
   * Update existing company
   */
  async updateCompany(id, updateData) {
    try {
      const response = await api.put(`/companies/${id}`, updateData);
      if (response && response.data) return response.data;
    } catch {
      // Fallback
    }

    const companies = getStoredCompanies();
    const index = companies.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error('Company not found');
    }

    companies[index] = {
      ...companies[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    saveStoredCompanies(companies);
    return companies[index];
  },

  /**
   * Soft delete company
   */
  async deleteCompany(id) {
    try {
      await api.delete(`/companies/${id}`);
    } catch {
      // Fallback
    }

    const companies = getStoredCompanies();
    const updated = companies.map((c) => (c.id === id ? { ...c, isDeleted: true } : c));
    saveStoredCompanies(updated);
    return { success: true };
  }
};
