import React, { useState, useEffect } from 'react';
import { AVAILABLE_INDUSTRIES } from '../../services/companyService';
import CustomDropdown from '../common/CustomDropdown';

const INDUSTRY_OPTIONS = [
  ...AVAILABLE_INDUSTRIES.map((ind) => ({ value: ind, label: ind }))
];

const AddEditCompanyModal = ({ isOpen, onClose, onSave, company = null }) => {
  const isEditing = Boolean(company);

  const [formData, setFormData] = useState({
    name: '',
    industry: 'IT',
    location: '',
    website: '',
    email: '',
    phone: '',
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        industry: company.industry || 'IT',
        location: company.location || '',
        website: company.website || '',
        email: company.email || '',
        phone: company.phone || '',
        description: company.description || ''
      });
    } else {
      setFormData({
        name: '',
        industry: 'IT',
        location: '',
        website: '',
        email: '',
        phone: '',
        description: ''
      });
    }
    setErrors({});
  }, [company, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Company name is required';
    if (!formData.industry) errs.industry = 'Industry is required';
    if (!formData.location.trim()) errs.location = 'Location is required';
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
        location: formData.location.trim(),
        website: formData.website.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim()
      });
      onClose();
    } catch (err) {
      console.error('Error saving company:', err);
      setErrors({ form: err.message || 'Failed to save company.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop: Does NOT close modal */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-[600px] bg-white dark:bg-[#15172A] rounded-[26px] shadow-[0_25px_60px_-15px_rgba(27,25,60,0.3)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border border-[#E2E8F0] dark:border-[#222543] overflow-hidden z-10 animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 px-7 sm:px-8 border-b border-[#E2E8F0] dark:border-[#222543] flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-indigo-50/40 dark:from-[#15172A] dark:via-[#1A1C32] dark:to-[#15172A]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#818CF8] flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1E293B] dark:text-white tracking-tight">
                {isEditing ? 'Edit Company' : 'Add Company'}
              </h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                {isEditing
                  ? 'Update client account details and headquarters'
                  : 'Enter company information to register a new account'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-[#64748B] dark:text-slate-300 hover:text-[#1E293B] dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close modal"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4 sm:space-y-5">
          {errors.form && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium">
              {errors.form}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* Field 1: Company Name */}
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. ABC Corp"
                className={`w-full h-11 px-3.5 rounded-xl border ${
                  errors.name
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15'
                    : 'border-[#E2E8F0] dark:border-white/10 focus:border-[#6366F1] focus:ring-[#6366F1]/15'
                } bg-white dark:bg-[#1A1C32] text-sm text-[#1E293B] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 transition-all`}
              />
              {errors.name && (
                <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.name}</p>
              )}
            </div>

            {/* Field 2: Industry */}
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                Industry <span className="text-red-500">*</span>
              </label>
              <CustomDropdown
                value={formData.industry}
                onChange={(val) => setFormData({ ...formData, industry: val })}
                options={INDUSTRY_OPTIONS}
                placeholder="Select Industry"
                searchPlaceholder="Search industry name..."
                searchable={true}
              />
              {errors.industry && (
                <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.industry}</p>
              )}
            </div>

            {/* Field 3: Location */}
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Chennai"
                className={`w-full h-11 px-3.5 rounded-xl border ${
                  errors.location
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15'
                    : 'border-[#E2E8F0] dark:border-white/10 focus:border-[#6366F1] focus:ring-[#6366F1]/15'
                } bg-white dark:bg-[#1A1C32] text-sm text-[#1E293B] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 transition-all`}
              />
              {errors.location && (
                <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.location}</p>
              )}
            </div>

            {/* Field 4: Website */}
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                Website
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="e.g. www.abc-corp.com"
                className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-[#1A1C32] text-sm text-[#1E293B] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all"
              />
            </div>

            {/* Field 5: Contact Email */}
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. contact@abc-corp.com"
                className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-[#1A1C32] text-sm text-[#1E293B] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all"
              />
            </div>

            {/* Field 6: Contact Phone */}
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                Contact Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +91 44 4321 8765"
                className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-[#1A1C32] text-sm text-[#1E293B] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs sm:text-sm font-semibold text-[#475569] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 h-11 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:opacity-95 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditCompanyModal;
