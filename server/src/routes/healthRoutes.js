const express = require('express');
const ApiResponse = require('../utils/apiResponse');

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Health check & system status
 * @access  Public
 */
router.get('/', (req, res) => {
  return ApiResponse.success(
    res,
    {
      status: 'healthy',
      service: 'LeadFlow CRM API',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    },
    'LeadFlow CRM API is operational'
  );
});

module.exports = router;
