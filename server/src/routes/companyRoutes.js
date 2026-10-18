const express = require('express');
const {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany
} = require('../controllers/companyController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getCompanies);
router.get('/:id', getCompanyById);
router.post('/', authenticate, createCompany);
router.put('/:id', authenticate, updateCompany);
router.delete('/:id', authenticate, deleteCompany);

module.exports = router;
