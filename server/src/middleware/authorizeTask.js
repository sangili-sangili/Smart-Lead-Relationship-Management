const AppError = require('../utils/appError');
const HTTP_STATUS = require('../constants/httpStatusCodes');

/**
 * Task Status Authorization Middleware:
 * Enforces the strict rule that ONLY the user assigned to a task may update its status.
 * Expects req.user (from authMiddleware) and a loader or model to verify task assignee.
 */
const authorizeTaskStatusUpdate = (taskModel) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      const currentUserId = req.user?.id || req.user?._id;

      if (!taskModel) {
        // If taskModel is not yet injected or bound, proceed to controller-level check
        return next();
      }

      const task = await taskModel.findById(id);
      if (!task) {
        return next(
          new AppError('Task not found.', HTTP_STATUS.NOT_FOUND, 'TASK_NOT_FOUND')
        );
      }

      const assignedUserId = task.assignedTo?.toString();
      if (!assignedUserId || assignedUserId !== currentUserId?.toString()) {
        return next(
          new AppError(
            'Forbidden: Only the user assigned to this task is permitted to update its status.',
            HTTP_STATUS.FORBIDDEN,
            'FORBIDDEN'
          )
        );
      }

      // Attach task to request to prevent duplicate database lookups in controller
      req.targetTask = task;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  authorizeTaskStatusUpdate
};
