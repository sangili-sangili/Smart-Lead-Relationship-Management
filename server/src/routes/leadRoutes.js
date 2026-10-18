const express = require('express');
const ApiResponse = require('../utils/apiResponse');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.get('/', (req, res) => {
  return ApiResponse.paginated(res, [], { total: 0, page: 1, limit: 10 }, 'Leads route configured');
});

module.exports = router;
