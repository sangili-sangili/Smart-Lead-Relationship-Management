import api from './api';

const STORAGE_KEY = 'leadflow_tasks_data';

export const DEFAULT_TASKS = [
  {
    id: 'task-1',
    title: 'Call with Ravi',
    leadName: 'Ravi Kumar',
    dueDate: '2025-04-22',
    dueDateFormatted: 'Apr 22, 2025',
    status: 'Pending',
    assignedTo: 'John Doe',
    priority: 'High',
    description: 'Quarterly review call to discuss enterprise cloud expansion requirements.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    isDeleted: false
  },
  {
    id: 'task-2',
    title: 'Send proposal',
    leadName: 'Priya Sharma',
    dueDate: '2025-04-22',
    dueDateFormatted: 'Apr 22, 2025',
    status: 'In Progress',
    assignedTo: 'Sarah Lee',
    priority: 'Medium',
    description: 'Finalize multi-region SaaS architecture scope document and send draft.',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    isDeleted: false
  },
  {
    id: 'task-3',
    title: 'Follow up',
    leadName: 'Suresh Patel',
    dueDate: '2025-04-23',
    dueDateFormatted: 'Apr 23, 2025',
    status: 'Pending',
    assignedTo: 'Mike Ross',
    priority: 'Medium',
    description: 'Verify security compliance sign-off from IT procurement committee.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    isDeleted: false
  },
  {
    id: 'task-4',
    title: 'Demo call',
    leadName: 'Anita Roy',
    dueDate: '2025-04-24',
    dueDateFormatted: 'Apr 24, 2025',
    status: 'Completed',
    assignedTo: 'John Doe',
    priority: 'Low',
    description: 'Demonstrated automated sales pipeline triggers and workflow reporting.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    isDeleted: false
  },
  {
    id: 'task-5',
    title: 'Send quote',
    leadName: 'Vikram Singh',
    dueDate: '2025-04-25',
    dueDateFormatted: 'Apr 25, 2025',
    status: 'Pending',
    assignedTo: 'Sarah Lee',
    priority: 'High',
    description: 'Prepare custom tiered pricing estimate for 250 enterprise user licenses.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    isDeleted: false
  },
  {
    id: 'task-6',
    title: 'Contract review',
    leadName: 'Sarah Jenkins',
    dueDate: '2025-04-26',
    dueDateFormatted: 'Apr 26, 2025',
    status: 'In Progress',
    assignedTo: 'Mike Ross',
    priority: 'High',
    description: 'Review SLA terms and legal addendums before CEO signature.',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    isDeleted: false
  },
  {
    id: 'task-7',
    title: 'Technical discovery',
    leadName: 'Amit Verma',
    dueDate: '2025-04-27',
    dueDateFormatted: 'Apr 27, 2025',
    status: 'Completed',
    assignedTo: 'John Doe',
    priority: 'Medium',
    description: 'Deep dive session on REST and GraphQL integration endpoints.',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    isDeleted: false
  },
  {
    id: 'task-8',
    title: 'Product trial check-in',
    leadName: 'Deepa Menon',
    dueDate: '2025-04-28',
    dueDateFormatted: 'Apr 28, 2025',
    status: 'Pending',
    assignedTo: 'Sarah Lee',
    priority: 'Low',
    description: 'Check usage telemetry and collect initial user feedback.',
    createdAt: new Date().toISOString(),
    isDeleted: false
  }
];

export const AVAILABLE_TASK_STATUSES = ['Pending', 'In Progress', 'Completed'];
export const AVAILABLE_PRIORITIES = ['High', 'Medium', 'Low'];

const getStoredTasks = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TASKS));
      return DEFAULT_TASKS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read tasks from storage', err);
    return DEFAULT_TASKS;
  }
};

const saveStoredTasks = (tasks) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to storage', err);
  }
};

const formatDateForDisplay = (dateString) => {
  if (!dateString) return 'No due date';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export const taskService = {
  /**
   * Fetch paginated tasks with search & filters
   */
  async getTasks({ search = '', status = '', user = '', page = 1, limit = 5 } = {}) {
    try {
      const response = await api.get('/tasks', {
        params: { search, status, user, page, limit }
      });
      if (response && response.data && response.data.length > 0) {
        return response;
      }
    } catch {
      // Fallback
    }

    let tasks = getStoredTasks().filter((t) => !t.isDeleted);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.leadName.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    if (status && status !== 'All Status') {
      tasks = tasks.filter((t) => t.status.toLowerCase() === status.toLowerCase());
    }

    if (user && user !== 'All Users') {
      tasks = tasks.filter((t) => t.assignedTo.toLowerCase() === user.toLowerCase());
    }

    const total = tasks.length;
    const startIndex = (page - 1) * limit;
    const paginated = tasks.slice(startIndex, startIndex + limit);

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
   * Create a new task
   */
  async createTask(taskData) {
    try {
      const response = await api.post('/tasks', taskData);
      if (response && response.data) return response.data;
    } catch {
      // Fallback
    }

    const tasks = getStoredTasks();
    const newTask = {
      id: `task-${Date.now()}`,
      ...taskData,
      dueDateFormatted: formatDateForDisplay(taskData.dueDate),
      createdAt: new Date().toISOString(),
      isDeleted: false
    };

    tasks.unshift(newTask);
    saveStoredTasks(tasks);
    return newTask;
  },

  /**
   * Update existing task
   */
  async updateTask(id, updateData) {
    try {
      const response = await api.put(`/tasks/${id}`, updateData);
      if (response && response.data) return response.data;
    } catch {
      // Fallback
    }

    const tasks = getStoredTasks();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error('Task not found');
    }

    tasks[index] = {
      ...tasks[index],
      ...updateData,
      dueDateFormatted: updateData.dueDate
        ? formatDateForDisplay(updateData.dueDate)
        : tasks[index].dueDateFormatted,
      updatedAt: new Date().toISOString()
    };

    saveStoredTasks(tasks);
    return tasks[index];
  },

  /**
   * Update task status (enforcing assigned user or admin rule)
   */
  async updateTaskStatus(id, newStatus, currentUser) {
    const tasks = getStoredTasks();
    const task = tasks.find((t) => t.id === id);
    if (!task) {
      throw new Error('Task not found');
    }

    // Authorization rule: Only assigned user or Admin can update task status
    const isAdmin = currentUser?.role === 'Admin';
    const isAssignee = currentUser?.name && task.assignedTo.toLowerCase() === currentUser.name.toLowerCase();

    if (!isAdmin && !isAssignee) {
      throw new Error(`Permission denied: Only ${task.assignedTo} or an Admin can change this task's status.`);
    }

    try {
      await api.patch(`/tasks/${id}/status`, { status: newStatus });
    } catch {
      // Fallback
    }

    task.status = newStatus;
    task.updatedAt = new Date().toISOString();
    saveStoredTasks(tasks);
    return task;
  },

  /**
   * Soft delete task
   */
  async deleteTask(id) {
    try {
      await api.delete(`/tasks/${id}`);
    } catch {
      // Fallback
    }

    const tasks = getStoredTasks();
    const updated = tasks.map((t) => (t.id === id ? { ...t, isDeleted: true } : t));
    saveStoredTasks(updated);
    return { success: true };
  }
};
