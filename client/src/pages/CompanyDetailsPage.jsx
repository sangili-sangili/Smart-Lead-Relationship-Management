import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { companyService } from '../services/companyService';
import { useToast } from '../context/ToastContext';

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

const CompanyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCompanyDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await companyService.getCompanyById(id);
      setCompany(data);
    } catch (err) {
      console.error('Failed to load company details:', err);
      toast.error('Company Not Found', 'Could not locate account details.');
      navigate(ROUTES.COMPANIES);
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    fetchCompanyDetails();
  }, [fetchCompanyDetails]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-24 bg-slate-200 dark:bg-white/10 rounded" />
        <div className="h-32 bg-slate-200 dark:bg-white/10 rounded-2xl" />
        <div className="h-64 bg-slate-200 dark:bg-white/10 rounded-2xl" />
      </div>
    );
  }

  if (!company) return null;

  return (
    <div className="space-y-6 animate-fade-in-up max-w-5xl">
      {/* Top Back Navigation Button matching Figma */}
      <div>
        <button
          type="button"
          onClick={() => navigate(ROUTES.COMPANIES)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#6366F1] dark:text-indigo-400 hover:text-[#4F46E5] hover:underline cursor-pointer group mb-2"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Companies</span>
        </button>
      </div>

      {/* Header Banner matching Figma Row 2 Column 3 */}
      <div className="bg-white dark:bg-[#15172A] rounded-[24px] p-6 sm:p-7 border border-[#E2E8F0] dark:border-[#222543] shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6366F1] to-[#A5B4FC] flex items-center justify-center text-white font-bold text-2xl shadow-md shadow-indigo-600/20 shrink-0">
            {company.name ? company.name.charAt(0).toUpperCase() : 'C'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1E293B] dark:text-white tracking-tight">
              {company.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
              <span className="font-medium text-[#475569] dark:text-slate-300">Industry: {company.industry}</span>
              <span className="text-[#CBD5E1] dark:text-slate-600">•</span>
              <span className="font-medium text-[#475569] dark:text-slate-300">Location: {company.location}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <button
            type="button"
            onClick={() => {
              navigate(ROUTES.LEADS);
              toast.info('Associated Pipeline', `Viewing pipeline for ${company.name}`);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 hover:bg-indigo-100 dark:hover:bg-indigo-500/25 text-[#6366F1] dark:text-indigo-400 font-semibold text-xs border border-indigo-200/60 dark:border-indigo-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Middle Card: Company Details (Website & Total Leads) matching Figma */}
      <div className="bg-white dark:bg-[#15172A] rounded-[24px] p-6 sm:p-7 border border-[#E2E8F0] dark:border-[#222543] shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)]">
        <h2 className="text-base font-bold text-[#1E293B] dark:text-white tracking-tight mb-4">
          Company Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Detail 1: Website */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/5 border border-slate-200/60 dark:border-white/10">
            <span className="text-[11px] font-semibold text-[#94A3B8] dark:text-slate-400 uppercase tracking-wider block mb-1">
              Website
            </span>
            {company.website ? (
              <a
                href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-[#6366F1] dark:text-indigo-400 hover:underline flex items-center gap-1.5"
              >
                <span>{company.website}</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ) : (
              <span className="text-sm text-[#94A3B8]">Not provided</span>
            )}
          </div>

          {/* Detail 2: Total Leads */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/5 border border-slate-200/60 dark:border-white/10">
            <span className="text-[11px] font-semibold text-[#94A3B8] dark:text-slate-400 uppercase tracking-wider block mb-1">
              Total Leads
            </span>
            <span className="text-2xl font-black text-[#1E293B] dark:text-white tracking-tight">
              {company.totalLeads || 0}
            </span>
          </div>

          {/* Detail 3: Contact Email / Phone */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 sm:col-span-2 lg:col-span-1">
            <span className="text-[11px] font-semibold text-[#94A3B8] dark:text-slate-400 uppercase tracking-wider block mb-1">
              Contact
            </span>
            <p className="text-xs font-semibold text-[#1E293B] dark:text-slate-200">
              {company.email || 'None'}
            </p>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400">
              {company.phone || 'None'}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Card: Associated Leads List matching Figma */}
      <div className="bg-white dark:bg-[#15172A] rounded-[24px] border border-[#E2E8F0] dark:border-[#222543] overflow-hidden shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)]">
        {/* Section Header */}
        <div className="p-6 px-7 border-b border-[#E2E8F0] dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div>
            <h2 className="text-base font-bold text-[#1E293B] dark:text-white tracking-tight">
              Associated Leads ({company.totalLeads || 0})
            </h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
              Contacts and pipeline opportunities tied to {company.name}
            </p>
          </div>

          <Link
            to={ROUTES.LEADS}
            className="text-xs font-bold text-[#6366F1] dark:text-indigo-400 hover:text-[#4F46E5] hover:underline flex items-center gap-1 group"
          >
            <span>View All</span>
            <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Associated Leads List matching Figma */}
        <div className="divide-y divide-[#E2E8F0]/80 dark:divide-white/10">
          {!company.leads || company.leads.length === 0 ? (
            <div className="p-10 text-center text-xs text-[#94A3B8] dark:text-slate-400">
              No leads currently associated with this company account.
            </div>
          ) : (
            company.leads.map((lead) => (
              <div
                key={lead.id}
                className="p-4 sm:p-5 px-7 flex items-center justify-between gap-4 hover:bg-[#F8FAFC] dark:hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-tr ${getAvatarGradient(
                      lead.name
                    )} flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0`}
                  >
                    {lead.name ? lead.name.charAt(0).toUpperCase() : 'L'}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1E293B] dark:text-white group-hover:text-[#6366F1] dark:group-hover:text-indigo-400 transition-colors truncate">
                      {lead.name}
                    </p>
                    <p className="text-xs text-[#64748B] dark:text-slate-400 truncate">
                      {lead.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border shadow-2xs ${getStatusBadgeStyle(
                      lead.status
                    )}`}
                  >
                    {lead.status}
                  </span>

                  <span className="hidden sm:inline text-xs text-[#94A3B8] dark:text-slate-400">
                    {typeof lead.assignedTo === 'object' && lead.assignedTo !== null
                      ? lead.assignedTo.name
                      : lead.assignedTo || 'Unassigned'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailsPage;
