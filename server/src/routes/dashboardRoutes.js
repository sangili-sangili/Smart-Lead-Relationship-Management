const express = require('express');
const ApiResponse = require('../utils/apiResponse');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/stats', (req, res) => {
  return ApiResponse.success(res, { totalLeads: 0, qualifiedLeads: 0, tasksDueToday: 0, completedTasks: 0 }, 'Dashboard stats route configured');
});

module.exports = router;
