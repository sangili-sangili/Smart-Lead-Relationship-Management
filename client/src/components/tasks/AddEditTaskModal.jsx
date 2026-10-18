import React, { useState, useEffect } from 'react';
import {
  AVAILABLE_TASK_STATUSES,
  AVAILABLE_PRIORITIES
} from '../../services/taskService';
import authService from '../../services/authService';
import leadService from '../../services/leadService';
import CustomDropdown from '../common/CustomDropdown';

const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending', dotColor: '#F59E0B' },
  { value: 'In Progress', label: 'In Progress', dotColor: '#3B82F6' },
  { value: 'Completed', label: 'Completed', dotColor: '#10B981' }
];

const PRIORITY_OPTIONS = [
  { value: 'High', label: 'High Priority', dotColor: '#EF4444' },
  { value: 'Medium', label: 'Medium Priority', dotColor: '#F59E0B' },
  { value: 'Low', label: 'Low Priority', dotColor: '#64748B' }
];

const AddEditTaskModal = ({
  isOpen,
  onClose,
  onSave,
  task = null,
  leadOptions = []
}) => {
  const isEditing = Boolean(task);

  const [formData, setFormData] = useState({
    title: '',
    leadName: '',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'Pending',
    assignedTo: '',
    priority: 'Medium',
    description: ''
  });

  const [userOptions, setUserOptions] = useState([]);
  const [availableLeads, setAvailableLeads] = useState(leadOptions);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch live users and leads if not already passed
  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      authService.getUsers().then((users) => {
        if (!isMounted) return;
        setUserOptions((users || []).map((u) => ({
          value: u.name,
          label: `${u.name} (${u.role || 'User'})`
        })));
      }).catch(() => {});

      if (!leadOptions || leadOptions.length === 0) {
        leadService.getLeads({ limit: 100 }).then((res) => {
          if (!isMounted) return;
          const options = (res.data || []).map((l) => ({
            value: l.name,
            label: `${l.name} (${l.company || 'Direct'})`
          }));
          setAvailableLeads(options);
        }).catch(() => {});
      } else {
        setAvailableLeads(leadOptions);
      }
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, leadOptions]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        leadName: task.leadName || '',
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        status: task.status || 'Pending',
        assignedTo: task.assignedTo || '',
        priority: task.priority || 'Medium',
        description: task.description || ''
      });
    } else {
      setFormData({
        title: '',
        leadName: availableLeads[0]?.value || '',
        dueDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
        assignedTo: userOptions[0]?.value || '',
        priority: 'Medium',
        description: ''
      });
    }
    setErrors({});
  }, [task, isOpen, availableLeads, userOptions]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Task title is required';
    }
    if (!formData.leadName) {
      errs.leadName = 'Associated lead is required';
    }
    if (!formData.dueDate) {
      errs.dueDate = 'Due date is required';
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
        title: formData.title.trim(),
        description: formData.description.trim()
      });
      onClose();
    } catch (err) {
      console.error('Error saving task:', err);
      setErrors({ form: err.message || 'Failed to save task. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-[620px] bg-white dark:bg-[#15172A] rounded-[26px] shadow-[0_25px_60px_-15px_rgba(27,25,60,0.3)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border border-[#E2E8F0] dark:border-[#222543] overflow-hidden z-10 animate-modal-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 px-7 sm:px-8 border-b border-[#E2E8F0] dark:border-[#222543] flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-amber-50/40 dark:from-[#15172A] dark:via-[#1A1C32] dark:to-[#15172A]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F59E0B] to-[#FBBF24] flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
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
                {isEditing ? 'Edit Task' : 'Add New Task'}
              </h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                {isEditing
                  ? 'Update task milestones and completion status'
                  : 'Assign follow-ups, calls, or deadlines to a lead'}
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

            {/* Task Title */}
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Schedule product demo"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full h-11 px-3.5 rounded-xl border ${
                  errors.title
                    ? 'border-red-400 bg-red-50/30'
                    : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5'
                } text-xs sm:text-sm text-[#1E293B] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all`}
              />
              {errors.title && (
                <p className="text-[11px] text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            {/* Row: Associated Lead & Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                  Associated Lead <span className="text-red-500">*</span>
                </label>
                {availableLeads.length > 0 ? (
                  <CustomDropdown
                    value={formData.leadName}
                    onChange={(val) => setFormData({ ...formData, leadName: val })}
                    options={availableLeads}
                    placeholder="Select lead"
                  />
                ) : (
                  <input
                    type="text"
                    placeholder="Lead name"
                    value={formData.leadName}
                    onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-xs sm:text-sm text-[#1E293B] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all"
                  />
                )}
                {errors.leadName && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.leadName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-xs sm:text-sm text-[#1E293B] dark:text-white focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all"
                />
                {errors.dueDate && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.dueDate}</p>
                )}
              </div>
            </div>

            {/* Row: Status, Priority, Assigned User */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                  Status
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
                  Priority
                </label>
                <CustomDropdown
                  value={formData.priority}
                  onChange={(val) => setFormData({ ...formData, priority: val })}
                  options={PRIORITY_OPTIONS}
                  placeholder="Select priority"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                  Assigned To
                </label>
                <CustomDropdown
                  value={formData.assignedTo}
                  onChange={(val) => setFormData({ ...formData, assignedTo: val })}
                  options={userOptions}
                  placeholder="Select assignee"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                Task Notes / Description
              </label>
              <textarea
                rows={3}
                placeholder="Add agenda, discussion points, or customer requirements..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-xs sm:text-sm text-[#1E293B] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all resize-none"
              />
            </div>
          </div>

          {/* Modal Footer */}
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
                <span>{isEditing ? 'Save Changes' : 'Create Task'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditTaskModal;
