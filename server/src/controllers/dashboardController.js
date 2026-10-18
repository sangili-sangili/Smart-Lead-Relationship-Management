const Lead = require('../models/Lead');
const Task = require('../models/Task');
const Company = require('../models/Company');
const ApiResponse = require('../utils/apiResponse');

/**
 * Get aggregated metrics for CRM Dashboard using consolidated MongoDB aggregation pipelines
 * GET /api/dashboard/metrics
 */
const getDashboardMetrics = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Run parallel consolidated aggregation pipelines (reduced from 9 queries to 5)
    const [
      leadStatsResult,
      taskStatsResult,
      totalCompanies,
      upcomingTasks,
      recentLeads
    ] = await Promise.all([
      // 1. Single-pass Lead Facet Aggregation (total leads, qualified leads, and status distribution)
      Lead.aggregate([
        { $match: { isDeleted: false } },
        {
          $facet: {
            total: [{ $count: 'count' }],
            qualified: [
              { $match: { status: 'Qualified' } },
              { $count: 'count' }
            ],
            statusDistribution: [
              {
                $group: {
                  _id: '$status',
                  count: { $sum: 1 }
                }
              }
            ]
          }
        }
      ]),

      // 2. Single-pass Task Facet Aggregation (total tasks, tasks due today, and completed tasks)
      Task.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            dueToday: [
              { $match: { dueDate: { $gte: todayStart, $lte: todayEnd } } },
              { $count: 'count' }
            ],
            completed: [
              { $match: { status: 'Completed' } },
              { $count: 'count' }
            ]
          }
        }
      ]),

      // 3. Fast O(1) Company Document Count
      Company.estimatedDocumentCount(),

      // 4. Upcoming non-completed tasks (lean + projected fields)
      Task.find({ status: { $ne: 'Completed' } })
        .select('title lead assignedTo dueDate status priority')
        .populate('lead', 'name company')
        .populate('assignedTo', 'name avatar')
        .sort({ dueDate: 1, _id: -1 })
        .limit(5)
        .lean(),

      // 5. Recent active leads (lean + projected fields)
      Lead.find({ isDeleted: false })
        .select('name company assignedTo createdAt')
        .populate('company', 'name')
        .populate('assignedTo', 'name')
        .sort({ createdAt: -1, _id: -1 })
        .limit(5)
        .lean()
    ]);

    // Extract consolidated lead metrics
    const leadFacet = leadStatsResult[0] || {};
    const totalLeads = leadFacet.total?.[0]?.count || 0;
    const qualifiedLeads = leadFacet.qualified?.[0]?.count || 0;
    const statusDistributionRaw = leadFacet.statusDistribution || [];

    // Extract consolidated task metrics
    const taskFacet = taskStatsResult[0] || {};
    const totalTasks = taskFacet.total?.[0]?.count || 0;
    const tasksDueToday = taskFacet.dueToday?.[0]?.count || 0;
    const completedTasks = taskFacet.completed?.[0]?.count || 0;

    // Build structured status map matching CRM UI design
    const statusMap = {
      New: 0,
      Contacted: 0,
      Qualified: 0,
      Lost: 0,
      Converted: 0
    };

    statusDistributionRaw.forEach((item) => {
      if (item._id && statusMap[item._id] !== undefined) {
        statusMap[item._id] = item.count;
      }
    });

    const statusChartData = Object.entries(statusMap).map(([status, count]) => ({
      status,
      count,
      percentage: totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0
    }));

    const metrics = {
      summary: {
        totalLeads,
        qualifiedLeads,
        tasksDueToday,
        completedTasks,
        totalTasks,
        totalCompanies
      },
      leadStatusDistribution: statusChartData,
      statusCounts: statusMap,
      upcomingTasks: upcomingTasks.map((t) => ({
        ...t,
        id: t._id,
        leadName: t.lead?.name || 'N/A',
        assignedToName: t.assignedTo?.name || 'Unassigned'
      })),
      recentLeads: recentLeads.map((l) => ({
        ...l,
        id: l._id,
        companyName: l.company?.name || 'N/A',
        assignedToName: l.assignedTo?.name || 'Unassigned'
      }))
    };

    return ApiResponse.success(res, metrics, 'Dashboard metrics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardMetrics
};
