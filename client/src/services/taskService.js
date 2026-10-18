import api from './api';

// Clean up any legacy dummy localStorage cache
try {
  localStorage.removeItem('leadflow_tasks_data');
} catch {}

export const AVAILABLE_TASK_STATUSES = ['Pending', 'In Progress', 'Completed'];
export const AVAILABLE_PRIORITIES = ['High', 'Medium', 'Low'];

export const formatDateForDisplay = (dateString) => {
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
   * Calls live MongoDB endpoint: GET /api/tasks
   */
  async getTasks({ search = '', status = '', user = '', page = 1, limit = 5 } = {}) {
    const response = await api.get('/tasks', {
      params: { search, status, user, page, limit }
    });

    const rawList = response.data || [];
    const tasks = rawList.map((t) => ({
      ...t,
      id: t._id || t.id,
      leadName: t.lead?.name || t.leadName || (typeof t.lead === 'string' ? t.lead : 'N/A'),
      leadId: t.lead?._id || (typeof t.lead === 'object' ? t.lead?._id : t.lead),
      assignedTo: t.assignedTo?.name || t.assignedTo || 'Unassigned',
      assignedToId: t.assignedTo?._id || t.assignedTo,
      dueDateFormatted: formatDateForDisplay(t.dueDate)
    }));

    return {
      success: true,
      data: tasks,
      meta: response.meta || {
        total: tasks.length,
        page,
        limit,
        totalPages: 1
      }
    };
  },

  /**
   * Create a new task in MongoDB
   * Calls: POST /api/tasks
   */
  async createTask(taskData) {
    const response = await api.post('/tasks', taskData);
    const data = response.data || response;
    return {
      ...data,
      id: data._id || data.id,
      leadName: data.lead?.name || data.leadName || 'N/A',
      assignedTo: data.assignedTo?.name || data.assignedTo || 'Unassigned',
      dueDateFormatted: formatDateForDisplay(data.dueDate)
    };
  },

  /**
   * Update existing task in MongoDB
   * Calls: PUT /api/tasks/:id
   */
  async updateTask(id, updateData) {
    const response = await api.put(`/tasks/${id}`, updateData);
    const data = response.data || response;
    return {
      ...data,
      id: data._id || data.id,
      dueDateFormatted: formatDateForDisplay(data.dueDate)
    };
  },

  /**
   * Update task status (server enforces assignee / admin permissions)
   * Calls: PATCH /api/tasks/:id/status
   */
  async updateTaskStatus(id, newStatus) {
    const response = await api.patch(`/tasks/${id}/status`, { status: newStatus });
    return response.data || response;
  },

  /**
   * Soft delete task in MongoDB
   * Calls: DELETE /api/tasks/:id
   */
  async deleteTask(id) {
    const response = await api.delete(`/tasks/${id}`);
    return response;
  }
};

export default taskService;
