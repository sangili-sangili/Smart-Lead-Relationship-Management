const mongoose = require('mongoose');
const Task = require('../models/Task');
const Lead = require('../models/Lead');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const AppError = require('../utils/appError');
const HTTP_STATUS = require('../constants/httpStatusCodes');
const { logNotification } = require('../utils/notificationService');
const { escapeRegex, sanitizePagination } = require('../utils/queryHelper');

/**
 * Helper to resolve lead identifier (ObjectId or lead name string)
 */
const resolveLeadId = async (leadInput) => {
  if (!leadInput) return null;
  if (mongoose.Types.ObjectId.isValid(leadInput)) {
    return leadInput;
  }
  const cleanName = escapeRegex(leadInput);
  const lead = await Lead.findOne({ name: { $regex: `^${cleanName}$`, $options: 'i' } })
    .select('_id')
    .lean();
  return lead ? lead._id : null;
};

/**
 * Helper to resolve user identifier (ObjectId or user name string)
 */
const resolveUserId = async (userInput) => {
  if (!userInput) return null;
  if (mongoose.Types.ObjectId.isValid(userInput)) {
    return userInput;
  }
  const cleanName = escapeRegex(userInput);
  const user = await User.findOne({ name: { $regex: `^${cleanName}$`, $options: 'i' } })
    .select('_id')
    .lean();
  return user ? user._id : null;
};

/**
 * Format task object for client UI compatibility and standard REST specs
 */
