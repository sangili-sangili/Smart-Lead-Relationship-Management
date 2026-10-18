import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  taskService,
  AVAILABLE_TASK_STATUSES
} from '../services/taskService';
import { leadService, AVAILABLE_USERS } from '../services/leadService';
import AddEditTaskModal from '../components/tasks/AddEditTaskModal';
import CustomDropdown from '../components/common/CustomDropdown';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'Pending', label: 'Pending', dotColor: '#F59E0B' },
  { value: 'In Progress', label: 'In Progress', dotColor: '#3B82F6' },
  { value: 'Completed', label: 'Completed', dotColor: '#10B981' }
];

const USER_FILTER_OPTIONS = [
  { value: '', label: 'All Users' },
  ...AVAILABLE_USERS.map((usr) => ({ value: usr, label: usr }))
];

const getStatusBadgeStyle = (status) => {
  switch (status) {
    case 'Pending':
      return 'bg-amber-50 text-amber-600 border-amber-200/80 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30';
    case 'In Progress':
      return 'bg-blue-50 text-blue-600 border-blue-200/80 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30';
    case 'Completed':
      return 'bg-emerald-50 text-emerald-600 border-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/10 dark:text-slate-300 dark:border-white/10';
  }
};

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, limit: 5 });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const toast = useToast();
  const confirm = useConfirm();

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem('leadflow_user') || '{"name":"John Doe","role":"Admin"}'
      );
    } catch {
      return { name: 'John Doe', role: 'Admin' };
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await taskService.getTasks({
        search,
        status: statusFilter,
        user: userFilter,
        page,
        limit: 5
      });
      setTasks(res.data || []);
      setMeta(res.meta || { total: 0, totalPages: 1, limit: 5 });
    } catch (err) {
      console.error('Error fetching tasks:', err);
      toast.error('Failed to load tasks', 'Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, userFilter, page, toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Load leads for the task creation dropdown
  useEffect(() => {
    const loadLeads = async () => {
      try {
        const res = await leadService.getLeads({ limit: 100 });
        if (res && res.data) {
          setLeads(res.data);
        }
      } catch (err) {
        console.error('Failed to load leads for task creation:', err);
      }
    };
    loadLeads();
  }, []);

  const leadOptions = useMemo(() => {
    return leads.map((l) => ({
      value: l.name,
      label: `${l.name} (${l.company || 'Pipeline'})`
    }));
  }, [leads]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (val) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleUserFilterChange = (val) => {
    setUserFilter(val);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setUserFilter('');
    setPage(1);
  };

  const handleOpenAddModal = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (formData) => {
    if (selectedTask) {
      await taskService.updateTask(selectedTask.id, formData);
      toast.success('Task Updated Successfully', `"${formData.title}" updated.`);
    } else {
      await taskService.createTask(formData);
      toast.success('Task Created Successfully', `"${formData.title}" added to schedule.`);
    }
    fetchTasks();
  };

  const handleToggleStatus = async (task) => {
    // Determine next status cycle: Pending -> In Progress -> Completed -> Pending
    let nextStatus = 'In Progress';
    if (task.status === 'Pending') nextStatus = 'In Progress';
    else if (task.status === 'In Progress') nextStatus = 'Completed';
    else if (task.status === 'Completed') nextStatus = 'Pending';

    // If moving to Completed, prompt confirmation
    if (nextStatus === 'Completed') {
      const ok = await confirm({
        title: 'Mark Task Completed?',
        message: `Are you sure you want to mark "${task.title}" as completed?`,
        confirmText: 'Mark Complete',
        cancelText: 'Cancel',
        type: 'info',
        itemName: task.title,
        itemBadge: `${task.leadName} • ${task.dueDateFormatted}`
      });
      if (!ok) return;
    }

    try {
      await taskService.updateTaskStatus(task.id, nextStatus, currentUser);
      toast.success('Status Updated', `"${task.title}" is now ${nextStatus}.`);
      fetchTasks();
    } catch (err) {
      toast.error('Permission Denied', err.message);
    }
  };

  const handleDeleteTask = async (task) => {
    const ok = await confirm({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      itemName: task.title,
      itemBadge: `${task.leadName} • ${task.status}`
    });

    if (ok) {
      try {
        await taskService.deleteTask(task.id);
        toast.success('Task Deleted Successfully', `"${task.title}" removed.`);
        fetchTasks();
      } catch (err) {
        toast.error('Deletion Failed', err.message || 'Could not delete task.');
      }
    }
  };

  const hasActiveFilters = Boolean(search || statusFilter || userFilter);

  const startIndex = useMemo(() => {
    if (meta.total === 0) return 0;
    return (page - 1) * meta.limit + 1;
  }, [page, meta.limit, meta.total]);

  const endIndex = useMemo(() => {
    return Math.min(page * meta.limit, meta.total);
  }, [page, meta.limit, meta.total]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Header matching Figma Row 2 Column 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[1.85rem] font-bold text-[#1E293B] dark:text-white tracking-tight mb-1">
            Tasks
          </h1>
          <p className="text-sm text-[#64748B] dark:text-slate-400">
            Manage your schedule and task status updates (assignee-only permission).
          </p>
        </div>

        {/* Primary Action Button (Single plus, no double +) */}
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:opacity-95 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Task</span>
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
            value={search}
            onChange={handleSearchChange}
            placeholder="Search tasks by title, lead..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50/70 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs sm:text-sm text-[#1E293B] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15 transition-all"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setPage(1); }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#1E293B] dark:hover:text-white"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Status & User Filters using CustomDropdown */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="w-full sm:w-44">
            <CustomDropdown
              value={statusFilter}
              onChange={handleStatusFilterChange}
              options={STATUS_FILTER_OPTIONS}
              placeholder="All Status"
            />
          </div>

          {/* User Filter */}
          <div className="w-full sm:w-44">
            <CustomDropdown
              value={userFilter}
              onChange={handleUserFilterChange}
              options={USER_FILTER_OPTIONS}
              placeholder="All Users"
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

      {/* Tasks Table Container matching Figma */}
      <div className="bg-white dark:bg-[#15172A] rounded-[24px] border border-[#E2E8F0] dark:border-[#222543] overflow-hidden shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)]">
        
        {/* Desktop / Tablet Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.03]">
                <th className="py-4 px-6 text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="py-4 px-6 text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                  Lead
                </th>
                <th className="py-4 px-6 text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="py-4 px-6 text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-4 px-6 text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                  Assigned To
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
                    <td className="py-4 px-6"><div className="h-4 w-32 bg-slate-200 dark:bg-white/10 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-24 bg-slate-200 dark:bg-white/10 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-24 bg-slate-200 dark:bg-white/10 rounded" /></td>
                    <td className="py-4 px-6"><div className="h-6 w-20 bg-slate-200 dark:bg-white/10 rounded-full" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-20 bg-slate-200 dark:bg-white/10 rounded" /></td>
                    <td className="py-4 px-6 text-right"><div className="h-6 w-16 bg-slate-200 dark:bg-white/10 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-6 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-[#6366F1] flex items-center justify-center mx-auto">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-[#1E293B] dark:text-white">
                        No tasks found
                      </p>
                      <p className="text-xs text-[#64748B] dark:text-slate-400">
                        {hasActiveFilters
                          ? 'Try adjusting your search query or status filter.'
                          : 'Schedule your first pipeline activity to keep leads moving forward.'}
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
                          <span>Add Task</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-[#F8FAFC] dark:hover:bg-white/5 transition-colors group"
                  >
                    {/* Title */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-[#6366F1] dark:text-indigo-400 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1E293B] dark:text-white group-hover:text-[#6366F1] dark:group-hover:text-indigo-400 transition-colors">
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-[11px] text-[#94A3B8] dark:text-slate-400 max-w-xs truncate">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Lead */}
                    <td className="py-4 px-6 text-xs sm:text-sm text-[#475569] dark:text-slate-300 font-medium">
                      {task.leadName}
                    </td>

                    {/* Due Date */}
                    <td className="py-4 px-6 text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
                      {task.dueDateFormatted || task.dueDate}
                    </td>

                    {/* Status with Quick Toggle */}
                    <td className="py-4 px-6">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(task)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-2xs transition-all hover:scale-105 cursor-pointer ${getStatusBadgeStyle(
                          task.status
                        )}`}
                        title="Click to cycle status (Assignee or Admin only)"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                        <span>{task.status}</span>
                      </button>
                    </td>

                    {/* Assigned To */}
                    <td className="py-4 px-6 text-xs sm:text-sm text-[#475569] dark:text-slate-300 font-medium">
                      {task.assignedTo}
                    </td>

                    {/* Actions: Edit & Delete */}
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(task)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] dark:text-slate-400 hover:text-[#6366F1] dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors cursor-pointer"
                          title="Edit Task"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete Task"
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
            <div className="p-6 text-center text-xs text-[#94A3B8]">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#94A3B8]">No tasks found.</div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="p-4 sm:p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#1E293B] dark:text-white truncate">
                      {task.title}
                    </p>
                    <p className="text-xs text-[#64748B] dark:text-slate-400 truncate">
                      Lead: <span className="font-semibold">{task.leadName}</span> • Due: {task.dueDateFormatted || task.dueDate}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(task)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${getStatusBadgeStyle(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-[#475569] dark:text-slate-300 bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl border border-slate-200/60 dark:border-white/10">
                  <span className="text-[#94A3B8]">Assigned To: <strong className="text-[#1E293B] dark:text-white">{task.assignedTo}</strong></span>
                  <span className="text-[#94A3B8]">Priority: <strong className="text-[#1E293B] dark:text-white">{task.priority}</strong></span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(task)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-semibold text-[#475569] dark:text-slate-300 hover:text-[#6366F1] flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task)}
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
            tasks
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="w-8 h-8 rounded-xl border border-slate-200/80 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-[#64748B] dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
              title="Previous Page"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {Array.from({ length: meta.totalPages || 1 }, (_, i) => i + 1).map((pageNum) => {
              const isActive = pageNum === page;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#6366F1] text-white shadow-xs shadow-indigo-600/30'
                      : 'hover:bg-slate-100 dark:hover:bg-white/10 text-[#64748B] dark:text-slate-400'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((prev) => Math.min(meta.totalPages, prev + 1))}
              className="w-8 h-8 rounded-xl border border-slate-200/80 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-[#64748B] dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
              title="Next Page"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

      </div>

      {/* Global Add / Edit Task Modal */}
      <AddEditTaskModal
        isOpen={isModalOpen}
        task={selectedTask}
        leadOptions={leadOptions}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
      />
    </div>
  );
};

export default TasksPage;
