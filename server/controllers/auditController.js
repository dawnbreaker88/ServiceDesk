import { AuditLog } from '../models/AuditLog.js';

// @desc    Get audit trail with search and filtering
// @route   GET /api/audit
// @access  Private (Manager or Admin)
export const getAuditLogs = async (req, res) => {
  const { page = 1, limit = 30, entity, entityId, action, search } = req.query;

  const query = {};
  if (entity) query.entity = entity;
  if (entityId) query.entityId = entityId;
  if (action) query.action = action;

  if (search) {
    query.$or = [
      { actorName: { $regex: search, $options: 'i' } },
      { details: { $regex: search, $options: 'i' } },
      { action: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const total = await AuditLog.countDocuments(query);
  const logs = await AuditLog.find(query)
    .populate('actor', 'name email role')
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    count: logs.length,
    data: logs,
  });
};
