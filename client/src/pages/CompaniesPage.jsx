import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  companyService,
  AVAILABLE_INDUSTRIES
} from '../services/companyService';
import AddEditCompanyModal from '../components/companies/AddEditCompanyModal';
import CustomDropdown from '../components/common/CustomDropdown';
import Pagination from '../components/common/Pagination';
import useDebounce from '../hooks/useDebounce';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';

const INDUSTRY_FILTER_OPTIONS = [
  { value: '', label: 'All Industries' },
  ...AVAILABLE_INDUSTRIES.map((ind) => ({ value: ind, label: ind }))
];

const getCompanyGradient = (name = '') => {
  const gradients = [
    'from-[#6366F1] to-[#818CF8]',
    'from-[#3B82F6] to-[#60A5FA]',
    'from-[#10B981] to-[#34D399]',
    'from-[#F59E0B] to-[#FBBF24]',
    'from-[#8B5CF6] to-[#A78BFA]',
    'from-[#EC4899] to-[#F472B6]'
  ];
  const charCode = name.charCodeAt(0) || 0;
  return gradients[charCode % gradients.length];
};

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);

  const [industryFilter, setIndustryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, limit: 5 });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();

  // Reset to page 1 whenever debounced search or active filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, industryFilter]);

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const res = await companyService.getCompanies({
        search: debouncedSearch.trim(),
        industry: industryFilter,
        page,
        limit: 5
      });
      setCompanies(res.data || []);
      setMeta(res.meta || { total: 0, totalPages: 1, limit: 5 });
    } catch (err) {
      console.error('Error fetching companies:', err);
      toast.error('Failed to load companies', 'Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, industryFilter, page, toast]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleIndustryChange = (val) => {
    setIndustryFilter(val);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setIndustryFilter('');
    setPage(1);
  };

  const handleOpenAddModal = () => {
    setSelectedCompany(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (comp) => {
    setSelectedCompany(comp);
    setIsModalOpen(true);
  };

  const handleSaveCompany = async (formData) => {
    if (selectedCompany) {
      await companyService.updateCompany(selectedCompany.id, formData);
      toast.success('Company Updated Successfully', `"${formData.name}" has been updated.`);
    } else {
      await companyService.createCompany(formData);
      toast.success('Company Created Successfully', `"${formData.name}" registered.`);
    }
    fetchCompanies();
  };

  const handleDeleteCompany = async (comp) => {
    const ok = await confirm({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete "${comp.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      itemName: comp.name,
      itemBadge: `${comp.industry} • ${comp.location}`
    });

    if (ok) {
      try {
        await companyService.deleteCompany(comp.id);
        toast.success('Company Deleted Successfully', `"${comp.name}" removed.`);
        fetchCompanies();
      } catch (err) {
        toast.error('Deletion Failed', err.message || 'Could not delete company.');
      }
    }
  };

  const hasActiveFilters = Boolean(searchTerm || industryFilter);

  const startIndex = useMemo(() => {
    if (meta.total === 0) return 0;
    return (page - 1) * meta.limit + 1;
  }, [page, meta.limit, meta.total]);

  const endIndex = useMemo(() => {
    return Math.min(page * meta.limit, meta.total);
  }, [page, meta.limit, meta.total]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Header matching Figma Row 2 Column 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[1.85rem] font-bold text-[#1E293B] dark:text-white tracking-tight mb-1">
            Companies
          </h1>
          <p className="text-sm text-[#64748B] dark:text-slate-400">
            Manage client accounts, industries, and business locations.
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:opacity-95 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Company</span>
        </button>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white dark:bg-[#15172A] rounded-2xl p-4 sm:p-5 border border-[#E2E8F0] dark:border-[#222543] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        {/* Search Input with Magnifier */}
        <div className="relative flex-1 min-w-[240px]">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search companies by name, location..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50/70 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs sm:text-sm text-[#1E293B] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(''); setPage(1); }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#1E293B] dark:hover:text-white"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Industry Filter Dropdown and Clear Action */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-52">
            <CustomDropdown
              value={industryFilter}
              onChange={handleIndustryChange}
              options={INDUSTRY_FILTER_OPTIONS}
              placeholder="All Industries"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3 py-2 text-xs font-semibold text-[#6366F1] dark:text-indigo-400 hover:text-[#4F46E5] hover:underline cursor-pointer transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Companies Table Container */}
      <div className="bg-white dark:bg-[#15172A] rounded-[24px] border border-[#E2E8F0] dark:border-[#222543] overflow-hidden shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)]">
        
        {/* Desktop / Tablet Table View matching Figma */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03]">
                <th className="py-4 px-6 text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                  Company Name
                </th>
                <th className="py-4 px-6 text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                  Industry
                </th>
                <th className="py-4 px-6 text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="py-4 px-6 text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                  Total Leads
                </th>
                <th className="py-4 px-6 text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E2E8F0]/80 dark:divide-white/10">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-white/10" />
                        <div className="h-4 w-28 bg-slate-200 dark:bg-white/10 rounded" />
                      </div>
                    </td>
                    <td className="py-4 px-6"><div className="h-4 w-24 bg-slate-200 dark:bg-white/10 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-20 bg-slate-200 dark:bg-white/10 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-12 bg-slate-200 dark:bg-white/10 rounded" /></td>
                    <td className="py-4 px-6 text-right"><div className="h-6 w-20 bg-slate-200 dark:bg-white/10 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 px-6 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-[#6366F1] flex items-center justify-center mx-auto">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-[#1E293B] dark:text-white">
                        No companies found
                      </p>
                      <p className="text-xs text-[#64748B] dark:text-slate-400">
                        {hasActiveFilters
                          ? 'Try adjusting your search query or industry filter.'
                          : 'Register a new enterprise client to track opportunities.'}
                      </p>
                      {hasActiveFilters ? (
                        <button
                          onClick={handleClearFilters}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6366F1] dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/15 hover:bg-indigo-100 transition-colors"
                        >
                          Clear Filters
                        </button>
                      ) : (
                        <button
                          onClick={handleOpenAddModal}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#6366F1] hover:bg-[#4F46E5] transition-colors inline-flex items-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                          </svg>
                          <span>Add Company</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                companies.map((comp) => (
                  <tr
                    key={comp.id}
                    className="hover:bg-[#F8FAFC] dark:hover:bg-white/5 transition-colors group"
                  >
                    {/* Company Name + Avatar */}
                    <td className="py-4 px-6">
                      <div
                        onClick={() => navigate(`/companies/${comp.id}`)}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${getCompanyGradient(
                            comp.name
                          )} flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0`}
                        >
                          {comp.name ? comp.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1E293B] dark:text-white group-hover:text-[#6366F1] dark:group-hover:text-indigo-400 transition-colors">
                            {comp.name}
                          </p>
                          {comp.website && (
                            <p className="text-[11px] text-[#94A3B8] dark:text-slate-400">
                              {comp.website}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Industry */}
                    <td className="py-4 px-6 text-xs sm:text-sm text-[#475569] dark:text-slate-300 font-medium">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 text-xs">
                        {comp.industry}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-4 px-6 text-xs sm:text-sm text-[#475569] dark:text-slate-300 font-medium">
                      {comp.location}
                    </td>

                    {/* Total Leads Count */}
                    <td className="py-4 px-6 text-xs sm:text-sm text-[#475569] dark:text-slate-300 font-bold">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-[#6366F1] dark:text-indigo-400 text-xs">
                        {comp.totalLeads || 0} leads
                      </span>
                    </td>

                    {/* Actions: View Details, Edit, Delete */}
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {/* View Details / Associated Leads */}
                        <button
                          type="button"
                          onClick={() => navigate(`/companies/${comp.id}`)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] dark:text-slate-400 hover:text-[#6366F1] dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors cursor-pointer"
                          title="View Company Details & Associated Leads"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(comp)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] dark:text-slate-400 hover:text-[#6366F1] dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors cursor-pointer"
                          title="Edit Company"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteCompany(comp)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete Company"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards View */}
        <div className="md:hidden divide-y divide-[#E2E8F0]/80 dark:divide-white/10">
          {loading ? (
            <div className="p-6 text-center text-xs text-[#94A3B8]">Loading companies...</div>
          ) : companies.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#94A3B8]">No companies found.</div>
          ) : (
            companies.map((comp) => (
              <div key={comp.id} className="p-4 sm:p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div
                    onClick={() => navigate(`/companies/${comp.id}`)}
                    className="flex items-center gap-3 min-w-0 cursor-pointer"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${getCompanyGradient(
                        comp.name
                      )} flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0`}
                    >
                      {comp.name ? comp.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#1E293B] dark:text-white truncate">
                        {comp.name}
                      </p>
                      <p className="text-xs text-[#64748B] dark:text-slate-400 truncate">
                        {comp.industry} • {comp.location}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-500/15 text-[#6366F1] dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-500/30 shrink-0">
                    {comp.totalLeads || 0} leads
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => navigate(`/companies/${comp.id}`)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-semibold text-[#475569] dark:text-slate-300 hover:text-[#6366F1] flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(comp)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-semibold text-[#475569] dark:text-slate-300 hover:text-[#6366F1] flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCompany(comp)}
                    className="px-3 py-1.5 rounded-lg border border-red-200/80 dark:border-red-500/20 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Pagination matching Figma */}
        <div className="p-4 px-6 border-t border-[#E2E8F0] dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="text-xs text-[#64748B] dark:text-slate-400 font-medium">
            Showing{' '}
            <span className="font-bold text-[#1E293B] dark:text-white">
              {startIndex}-{endIndex}
            </span>{' '}
            of{' '}
            <span className="font-bold text-[#1E293B] dark:text-white">
              {meta.total}
            </span>{' '}
            companies
          </div>

          {/* Smart Ellipsis Pagination */}
          <Pagination
            currentPage={page}
            totalPages={meta.totalPages || 1}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Global Add / Edit Company Modal */}
      <AddEditCompanyModal
        isOpen={isModalOpen}
        company={selectedCompany}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCompany}
      />
    </div>
  );
};

export default CompaniesPage;