const formatTask = (taskDoc) => {
  const plain = taskDoc.toObject ? taskDoc.toObject() : taskDoc;
  
  // Format due date in human friendly form (e.g. 'Apr 22, 2025')
  let dueDateFormatted = '';
  if (plain.dueDate) {
    const d = new Date(plain.dueDate);
    dueDateFormatted = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  return {
    ...plain,
    id: plain._id,
    leadId: plain.lead?._id || plain.lead,
    leadName: plain.lead?.name || 'Unknown Lead',
    assignedToId: plain.assignedTo?._id || plain.assignedTo,
    assignedTo: plain.assignedTo?.name || 'Unassigned',
    assignedToAvatar: plain.assignedTo?.avatar || '',
    dueDateFormatted
  };
};

/**
 * Get all tasks with filtering, search, and pagination
 * GET /api/tasks
 */
const getTasks = async (req, res, next) => {
  try {
    const {
      search = '',
      status = '',
      priority = '',
      user = '',
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    // Status filter
    if (status && status !== 'All Status' && status !== 'All') {
      const cleanStatus = escapeRegex(status);
      query.status = { $regex: `^${cleanStatus}$`, $options: 'i' };
    }

    // Priority filter
    if (priority && priority !== 'All Priority' && priority !== 'All') {
      const cleanPriority = escapeRegex(priority);
      query.priority = { $regex: `^${cleanPriority}$`, $options: 'i' };
    }

    // Assigned User filter
    if (user && user !== 'All Users' && user !== 'All') {
      if (mongoose.Types.ObjectId.isValid(user)) {
        query.assignedTo = user;
      } else {
        const cleanUser = escapeRegex(user);
        const foundUser = await User.findOne({ name: { $regex: `^${cleanUser}$`, $options: 'i' } })
          .select('_id')
          .lean();
        if (foundUser) {
          query.assignedTo = foundUser._id;
        } else {
          query.assignedTo = new mongoose.Types.ObjectId();
        }
      }
    }

    // Search query across title, description, and lead name
    if (search && search.trim()) {
      const q = escapeRegex(search);
      const searchRegex = { $regex: q, $options: 'i' };

      const matchingLeads = await Lead.find({ name: searchRegex })
        .select('_id')
        .lean();
      const matchingLeadIds = matchingLeads.map((l) => l._id);

      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { lead: { $in: matchingLeadIds } }
      ];
    }

    // Enforce validated bounded pagination
    const { page: pageNum, limit: limitNum, skip } = sanitizePagination(page, limit);

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .select('title lead assignedTo dueDate status priority description createdAt updatedAt')
        .populate('lead', 'name email status company')
        .populate('assignedTo', 'name email avatar role')
        .sort({ dueDate: 1, createdAt: -1, _id: -1 }) // Stable compound sort matching index
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Task.countDocuments(query)
    ]);

    const formattedTasks = tasks.map(formatTask);

    return res.status(200).json({
      success: true,
      message: 'Tasks fetched successfully',
      data: formattedTasks,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.max(1, Math.ceil(total / limitNum))
      },
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.max(1, Math.ceil(total / limitNum))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single task by ID
 * GET /api/tasks/:id
 */
const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .select('title lead assignedTo dueDate status priority description createdAt updatedAt')
      .populate('lead', 'name email status company')
      .populate('assignedTo', 'name email avatar role')
      .lean();

    if (!task) {
      return next(
        new AppError('Task not found', HTTP_STATUS.NOT_FOUND, 'TASK_NOT_FOUND')
      );
    }

    return ApiResponse.success(res, formatTask(task), 'Task retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new task
 * POST /api/tasks
 */
const createTask = async (req, res, next) => {
  try {
    const { title, lead, leadName, assignedTo, dueDate, status, priority, description } = req.body;

    if (!title || (!lead && !leadName) || !dueDate) {
      return next(
        new AppError(
          'Please provide title, associated lead, and due date',
          HTTP_STATUS.BAD_REQUEST,
          'MISSING_REQUIRED_FIELDS'
        )
      );
    }

    // Resolve lead and user concurrently
    const [leadId, assignedToResolved] = await Promise.all([
      resolveLeadId(lead || leadName),
      assignedTo ? resolveUserId(assignedTo) : Promise.resolve(null)
    ]);

    if (!leadId) {
      return next(
        new AppError('Associated lead not found', HTTP_STATUS.BAD_REQUEST, 'INVALID_LEAD')
      );
    }

    let assignedToId = assignedToResolved;
    if (!assignedToId && req.user) {
      assignedToId = req.user.id;
    }

    if (!assignedToId) {
      return next(
        new AppError('Assigned user is required', HTTP_STATUS.BAD_REQUEST, 'MISSING_ASSIGNED_USER')
      );
    }

    const task = await Task.create({
      title: title.trim(),
      lead: leadId,
      assignedTo: assignedToId,
      dueDate: new Date(dueDate),
      status: status || 'Pending',
      priority: priority || 'Medium',
      description: description ? description.trim() : ''
    });

    const populated = await Task.findById(task._id)
      .select('title lead assignedTo dueDate status priority description createdAt updatedAt')
      .populate('lead', 'name email status company')
      .populate('assignedTo', 'name email avatar role')
      .lean();

    // Log notification
    await logNotification({
      title: 'New Task Created',
      message: `Task "${task.title}" has been created and assigned to ${populated.assignedTo?.name || 'you'}.`,
      type: 'task',
      action: 'create',
      entityType: 'Task',
      entityId: task._id,
      recipient: task.assignedTo,
      actor: req.user?.id || null
    });

    return ApiResponse.created(res, formatTask(populated), 'Task created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update task
 * PUT /api/tasks/:id
 */
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, lead, leadName, assignedTo, dueDate, status, priority, description } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return next(
        new AppError('Task not found', HTTP_STATUS.NOT_FOUND, 'TASK_NOT_FOUND')
      );
    }

    // If status is being updated, verify assignee-only or Admin permission
    if (status && status !== task.status) {
      const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user.id.toString();
      const isAdmin = req.user.role === 'Admin';
      if (!isAssigned && !isAdmin) {
        return next(
          new AppError(
            'Only the assigned user or an Admin may update the status of this task.',
            HTTP_STATUS.FORBIDDEN,
            'TASK_STATUS_UPDATE_FORBIDDEN'
          )
        );
      }
      task.status = status;
    }

    // Concurrently resolve lead & user if provided
    const [leadId, assignedToId] = await Promise.all([
      lead || leadName ? resolveLeadId(lead || leadName) : Promise.resolve(undefined),
      assignedTo ? resolveUserId(assignedTo) : Promise.resolve(undefined)
    ]);

    if (title) task.title = title.trim();
    if (leadId) task.lead = leadId;
    if (assignedToId) task.assignedTo = assignedToId;
    if (dueDate) task.dueDate = new Date(dueDate);
    if (priority) task.priority = priority;
    if (description !== undefined) task.description = description.trim();

    await task.save();

    const populated = await Task.findById(task._id)
      .select('title lead assignedTo dueDate status priority description createdAt updatedAt')
      .populate('lead', 'name email status company')
      .populate('assignedTo', 'name email avatar role')
      .lean();

    // Log notification
    await logNotification({
      title: 'Task Updated',
      message: `Task "${task.title}" details were modified.`,
      type: 'task',
      action: 'update',
      entityType: 'Task',
      entityId: task._id,
      recipient: task.assignedTo,
      actor: req.user?.id || null
    });

    return ApiResponse.success(res, formatTask(populated), 'Task updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update task status specifically (enforces Assignee or Admin check)
 * PATCH /api/tasks/:id/status
 */
const updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return next(
        new AppError('Please provide a status value', HTTP_STATUS.BAD_REQUEST, 'MISSING_STATUS')
      );
    }

    const task = await Task.findById(id);
    if (!task) {
      return next(
        new AppError('Task not found', HTTP_STATUS.NOT_FOUND, 'TASK_NOT_FOUND')
      );
    }

    // Assignee-only check: only assigned user or Admin may update status
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user.id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isAssigned && !isAdmin) {
      return next(
        new AppError(
          'Permission denied: Only the assigned user or an Admin may update the status of this task.',
          HTTP_STATUS.FORBIDDEN,
          'TASK_STATUS_UPDATE_FORBIDDEN'
        )
      );
    }

    task.status = status;
    await task.save();

    const populated = await Task.findById(task._id)
      .select('title lead assignedTo dueDate status priority description createdAt updatedAt')
      .populate('lead', 'name email status company')
      .populate('assignedTo', 'name email avatar role')
      .lean();

    // Log notification
    await logNotification({
      title: `Task Status Updated to ${status}`,
      message: `Task "${task.title}" status changed to ${status}.`,
      type: 'status',
      action: 'status_change',
      entityType: 'Task',
      entityId: task._id,
      recipient: task.assignedTo,
      actor: req.user?.id || null
    });

    return ApiResponse.success(res, formatTask(populated), 'Task status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a task
 * DELETE /api/tasks/:id
 */
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return next(
        new AppError('Task not found', HTTP_STATUS.NOT_FOUND, 'TASK_NOT_FOUND')
      );
    }

    const taskTitle = task.title;
    const assignedUser = task.assignedTo;
    await Task.findByIdAndDelete(id);

    // Log notification
    await logNotification({
      title: 'Task Deleted',
      message: `Task "${taskTitle}" was removed.`,
      type: 'task',
      action: 'delete',
      entityType: 'Task',
      entityId: id,
      recipient: assignedUser,
      actor: req.user?.id || null
    });

    return ApiResponse.success(res, { id }, 'Task deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
};
