import React, { useState, useEffect } from 'react';
import { AVAILABLE_STATUSES } from '../../services/leadService';
import authService from '../../services/authService';
import companyService from '../../services/companyService';
import CustomDropdown from '../common/CustomDropdown';

const STATUS_OPTIONS = AVAILABLE_STATUSES.map((st) => {
  const dotColors = {
    New: '#3B82F6',
    Contacted: '#06B6D4',
    Qualified: '#10B981',
    Lost: '#F97316',
    Converted: '#8B5CF6'
  };
  return { value: st, label: st, dotColor: dotColors[st] || '#6366F1' };
});

const AddEditLeadModal = ({ isOpen, onClose, onSave, lead = null }) => {
  const isEditing = Boolean(lead);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'New',
    assignedTo: '',
    company: ''
  });

  const [userOptions, setUserOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load live users and companies from database
  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      Promise.all([
        authService.getUsers(),
        companyService.getCompanies({ limit: 100 })
      ]).then(([users, compRes]) => {
        if (!isMounted) return;
        const uOptions = (users || []).map((u) => ({
          value: u.name,
          label: `${u.name} (${u.role || 'User'})`
        }));
        setUserOptions(uOptions);

        const cOptions = (compRes?.data || []).map((c) => ({
          value: c.name,
          label: c.name
        }));
        setCompanyOptions(cOptions);

        // If creating new lead and options loaded, set defaults if empty
        if (!lead) {
          setFormData((prev) => ({
            ...prev,
            assignedTo: prev.assignedTo || (uOptions[0]?.value || ''),
            company: prev.company || (cOptions[0]?.value || '')
          }));
        }
      }).catch((err) => {
        console.warn('Failed to load users/companies for lead modal', err);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, lead]);

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        status: lead.status || 'New',
        assignedTo: lead.assignedTo || '',
        company: typeof lead.company === 'string' ? lead.company : lead.company?.name || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        status: 'New',
        assignedTo: '',
        company: ''
      });
    }
    setErrors({});
  }, [lead, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Full name is required';
    }
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Enter a valid email address';
    }
    if (!formData.company.trim()) {
      errs.company = 'Company name is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSave({
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim()
      });
      onClose();
    } catch (err) {
      console.error('Error saving lead:', err);
      setErrors({ form: err.message || 'Failed to save lead. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop: clicks do NOT dismiss modal per project guidelines */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-[620px] bg-white dark:bg-[#15172A] rounded-[26px] shadow-[0_25px_60px_-15px_rgba(27,25,60,0.3)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border border-[#E2E8F0] dark:border-[#222543] overflow-hidden z-10 animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 px-7 sm:px-8 border-b border-[#E2E8F0] dark:border-[#222543] flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-indigo-50/40 dark:from-[#15172A] dark:via-[#1A1C32] dark:to-[#15172A]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#818CF8] flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              {isEditing ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1E293B] dark:text-white tracking-tight">
                {isEditing ? 'Edit Lead' : 'Add New Lead'}
              </h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                {isEditing
                  ? 'Update customer details and pipeline stage'
                  : 'Capture a new prospective customer in your CRM'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#94A3B8] hover:text-[#1E293B] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="p-6 px-7 sm:px-8 space-y-4 max-h-[70vh] overflow-y-auto">
            {errors.form && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs">
                {errors.form}
              </div>
            )}

            {/* Row 1: Name and Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full h-11 px-3.5 rounded-xl border ${
                    errors.name
                      ? 'border-red-400 bg-red-50/30'
                      : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5'
                  } text-xs sm:text-sm text-[#1E293B] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all`}
                />
                {errors.name && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. rahul@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full h-11 px-3.5 rounded-xl border ${
                    errors.email
                      ? 'border-red-400 bg-red-50/30'
                      : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5'
                  } text-xs sm:text-sm text-[#1E293B] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all`}
                />
                {errors.email && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Row 2: Phone and Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-xs sm:text-sm text-[#1E293B] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                  Company <span className="text-red-500">*</span>
                </label>
                {companyOptions.length > 0 ? (
                  <CustomDropdown
                    value={formData.company}
                    onChange={(val) => setFormData({ ...formData, company: val })}
                    options={companyOptions}
                    placeholder="Select company"
                  />
                ) : (
                  <input
                    type="text"
                    placeholder="Company name"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-xs sm:text-sm text-[#1E293B] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all"
                  />
                )}
                {errors.company && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.company}</p>
                )}
              </div>
            </div>

            {/* Row 3: Status and Assigned User */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                  Pipeline Status
                </label>
                <CustomDropdown
                  value={formData.status}
                  onChange={(val) => setFormData({ ...formData, status: val })}
                  options={STATUS_OPTIONS}
                  placeholder="Select status"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                  Assigned Team Member
                </label>
                <CustomDropdown
                  value={formData.assignedTo}
                  onChange={(val) => setFormData({ ...formData, assignedTo: val })}
                  options={userOptions}
                  placeholder="Select assignee"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 px-7 sm:px-8 border-t border-[#E2E8F0] dark:border-[#222543] flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-white/5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs sm:text-sm font-semibold text-[#475569] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:opacity-95 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Create Lead'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditLeadModal;
