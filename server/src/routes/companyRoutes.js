const express = require('express');
const ApiResponse = require('../utils/apiResponse');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/', (req, res) => {
  return ApiResponse.success(res, [], 'Companies route configured');
});

module.exports = router;
