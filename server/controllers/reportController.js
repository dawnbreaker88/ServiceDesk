import { Ticket } from '../models/Ticket.js';
import { Asset } from '../models/Asset.js';
import { User } from '../models/User.js';
import { WorkLog } from '../models/WorkLog.js';

// @desc    Role-specific dashboard statistics
// @route   GET /api/reports/dashboard
// @access  Private
export const getDashboardSummary = async (req, res) => {
  const role = req.user.role;
  const userId = req.user._id;

  const now = new Date();

  if (role === 'EMPLOYEE') {
    const [myOpenTickets, myResolvedTickets, myTotalTickets, myAssets] = await Promise.all([
      Ticket.countDocuments({ requester: userId, status: { $in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'REOPENED', 'ESCALATED'] } }),
      Ticket.countDocuments({ requester: userId, status: { $in: ['RESOLVED', 'CLOSED'] } }),
      Ticket.countDocuments({ requester: userId }),
      Asset.find({ assignedUser: userId, status: 'ASSIGNED' }).select('assetTag name category status'),
    ]);

    const recentTickets = await Ticket.find({ requester: userId })
      .populate('category', 'name icon')
      .sort({ updatedAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      role: 'EMPLOYEE',
      metrics: {
        openTickets: myOpenTickets,
        resolvedTickets: myResolvedTickets,
        totalTickets: myTotalTickets,
        assignedAssetsCount: myAssets.length,
      },
      assignedAssets: myAssets,
      recentTickets,
    });
  }

  if (role === 'TECHNICIAN') {
    const [assignedToMe, inProgress, resolvedByMe, highPriority, slaAtRisk] = await Promise.all([
      Ticket.countDocuments({ assignee: userId, status: { $in: ['ASSIGNED', 'IN_PROGRESS', 'REOPENED'] } }),
      Ticket.countDocuments({ assignee: userId, status: 'IN_PROGRESS' }),
      Ticket.countDocuments({ assignee: userId, status: { $in: ['RESOLVED', 'CLOSED'] } }),
      Ticket.countDocuments({ assignee: userId, priority: { $in: ['HIGH', 'CRITICAL'] }, status: { $nin: ['RESOLVED', 'CLOSED'] } }),
      Ticket.countDocuments({
        assignee: userId,
        status: { $nin: ['RESOLVED', 'CLOSED'] },
        $or: [
          { slaStatus: { $in: ['APPROACHING_DEADLINE', 'BREACHED'] } },
          { resolutionDeadline: { $lte: new Date(now.getTime() + 60 * 60 * 1000) } },
        ],
      }),
    ]);

    const activeTickets = await Ticket.find({
      assignee: userId,
      status: { $in: ['ASSIGNED', 'IN_PROGRESS', 'REOPENED', 'ESCALATED'] },
    })
      .populate('requester', 'name email avatar')
      .populate('category', 'name icon')
      .sort({ priority: 1, resolutionDeadline: 1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      role: 'TECHNICIAN',
      metrics: {
        assignedTickets: assignedToMe,
        inProgress,
        resolvedTickets: resolvedByMe,
        highPriority,
        slaAtRisk,
      },
      activeTickets,
    });
  }

  if (role === 'ASSET_MANAGER') {
    const [totalAssets, assigned, inStock, inRepair, retired] = await Promise.all([
      Asset.countDocuments(),
      Asset.countDocuments({ status: 'ASSIGNED' }),
      Asset.countDocuments({ status: 'IN_STOCK' }),
      Asset.countDocuments({ status: 'IN_REPAIR' }),
      Asset.countDocuments({ status: 'RETIRED' }),
    ]);

    const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const expiringWarranties = await Asset.find({
      warrantyExpiry: { $gte: now, $lte: ninetyDays },
      status: { $ne: 'RETIRED' },
    }).populate('assignedUser', 'name email');

    return res.status(200).json({
      success: true,
      role: 'ASSET_MANAGER',
      metrics: {
        totalAssets,
        assigned,
        inStock,
        inRepair,
        retired,
        warrantyExpiringCount: expiringWarranties.length,
      },
      expiringWarranties,
    });
  }

  // IT Manager & Admin Summary
  const [totalTickets, openTickets, inProgressTickets, resolvedTickets, closedTickets, escalatedTickets, totalAssets, slaBreachedCount] =
    await Promise.all([
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: 'OPEN' }),
      Ticket.countDocuments({ status: 'IN_PROGRESS' }),
      Ticket.countDocuments({ status: 'RESOLVED' }),
      Ticket.countDocuments({ status: 'CLOSED' }),
      Ticket.countDocuments({ status: 'ESCALATED' }),
      Asset.countDocuments(),
      Ticket.countDocuments({ slaStatus: 'BREACHED' }),
    ]);

  const slaCompliance = totalTickets > 0 ? Math.round(((totalTickets - slaBreachedCount) / totalTickets) * 100) : 100;

  const priorityBreakdown = await Ticket.aggregate([
    { $group: { _id: '$priority', count: { $sum: 1 } } },
  ]);

  const recentCritical = await Ticket.find({ priority: { $in: ['HIGH', 'CRITICAL'] }, status: { $nin: ['RESOLVED', 'CLOSED'] } })
    .populate('requester', 'name email')
    .populate('assignee', 'name email')
    .populate('category', 'name icon')
    .sort({ createdAt: -1 })
    .limit(5);

  return res.status(200).json({
    success: true,
    role: req.user.role,
    metrics: {
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      escalatedTickets,
      slaCompliancePercent: slaCompliance,
      slaBreaches: slaBreachedCount,
      totalAssets,
    },
    priorityBreakdown,
    recentCritical,
  });
};

