import React, { useState, useEffect } from 'react';
import {
  AVAILABLE_TASK_STATUSES,
  AVAILABLE_PRIORITIES
} from '../../services/taskService';
import { AVAILABLE_USERS } from '../../services/leadService';
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

const USER_OPTIONS = [
  ...AVAILABLE_USERS.map((u) => ({ value: u, label: u }))
];

const DEFAULT_LEAD_OPTIONS = [
  { value: 'Ravi Kumar', label: 'Ravi Kumar (ABC Corp)' },
  { value: 'Priya Sharma', label: 'Priya Sharma (TechSol)' },
  { value: 'Suresh Patel', label: 'Suresh Patel (Globex)' },
  { value: 'Anita Roy', label: 'Anita Roy (NextGen)' },
  { value: 'Vikram Singh', label: 'Vikram Singh (Acme Corp)' },
  { value: 'Sarah Jenkins', label: 'Sarah Jenkins (Acme Corp)' },
  { value: 'Amit Verma', label: 'Amit Verma (TechSol)' },
  { value: 'Deepa Menon', label: 'Deepa Menon (Globex)' }
];

const AddEditTaskModal = ({
  isOpen,
  onClose,
  onSave,
  task = null,
  leadOptions = DEFAULT_LEAD_OPTIONS
}) => {
  const isEditing = Boolean(task);

  const [formData, setFormData] = useState({
    title: '',
    leadName: 'Ravi Kumar',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'Pending',
    assignedTo: 'John Doe',
    priority: 'Medium',
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        leadName: task.leadName || 'Ravi Kumar',
        dueDate: task.dueDate || new Date().toISOString().split('T')[0],
        status: task.status || 'Pending',
        assignedTo: task.assignedTo || 'John Doe',
        priority: task.priority || 'Medium',
        description: task.description || ''
      });
    } else {
      setFormData({
        title: '',
        leadName: 'Ravi Kumar',
        dueDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
        assignedTo: 'John Doe',
        priority: 'Medium',
        description: ''
      });
    }
    setErrors({});
  }, [task, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Task title is required';
    if (!formData.leadName) errs.leadName = 'Associated lead is required';
    if (!formData.dueDate) errs.dueDate = 'Due date is required';
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
      setErrors({ form: err.message || 'Failed to save task.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedLeadOptions = leadOptions.length > 0 ? leadOptions : DEFAULT_LEAD_OPTIONS;

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1E293B] dark:text-white tracking-tight">
                {isEditing ? 'Edit Task' : 'Add Task'}
              </h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                {isEditing
                  ? 'Update task milestones and assignee schedule'
                  : 'Create a new activity milestone for your sales pipeline'}
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
            {/* Field 1: Task Title */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Call with Ravi"
                className={`w-full h-11 px-3.5 rounded-xl border ${
                  errors.title
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15'
                    : 'border-[#E2E8F0] dark:border-white/10 focus:border-[#6366F1] focus:ring-[#6366F1]/15'
                } bg-white dark:bg-[#1A1C32] text-sm text-[#1E293B] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 transition-all`}
              />
              {errors.title && (
                <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.title}</p>
              )}
            </div>

            {/* Field 2: Associated Lead (Searchable Dropdown) */}
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                Lead <span className="text-red-500">*</span>
              </label>
              <CustomDropdown
                value={formData.leadName}
                onChange={(val) => setFormData({ ...formData, leadName: val })}
                options={formattedLeadOptions}
                placeholder="Select Lead"
                searchPlaceholder="Search lead name..."
                searchable={true}
              />
            </div>

            {/* Field 3: Due Date */}
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-[#1A1C32] text-sm text-[#1E293B] dark:text-white focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all cursor-pointer"
              />
              {errors.dueDate && (
                <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.dueDate}</p>
              )}
            </div>

            {/* Field 4: Status (Searchable Dropdown) */}
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                Status
              </label>
              <CustomDropdown
                value={formData.status}
                onChange={(val) => setFormData({ ...formData, status: val })}
                options={STATUS_OPTIONS}
                placeholder="Select Status"
                searchPlaceholder="Search status..."
                searchable={true}
              />
            </div>

            {/* Field 5: Assigned To (Searchable Dropdown) */}
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                Assigned To
              </label>
              <CustomDropdown
                value={formData.assignedTo}
                onChange={(val) => setFormData({ ...formData, assignedTo: val })}
                options={USER_OPTIONS}
                placeholder="Assign User"
                searchPlaceholder="Search user name..."
                searchable={true}
              />
            </div>

            {/* Field 6: Priority */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                Priority
              </label>
              <CustomDropdown
                value={formData.priority}
                onChange={(val) => setFormData({ ...formData, priority: val })}
                options={PRIORITY_OPTIONS}
                placeholder="Select Priority"
              />
            </div>

            {/* Field 7: Description / Notes */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#1E293B] dark:text-slate-200 mb-1.5">
                Task Description / Notes
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add milestone context or preparation requirements..."
                className="w-full p-3 rounded-xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-[#1A1C32] text-sm text-[#1E293B] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all resize-none"
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

export default AddEditTaskModal;
