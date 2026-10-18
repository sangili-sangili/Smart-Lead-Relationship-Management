import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  leadService,
  AVAILABLE_STATUSES
} from '../services/leadService';
import authService from '../services/authService';
import AddEditLeadModal from '../components/leads/AddEditLeadModal';
import CustomDropdown from '../components/common/CustomDropdown';
import Pagination from '../components/common/Pagination';
import useDebounce from '../hooks/useDebounce';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'New', label: 'New', dotColor: '#3B82F6' },
  { value: 'Contacted', label: 'Contacted', dotColor: '#06B6D4' },
  { value: 'Qualified', label: 'Qualified', dotColor: '#10B981' },
  { value: 'Lost', label: 'Lost', dotColor: '#F97316' },
  { value: 'Converted', label: 'Converted', dotColor: '#8B5CF6' }
];

const INITIAL_USER_OPTIONS = [{ value: '', label: 'All Users' }];

// Figma Status Pill Styling
const getStatusBadgeStyle = (status) => {
  switch (status) {
    case 'New':
      return 'bg-blue-50 text-blue-600 border-blue-200/80 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30';
    case 'Contacted':
      return 'bg-cyan-50 text-cyan-600 border-cyan-200/80 dark:bg-cyan-500/15 dark:text-cyan-400 dark:border-cyan-500/30';
    case 'Qualified':
      return 'bg-emerald-50 text-emerald-600 border-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30';
    case 'Lost':
      return 'bg-orange-50 text-orange-600 border-orange-200/80 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30';
    case 'Converted':
      return 'bg-purple-50 text-purple-600 border-purple-200/80 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/30';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/10 dark:text-slate-300 dark:border-white/10';
  }
};

