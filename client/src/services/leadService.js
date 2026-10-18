import api from './api';

const STORAGE_KEY = 'leadflow_leads_data';

// Default initial dataset matching the exact Figma showcase design
const DEFAULT_LEADS = [
  {
    id: 'lead-1',
    name: 'Ravi Kumar',
    email: 'ravi@mail.com',
    phone: '+1 (555) 234-5678',
    status: 'New',
    assignedTo: 'John Doe',
    company: 'ABC Corp',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    isDeleted: false
  },
  {
    id: 'lead-2',
    name: 'Priya Sharma',
    email: 'priya@mail.com',
    phone: '+1 (555) 876-5432',
    status: 'Contacted',
    assignedTo: 'Sarah Lee',
    company: 'TechSol',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    isDeleted: false
  },
  {
    id: 'lead-3',
    name: 'Suresh Patel',
    email: 'suresh@mail.com',
    phone: '+1 (555) 345-6789',
    status: 'Qualified',
    assignedTo: 'Mike Ross',
    company: 'Globex',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    isDeleted: false
  },
  {
    id: 'lead-4',
    name: 'Anita Roy',
    email: 'anita@mail.com',
    phone: '+1 (555) 987-6543',
    status: 'New',
    assignedTo: 'John Doe',
    company: 'NextGen',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    isDeleted: false
  },
  {
    id: 'lead-5',
    name: 'Vikram Singh',
    email: 'vikram@mail.com',
    phone: '+1 (555) 456-7890',
    status: 'Lost',
    assignedTo: 'Sarah Lee',
    company: 'Acme Corp',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    isDeleted: false
  },
  {
    id: 'lead-6',
    name: 'Sarah Jenkins',
    email: 'sarah.j@acme.com',
    phone: '+1 (555) 567-8901',
    status: 'Converted',
    assignedTo: 'Mike Ross',
    company: 'Acme Corp',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    isDeleted: false
  },
  {
    id: 'lead-7',
    name: 'Amit Verma',
    email: 'amit.v@techsol.io',
    phone: '+1 (555) 678-9012',
    status: 'Contacted',
    assignedTo: 'John Doe',
    company: 'TechSol',
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    isDeleted: false
  },
  {
    id: 'lead-8',
    name: 'Deepa Menon',
    email: 'deepa@globex.org',
    phone: '+1 (555) 789-0123',
    status: 'Qualified',
    assignedTo: 'Sarah Lee',
    company: 'Globex',
    createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
    isDeleted: false
  },
  {
    id: 'lead-9',
    name: 'Karan Mehta',
    email: 'karan@nextgen.tech',
    phone: '+1 (555) 890-1234',
    status: 'New',
    assignedTo: 'Mike Ross',
    company: 'NextGen',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    isDeleted: false
  },
  {
    id: 'lead-10',
    name: 'Neha Reddy',
    email: 'neha@abccorp.in',
    phone: '+1 (555) 901-2345',
    status: 'Converted',
    assignedTo: 'John Doe',
    company: 'ABC Corp',
    createdAt: new Date(Date.now() - 86400000 * 11).toISOString(),
    isDeleted: false
  }
];

export const AVAILABLE_STATUSES = ['New', 'Contacted', 'Qualified', 'Lost', 'Converted'];
export const AVAILABLE_USERS = ['John Doe', 'Sarah Lee', 'Mike Ross'];
export const AVAILABLE_COMPANIES = ['ABC Corp', 'TechSol', 'Globex', 'NextGen', 'Acme Corp'];

// Retrieve cached leads from localStorage, initializing if not present
const getStoredLeads = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LEADS));
      return DEFAULT_LEADS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read leads from storage', err);
    return DEFAULT_LEADS;
  }
};

const saveStoredLeads = (leads) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  } catch (err) {
    console.error('Failed to save leads to storage', err);
  }
};

export const leadService = {
  /**
   * Fetch leads with optional search, status filter, user filter, and pagination
   */
  async getLeads({ search = '', status = '', user = '', page = 1, limit = 5 } = {}) {
    try {
      // First try real backend API
      const response = await api.get('/leads', {
        params: { search, status, user, page, limit }
      });
      if (response && response.data && response.data.length > 0) {
        return response;
      }
    } catch {
      // Fallback gracefully to local persisted data if backend returns empty/error
    }

    // Local client-side dataset filtering
    let leads = getStoredLeads().filter((l) => !l.isDeleted);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      leads = leads.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.company.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q)
      );
    }

    if (status && status !== 'All Status') {
      leads = leads.filter((l) => l.status.toLowerCase() === status.toLowerCase());
    }

    if (user && user !== 'All Users') {
      leads = leads.filter((l) => l.assignedTo.toLowerCase() === user.toLowerCase());
    }

    const total = leads.length;
    const startIndex = (page - 1) * limit;
    const paginatedLeads = leads.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: paginatedLeads,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit))
      }
    };
  },

  /**
   * Create a new lead
   */
  async createLead(leadData) {
    try {
      const response = await api.post('/leads', leadData);
      if (response && response.data) return response.data;
    } catch {
      // Fallback to local store
    }

    const leads = getStoredLeads();
    const newLead = {
      id: `lead-${Date.now()}`,
      ...leadData,
      createdAt: new Date().toISOString(),
      isDeleted: false
    };

    leads.unshift(newLead);
    saveStoredLeads(leads);
    return newLead;
  },

  /**
   * Update an existing lead
   */
  async updateLead(id, updateData) {
    try {
      const response = await api.put(`/leads/${id}`, updateData);
      if (response && response.data) return response.data;
    } catch {
      // Fallback to local store
    }

    const leads = getStoredLeads();
    const index = leads.findIndex((l) => l.id === id);
    if (index === -1) {
      throw new Error('Lead not found');
    }

    leads[index] = {
      ...leads[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    saveStoredLeads(leads);
    return leads[index];
  },

  /**
   * Soft-delete a lead (excludes from active queries)
   */
  async deleteLead(id) {
    try {
      await api.delete(`/leads/${id}`);
    } catch {
      // Fallback to local store
    }

    const leads = getStoredLeads();
    const updated = leads.map((l) => (l.id === id ? { ...l, isDeleted: true } : l));
    saveStoredLeads(updated);
    return { success: true };
  },

  /**
   * Reset to initial sample leads (useful for testing)
   */
  resetSampleData() {
    saveStoredLeads(DEFAULT_LEADS);
    return DEFAULT_LEADS;
  }
};
