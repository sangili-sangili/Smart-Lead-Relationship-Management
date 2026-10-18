const Company = require('../models/Company');
const Lead = require('../models/Lead');
const ApiResponse = require('../utils/apiResponse');
const AppError = require('../utils/appError');
const HTTP_STATUS = require('../constants/httpStatusCodes');
const { logNotification } = require('../utils/notificationService');
const { escapeRegex, sanitizePagination } = require('../utils/queryHelper');

/**
 * Get all companies with search, industry filter, and pagination
 * GET /api/companies
 */
const getCompanies = async (req, res, next) => {
  try {
    const { search = '', industry = '', page = 1, limit = 10 } = req.query;

    const query = {};

    if (search && search.trim()) {
      const q = escapeRegex(search);
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
        { industry: { $regex: q, $options: 'i' } }
      ];
    }

    if (industry && industry !== 'All' && industry !== 'All Industries') {
      const cleanIndustry = escapeRegex(industry);
      query.industry = { $regex: `^${cleanIndustry}$`, $options: 'i' };
    }

    // Enforce validated bounded pagination
    const { page: pageNum, limit: limitNum, skip } = sanitizePagination(page, limit);

    const [companies, total] = await Promise.all([
      Company.find(query)
        .select('name industry location website email phone description createdAt updatedAt')
        .sort({ createdAt: -1, _id: -1 }) // Stable compound sort
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Company.countDocuments(query)
    ]);

    // Attach active lead counts for each company using covered index
    const companyIds = companies.map((c) => c._id);
    const leadCounts = companyIds.length > 0
      ? await Lead.aggregate([
          { $match: { company: { $in: companyIds }, isDeleted: false } },
          { $group: { _id: '$company', count: { $sum: 1 } } }
        ])
      : [];

    const leadCountMap = {};
    leadCounts.forEach((lc) => {
      leadCountMap[lc._id.toString()] = lc.count;
    });

    const enrichedCompanies = companies.map((comp) => ({
      ...comp,
      id: comp._id,
      leadCount: leadCountMap[comp._id.toString()] || 0
    }));

    return res.status(200).json({
      success: true,
      message: 'Companies fetched successfully',
      data: enrichedCompanies,
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
 * Get single company by ID with its associated leads
 * GET /api/companies/:id
 */
const getCompanyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id)
      .select('name industry location website email phone description createdAt updatedAt')
      .lean();

    if (!company) {
      return next(
        new AppError('Company not found', HTTP_STATUS.NOT_FOUND, 'COMPANY_NOT_FOUND')
      );
    }

    // Retrieve active non-deleted leads associated with this company
    const leads = await Lead.find({ company: id, isDeleted: false })
      .select('name email phone status company assignedTo createdAt')
      .populate('assignedTo', 'name email avatar')
      .sort({ createdAt: -1, _id: -1 })
      .lean();

    return ApiResponse.success(
      res,
      {
        ...company,
        id: company._id,
        leadCount: leads.length,
        leads: leads.map((l) => ({ ...l, id: l._id }))
      },
      'Company details retrieved'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new company
 * POST /api/companies
 */
const createCompany = async (req, res, next) => {
  try {
    const { name, industry, location, website, email, phone, description } = req.body;

    if (!name || !name.trim()) {
      return next(
        new AppError('Company name is required', HTTP_STATUS.BAD_REQUEST, 'MISSING_COMPANY_NAME')
      );
    }

    const cleanName = escapeRegex(name);
    const existing = await Company.findOne({ name: { $regex: `^${cleanName}$`, $options: 'i' } })
      .select('_id')
      .lean();

    if (existing) {
      return next(
        new AppError(
          'A company with this name already exists',
          HTTP_STATUS.CONFLICT,
          'COMPANY_ALREADY_EXISTS'
        )
      );
    }

    const company = await Company.create({
      name: name.trim(),
      industry: industry ? industry.trim() : 'Technology',
      location: location ? location.trim() : '',
      website: website ? website.trim() : '',
      email: email ? email.trim().toLowerCase() : '',
      phone: phone ? phone.trim() : '',
      description: description ? description.trim() : ''
    });

    // Log notification
    await logNotification({
      title: 'New Company Added',
      message: `Company "${company.name}" has been registered in the system.`,
      type: 'company',
      action: 'create',
      entityType: 'Company',
      entityId: company._id,
      actor: req.user?.id || null
    });

    return ApiResponse.created(
      res,
      {
        ...company.toJSON(),
        id: company._id,
        leadCount: 0
      },
      'Company created successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update company
 * PUT /api/companies/:id
 */
const updateCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, industry, location, website, email, phone, description } = req.body;

    const company = await Company.findById(id);
    if (!company) {
      return next(
        new AppError('Company not found', HTTP_STATUS.NOT_FOUND, 'COMPANY_NOT_FOUND')
      );
    }

    if (name && name.trim().toLowerCase() !== company.name.toLowerCase()) {
      const cleanName = escapeRegex(name);
      const duplicate = await Company.findOne({
        name: { $regex: `^${cleanName}$`, $options: 'i' },
        _id: { $ne: id }
      })
        .select('_id')
        .lean();
      if (duplicate) {
        return next(
          new AppError('Company name is already taken', HTTP_STATUS.CONFLICT, 'DUPLICATE_COMPANY_NAME')
        );
      }
      company.name = name.trim();
    }

    if (industry !== undefined) company.industry = industry.trim();
    if (location !== undefined) company.location = location.trim();
    if (website !== undefined) company.website = website.trim();
    if (email !== undefined) company.email = email.trim().toLowerCase();
    if (phone !== undefined) company.phone = phone.trim();
    if (description !== undefined) company.description = description.trim();

    await company.save();

    // Log notification
    await logNotification({
      title: 'Company Updated',
      message: `Details for company "${company.name}" have been modified.`,
      type: 'company',
      action: 'update',
      entityType: 'Company',
      entityId: company._id,
      actor: req.user?.id || null
    });

    return ApiResponse.success(
      res,
      {
        ...company.toJSON(),
        id: company._id
      },
      'Company updated successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete company
 * DELETE /api/companies/:id
 */
const deleteCompany = async (req, res, next) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id);
    if (!company) {
      return next(
        new AppError('Company not found', HTTP_STATUS.NOT_FOUND, 'COMPANY_NOT_FOUND')
      );
    }

    // Check if there are active leads associated
    const activeLeadCount = await Lead.countDocuments({ company: id, isDeleted: false });
    if (activeLeadCount > 0) {
      return next(
        new AppError(
          `Cannot delete company. There are ${activeLeadCount} active leads associated with this company.`,
          HTTP_STATUS.BAD_REQUEST,
          'COMPANY_HAS_ACTIVE_LEADS'
        )
      );
    }

    const companyName = company.name;
    await Company.findByIdAndDelete(id);

    // Log notification
    await logNotification({
      title: 'Company Deleted',
      message: `Company "${companyName}" was deleted from the CRM.`,
      type: 'company',
      action: 'delete',
      entityType: 'Company',
      entityId: id,
      actor: req.user?.id || null
    });

    return ApiResponse.success(res, { id }, 'Company deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany
};