// Avatar color generation based on name
const getAvatarGradient = (name = '') => {
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

const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);

  const [statusFilter, setStatusFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [page, setPage] = useState(1);
  const [userOptions, setUserOptions] = useState(INITIAL_USER_OPTIONS);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, limit: 5 });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Load registered users from backend for filter
  useEffect(() => {
    let isMounted = true;
    authService.getUsers().then((users) => {
      if (!isMounted || !users || users.length === 0) return;
      setUserOptions([
        { value: '', label: 'All Users' },
        ...users.map((u) => ({ value: u.name, label: u.name }))
      ]);
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const toast = useToast();
  const confirm = useConfirm();

  // Reset to page 1 whenever debounced search or active filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, userFilter]);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const res = await leadService.getLeads({
        search: debouncedSearch.trim(),
        status: statusFilter,
        user: userFilter,
        page,
        limit: 5
      });
      setLeads(res.data || []);
      setMeta(res.meta || { total: 0, totalPages: 1, limit: 5 });
    } catch (err) {
      console.error('Error fetching leads:', err);
      toast.error('Failed to load leads', 'Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, userFilter, page, toast]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Instant input state update for typing responsiveness without API spam
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleUserChange = (e) => {
    setUserFilter(e.target.value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setUserFilter('');
    setPage(1);
  };

  const handleOpenAddModal = () => {
    setSelectedLead(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleSaveLead = async (formData) => {
    if (selectedLead) {
      await leadService.updateLead(selectedLead.id, formData);
      toast.success('Lead Updated Successfully', `"${formData.name}" has been updated.`);
    } else {
      await leadService.createLead(formData);
      toast.success('Lead Created Successfully', `"${formData.name}" added to pipeline.`);
    }
    fetchLeads();
  };

  const handleDeleteLead = async (lead) => {
    const ok = await confirm({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this lead? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      itemName: lead.name,
      itemBadge: `${lead.company} • ${lead.status}`
    });

    if (ok) {
      try {
        await leadService.deleteLead(lead.id);
        toast.success('Lead Deleted Successfully', `"${lead.name}" has been removed.`);
        fetchLeads();
      } catch (err) {
        toast.error('Deletion Failed', err.message || 'Could not delete lead.');
      }
    }
  };

  const hasActiveFilters = Boolean(searchTerm || statusFilter || userFilter);

  // Pagination bounds calculation
  const startIndex = useMemo(() => {
    if (meta.total === 0) return 0;
    return (page - 1) * meta.limit + 1;
  }, [page, meta.limit, meta.total]);

  const endIndex = useMemo(() => {
    return Math.min(page * meta.limit, meta.total);
  }, [page, meta.limit, meta.total]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[1.85rem] font-bold text-[#1E293B] dark:text-white tracking-tight mb-1">
            Leads
          </h1>
          <p className="text-sm text-[#64748B] dark:text-slate-400">
            Manage your sales leads, track statuses, and assign team owners.
          </p>
        </div>

        {/* Primary Action Button matching Figma */}
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:opacity-95 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Lead</span>
        </button>
      </div>

      {/* Filter and Search Bar Card matching Figma */}
      <div className="bg-white dark:bg-[#15172A] rounded-2xl p-4 sm:p-5 border border-[#E2E8F0] dark:border-[#222543] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        
        {/* Search Input with Magnifier Icon */}
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
            placeholder="Search leads by name, email..."
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

        {/* Filter Dropdowns and Clear Action */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter Custom Dropdown (100% visible in dark and light modes) */}
          <div className="w-full sm:w-44">
            <CustomDropdown
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
              options={STATUS_FILTER_OPTIONS}
              placeholder="All Status"
            />
          </div>

          {/* User Filter Custom Dropdown (100% visible in dark and light modes) */}
          <div className="w-full sm:w-44">
            <CustomDropdown
              value={userFilter}
              onChange={(val) => {
                setUserFilter(val);
                setPage(1);
              }}
              options={userOptions}
              placeholder="All Users"
            />
          </div>

          {/* Clear Filters Button */}
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

      {/* Leads Table Container */}
      <div className="bg-white dark:bg-[#15172A] rounded-[24px] border border-[#E2E8F0] dark:border-[#222543] overflow-hidden shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)]">
        
        {/* Desktop / Tablet Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03]">
                <th className="py-4 px-6 text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="py-4 px-6 text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="py-4 px-6 text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-4 px-6 text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="py-4 px-6 text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                  Company
                </th>
                <th className="py-4 px-6 text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E2E8F0]/80 dark:divide-white/10">
              {loading ? (
                // Table Skeleton Loading
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-white/10" />
                        <div className="h-4 w-24 bg-slate-200 dark:bg-white/10 rounded" />
                      </div>
                    </td>
                    <td className="py-4 px-6"><div className="h-4 w-32 bg-slate-200 dark:bg-white/10 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-6 w-20 bg-slate-200 dark:bg-white/10 rounded-full" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-20 bg-slate-200 dark:bg-white/10 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-20 bg-slate-200 dark:bg-white/10 rounded" /></td>
                    <td className="py-4 px-6 text-right"><div className="h-6 w-16 bg-slate-200 dark:bg-white/10 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : leads.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={6} className="py-12 px-6 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-[#6366F1] flex items-center justify-center mx-auto">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-[#1E293B] dark:text-white">
                        No leads found
                      </p>
                      <p className="text-xs text-[#64748B] dark:text-slate-400">
                        {hasActiveFilters
                          ? 'Try adjusting your search query or filters to find what you are looking for.'
                          : 'Get started by creating your very first sales lead.'}
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
                          <span>Add Lead</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                // Real Data Rows matching Figma
                leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-[#F8FAFC] dark:hover:bg-white/5 transition-colors group"
                  >
                    {/* Name + Initials Avatar */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full bg-gradient-to-tr ${getAvatarGradient(
                            lead.name
                          )} flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0`}
                        >
                          {lead.name ? lead.name.charAt(0).toUpperCase() : 'L'}
                        </div>
                        <span className="text-sm font-semibold text-[#1E293B] dark:text-white group-hover:text-[#6366F1] dark:group-hover:text-indigo-400 transition-colors">
                          {lead.name}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-6 text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
                      {lead.email}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border shadow-2xs ${getStatusBadgeStyle(
                          lead.status
                        )}`}
                      >
                        {lead.status}
                      </span>
                    </td>

                    {/* Assigned To */}
                    <td className="py-4 px-6 text-xs sm:text-sm text-[#475569] dark:text-slate-300 font-medium">
                      {lead.assignedTo}
                    </td>

                    {/* Company */}
                    <td className="py-4 px-6 text-xs sm:text-sm text-[#475569] dark:text-slate-300 font-medium">
                      {lead.company}
                    </td>

                    {/* Actions: Edit & Delete */}
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(lead)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] dark:text-slate-400 hover:text-[#6366F1] dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors cursor-pointer"
                          title="Edit Lead"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteLead(lead)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete Lead"
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

        {/* Mobile Responsive Cards View (Matching Figma Mobile Showcase) */}
        <div className="md:hidden divide-y divide-[#E2E8F0]/80 dark:divide-white/10">
          {loading ? (
            <div className="p-6 text-center text-xs text-[#94A3B8]">Loading leads...</div>
          ) : leads.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#94A3B8]">No leads found.</div>
          ) : (
            leads.map((lead) => (
              <div key={lead.id} className="p-4 sm:p-5 space-y-3">
                {/* Top: Avatar + Name & Email on left, Status badge on right */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-tr ${getAvatarGradient(
                        lead.name
                      )} flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0`}
                    >
                      {lead.name ? lead.name.charAt(0).toUpperCase() : 'L'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#1E293B] dark:text-white truncate">
                        {lead.name}
                      </p>
                      <p className="text-xs text-[#64748B] dark:text-slate-400 truncate">
                        {lead.email}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${getStatusBadgeStyle(
                      lead.status
                    )}`}
                  >
                    {lead.status}
                  </span>
                </div>

                {/* Middle: Company and Assigned To Details */}
                <div className="grid grid-cols-2 gap-2 text-xs text-[#475569] dark:text-slate-300 bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl border border-slate-200/60 dark:border-white/10">
                  <div>
                    <span className="text-[#94A3B8] block text-[10px] uppercase font-semibold">Company</span>
                    <span className="font-semibold">{lead.company}</span>
                  </div>
                  <div>
                    <span className="text-[#94A3B8] block text-[10px] uppercase font-semibold">Assigned To</span>
                    <span className="font-semibold">{lead.assignedTo}</span>
                  </div>
                </div>

                {/* Bottom: Action buttons */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(lead)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-semibold text-[#475569] dark:text-slate-300 hover:text-[#6366F1] flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteLead(lead)}
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
          {/* Summary Count (e.g. "Showing 1-5 of 10 leads") */}
          <div className="text-xs text-[#64748B] dark:text-slate-400 font-medium">
            Showing{' '}
            <span className="font-bold text-[#1E293B] dark:text-white">
              {startIndex}-{endIndex}
            </span>{' '}
            of{' '}
            <span className="font-bold text-[#1E293B] dark:text-white">
              {meta.total}
            </span>{' '}
            leads
          </div>

          {/* Smart Ellipsis Pagination matching requested 1 2 3 4 ... 10 11 format */}
          <Pagination
            currentPage={page}
            totalPages={meta.totalPages || 1}
            onPageChange={setPage}
          />
        </div>

      </div>

      {/* Global Add / Edit Lead Modal */}
      <AddEditLeadModal
        isOpen={isModalOpen}
        lead={selectedLead}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLead}
      />
    </div>
  );
};

export default LeadsPage;
