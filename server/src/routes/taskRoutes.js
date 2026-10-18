const express = require('express');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
} = require('../controllers/taskController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', authenticate, createTask);
router.put('/:id', authenticate, updateTask);
router.patch('/:id/status', authenticate, updateTaskStatus);
router.delete('/:id', authenticate, deleteTask);

module.exports = router;