// @desc    Detailed Ticket Metrics & Category Breakdown
// @route   GET /api/reports/tickets
// @access  Private (Manager or Admin)
export const getTicketReports = async (req, res) => {
  const statusCounts = await Ticket.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const categoryCounts = await Ticket.aggregate([
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryInfo',
      },
    },
    { $unwind: '$categoryInfo' },
    { $group: { _id: '$categoryInfo.name', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const sourceCounts = await Ticket.aggregate([
    { $group: { _id: '$source', count: { $sum: 1 } } },
  ]);

  res.status(200).json({
    success: true,
    statusCounts,
    categoryCounts,
    sourceCounts,
  });
};

// @desc    SLA Compliance and Breach Reports
// @route   GET /api/reports/sla
// @access  Private (Manager or Admin)
export const getSlaReports = async (req, res) => {
  const [total, normal, warning, breached, escalated] = await Promise.all([
    Ticket.countDocuments(),
    Ticket.countDocuments({ slaStatus: 'NORMAL' }),
    Ticket.countDocuments({ slaStatus: 'APPROACHING_DEADLINE' }),
    Ticket.countDocuments({ slaStatus: 'BREACHED' }),
    Ticket.countDocuments({ slaStatus: 'ESCALATED' }),
  ]);

  const breachedTickets = await Ticket.find({ slaStatus: 'BREACHED' })
    .populate('requester', 'name email')
    .populate('assignee', 'name email')
    .populate('category', 'name')
    .sort({ resolutionDeadline: 1 });

  res.status(200).json({
    success: true,
    complianceRate: total > 0 ? Math.round(((total - (breached + escalated)) / total) * 100) : 100,
    breakdown: { total, normal, warning, breached, escalated },
    breachedTickets,
  });
};

// @desc    Technician Workload and Performance Reports
// @route   GET /api/reports/technicians
// @access  Private (Manager or Admin)
export const getTechnicianReports = async (req, res) => {
  const technicians = await User.find({ role: 'TECHNICIAN', status: 'ACTIVE' }).select('name email avatar department');

  const report = await Promise.all(
    technicians.map(async (tech) => {
      const [assignedCount, inProgressCount, resolvedCount] = await Promise.all([
        Ticket.countDocuments({ assignee: tech._id, status: 'ASSIGNED' }),
        Ticket.countDocuments({ assignee: tech._id, status: 'IN_PROGRESS' }),
        Ticket.countDocuments({ assignee: tech._id, status: { $in: ['RESOLVED', 'CLOSED'] } }),
      ]);

      const logs = await WorkLog.find({ technician: tech._id });
      const totalMinutesWorked = logs.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);

      return {
        technician: tech,
        workload: {
          assigned: assignedCount,
          inProgress: inProgressCount,
          activeTotal: assignedCount + inProgressCount,
          resolved: resolvedCount,
          totalMinutesLogged: totalMinutesWorked,
          totalHoursLogged: (totalMinutesWorked / 60).toFixed(1),
        },
      };
    })
  );

  res.status(200).json({
    success: true,
    count: report.length,
    data: report,
  });
};

// @desc    Asset Inventory Breakdown & Warranty Reports
// @route   GET /api/reports/assets
// @access  Private (Asset Manager or Admin or Manager)
export const getAssetReports = async (req, res) => {
  const [total, assigned, inStock, inRepair, retired] = await Promise.all([
    Asset.countDocuments(),
    Asset.countDocuments({ status: 'ASSIGNED' }),
    Asset.countDocuments({ status: 'IN_STOCK' }),
    Asset.countDocuments({ status: 'IN_REPAIR' }),
    Asset.countDocuments({ status: 'RETIRED' }),
  ]);

  const categoryBreakdown = await Asset.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 }, totalValue: { $sum: '$cost' } } },
    { $sort: { count: -1 } },
  ]);

  res.status(200).json({
    success: true,
    summary: { total, assigned, inStock, inRepair, retired },
    categoryBreakdown,
  });
};
