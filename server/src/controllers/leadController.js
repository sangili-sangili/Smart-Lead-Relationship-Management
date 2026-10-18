const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const Company = require('../models/Company');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const AppError = require('../utils/appError');
const HTTP_STATUS = require('../constants/httpStatusCodes');
const { logNotification } = require('../utils/notificationService');
const { escapeRegex, sanitizePagination } = require('../utils/queryHelper');

/**
 * Helper to resolve company identifier (ObjectId or Company Name string)
 */
const resolveCompanyId = async (companyInput) => {
  if (!companyInput) return null;
  if (mongoose.Types.ObjectId.isValid(companyInput)) {
    return companyInput;
  }
  const cleanName = escapeRegex(companyInput);
  let company = await Company.findOne({ name: { $regex: `^${cleanName}$`, $options: 'i' } })
    .select('_id')
    .lean();
  if (!company) {
    company = await Company.create({ name: companyInput.trim() });
  }
  return company._id;
};

/**
 * Helper to resolve user identifier (ObjectId or User Name string)
 */
const resolveUserId = async (userInput) => {
  if (!userInput) return null;
  if (mongoose.Types.ObjectId.isValid(userInput)) {
    return userInput;
  }
  const cleanName = escapeRegex(userInput);
  const user = await User.findOne({ name: { $regex: `^${cleanName}$`, $options: 'i' } })
    .select('_id')
    .lean();
  return user ? user._id : null;
};

/**
 * Format lead object for both frontend UI compatibility and standard REST specs
 */
const formatLead = (leadDoc) => {
  const plain = leadDoc.toObject ? leadDoc.toObject() : leadDoc;
  return {
    ...plain,
    id: plain._id,
    company: plain.company?.name || plain.company || '',
    companyId: plain.company?._id || plain.company,
    assignedTo: plain.assignedTo?.name || plain.assignedTo || 'Unassigned',
    assignedToId: plain.assignedTo?._id || plain.assignedTo || null,
    assignedToAvatar: plain.assignedTo?.avatar || ''
  };
};

/**
 * Get all active leads with filtering, search, and pagination
 * GET /api/leads
 */
