const express = require('express');
const {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  restoreLead
} = require('../controllers/leadController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getLeads);
router.get('/:id', getLeadById);
router.post('/', authenticate, createLead);
router.put('/:id', authenticate, updateLead);
router.delete('/:id', authenticate, deleteLead);
router.post('/:id/restore', authenticate, restoreLead);

module.exports = router;
