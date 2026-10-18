const express = require('express');
const { getDashboardMetrics } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/metrics', getDashboardMetrics);
router.get('/', getDashboardMetrics);

module.exports = router;