const getLeads = async (req, res, next) => {
  try {
    const {
      search = '',
      status = '',
      user = '',
      company = '',
      page = 1,
      limit = 10,
      includeDeleted = false
    } = req.query;

    const query = {};

    // Soft delete filter
    if (includeDeleted === 'true' || includeDeleted === true) {
      query.includeDeleted = true; // Handled by pre-find hook
    } else {
      query.isDeleted = false;
    }

    // Status filter
    if (status && status !== 'All Status' && status !== 'All') {
      const cleanStatus = escapeRegex(status);
      query.status = { $regex: `^${cleanStatus}$`, $options: 'i' };
    }

    // Assigned User filter
    if (user && user !== 'All Users' && user !== 'All') {
      if (mongoose.Types.ObjectId.isValid(user)) {
        query.assignedTo = user;
      } else {
        const cleanUser = escapeRegex(user);
        const foundUser = await User.findOne({ name: { $regex: `^${cleanUser}$`, $options: 'i' } })
          .select('_id')
          .lean();
        if (foundUser) {
          query.assignedTo = foundUser._id;
        } else {
          query.assignedTo = new mongoose.Types.ObjectId();
        }
      }
    }

    // Company filter
    if (company && company !== 'All Companies' && company !== 'All') {
      if (mongoose.Types.ObjectId.isValid(company)) {
        query.company = company;
      } else {
        const cleanCompany = escapeRegex(company);
        const foundCompany = await Company.findOne({ name: { $regex: `^${cleanCompany}$`, $options: 'i' } })
          .select('_id')
          .lean();
        if (foundCompany) {
          query.company = foundCompany._id;
        } else {
          query.company = new mongoose.Types.ObjectId();
        }
      }
    }

    // Search query across name, email, phone, and company name
    if (search && search.trim()) {
      const q = escapeRegex(search);
      const searchRegex = { $regex: q, $options: 'i' };

      // Look for matching companies efficiently with projection
      const matchingCompanies = await Company.find({ name: searchRegex })
        .select('_id')
        .lean();
      const matchingCompanyIds = matchingCompanies.map((c) => c._id);

      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { company: { $in: matchingCompanyIds } }
      ];
    }

    // Enforce validated bounded pagination
    const { page: pageNum, limit: limitNum, skip } = sanitizePagination(page, limit);

    // Parallel execution with .lean() and precise field projection
    const [leads, total] = await Promise.all([
      Lead.find(query)
        .select('name email phone status company assignedTo isDeleted createdAt updatedAt')
        .populate('company', 'name industry location')
        .populate('assignedTo', 'name email avatar role')
        .sort({ createdAt: -1, _id: -1 }) // Stable compound sort
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Lead.countDocuments(query)
    ]);

    const formattedLeads = leads.map(formatLead);

    return res.status(200).json({
      success: true,
      message: 'Leads fetched successfully',
      data: formattedLeads,
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
 * Get single lead by ID
 * GET /api/leads/:id
 */
const getLeadById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id)
      .select('name email phone status company assignedTo isDeleted createdAt updatedAt')
      .populate('company', 'name industry location website email phone description')
      .populate('assignedTo', 'name email avatar role')
      .lean();

    if (!lead) {
      return next(
        new AppError('Lead not found or has been deleted', HTTP_STATUS.NOT_FOUND, 'LEAD_NOT_FOUND')
      );
    }

    return ApiResponse.success(res, formatLead(lead), 'Lead retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new lead
 * POST /api/leads
 */
const createLead = async (req, res, next) => {
  try {
    const { name, email, phone, status, company, assignedTo } = req.body;

    if (!name || !email || !company) {
      return next(
        new AppError(
          'Please provide lead name, email and company',
          HTTP_STATUS.BAD_REQUEST,
          'MISSING_REQUIRED_FIELDS'
        )
      );
    }

    // Resolve company and user concurrently
    const [companyId, assignedToId] = await Promise.all([
      resolveCompanyId(company),
      assignedTo ? resolveUserId(assignedTo) : Promise.resolve(null)
    ]);

    if (!companyId) {
      return next(
        new AppError('Invalid company specified', HTTP_STATUS.BAD_REQUEST, 'INVALID_COMPANY')
      );
    }

    const lead = await Lead.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      status: status || 'New',
      company: companyId,
      assignedTo: assignedToId
    });

    const populated = await Lead.findById(lead._id)
      .select('name email phone status company assignedTo isDeleted createdAt updatedAt')
      .populate('company', 'name industry location')
      .populate('assignedTo', 'name email avatar role')
      .lean();

    // Log notification
    await logNotification({
      title: 'New Lead Created',
      message: `${lead.name} has been added to ${populated.company?.name || 'CRM'}.`,
      type: 'lead',
      action: 'create',
      entityType: 'Lead',
      entityId: lead._id,
      recipient: lead.assignedTo || null,
      actor: req.user?.id || null
    });

    return ApiResponse.created(res, formatLead(populated), 'Lead created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing lead
 * PUT /api/leads/:id
 */
const updateLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, status, company, assignedTo } = req.body;

    const lead = await Lead.findById(id);
    if (!lead) {
      return next(
        new AppError('Lead not found or has been deleted', HTTP_STATUS.NOT_FOUND, 'LEAD_NOT_FOUND')
      );
    }

    const previousStatus = lead.status;
    const previousAssignedTo = lead.assignedTo?.toString();

    if (name) lead.name = name.trim();
    if (email) lead.email = email.trim().toLowerCase();
    if (phone !== undefined) lead.phone = phone.trim();
    if (status) lead.status = status;

    const [companyId, assignedToId] = await Promise.all([
      company ? resolveCompanyId(company) : Promise.resolve(undefined),
      assignedTo !== undefined ? (assignedTo ? resolveUserId(assignedTo) : null) : Promise.resolve(undefined)
    ]);

    if (companyId) lead.company = companyId;
    if (assignedTo !== undefined) lead.assignedTo = assignedToId;

    await lead.save();

    const populated = await Lead.findById(lead._id)
      .select('name email phone status company assignedTo isDeleted createdAt updatedAt')
      .populate('company', 'name industry location')
      .populate('assignedTo', 'name email avatar role')
      .lean();

    // Log notification based on what changed
    if (status && status !== previousStatus) {
      await logNotification({
        title: `Status Updated to ${status}`,
        message: `${lead.name} was marked as ${status}.`,
        type: 'status',
        action: 'status_change',
        entityType: 'Lead',
        entityId: lead._id,
        recipient: lead.assignedTo || null,
        actor: req.user?.id || null
      });
    } else if (lead.assignedTo && lead.assignedTo.toString() !== previousAssignedTo) {
      await logNotification({
        title: 'Lead Assigned',
        message: `${lead.name} has been assigned to ${populated.assignedTo?.name || 'you'}.`,
        type: 'lead',
        action: 'assign',
        entityType: 'Lead',
        entityId: lead._id,
        recipient: lead.assignedTo,
        actor: req.user?.id || null
      });
    } else {
      await logNotification({
        title: 'Lead Updated',
        message: `Details for lead ${lead.name} were updated.`,
        type: 'lead',
        action: 'update',
        entityType: 'Lead',
        entityId: lead._id,
        actor: req.user?.id || null
      });
    }

    return ApiResponse.success(res, formatLead(populated), 'Lead updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Soft delete a lead
 * DELETE /api/leads/:id
 */
const deleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id);
    if (!lead) {
      return next(
        new AppError('Lead not found or already deleted', HTTP_STATUS.NOT_FOUND, 'LEAD_NOT_FOUND')
      );
    }

    const leadName = lead.name;
    await lead.softDelete();

    // Log notification
    await logNotification({
      title: 'Lead Deleted',
      message: `Lead "${leadName}" was moved to archive (soft-deleted).`,
      type: 'lead',
      action: 'delete',
      entityType: 'Lead',
      entityId: id,
      actor: req.user?.id || null
    });

    return ApiResponse.success(
      res,
      { id, isDeleted: true, deletedAt: lead.deletedAt },
      'Lead soft-deleted successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Restore a soft-deleted lead
 * POST /api/leads/:id/restore
 */
const restoreLead = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Use includeDeleted to find soft-deleted record
    const lead = await Lead.findOne({ _id: id, includeDeleted: true });
    if (!lead) {
      return next(
        new AppError('Lead not found', HTTP_STATUS.NOT_FOUND, 'LEAD_NOT_FOUND')
      );
    }

    await lead.restore();

    const populated = await Lead.findById(lead._id)
      .select('name email phone status company assignedTo isDeleted createdAt updatedAt')
      .populate('company', 'name industry location')
      .populate('assignedTo', 'name email avatar role')
      .lean();

    // Log notification
    await logNotification({
      title: 'Lead Restored',
      message: `Lead "${lead.name}" was restored to active pipeline.`,
      type: 'lead',
      action: 'update',
      entityType: 'Lead',
      entityId: lead._id,
      actor: req.user?.id || null
    });

    return ApiResponse.success(res, formatLead(populated), 'Lead restored successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  restoreLead
};
