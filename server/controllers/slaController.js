import { SlaPolicy } from '../models/SlaPolicy.js';
import { recordAuditLog } from '../utils/audit.js';

// @desc    Get all SLA policies
// @route   GET /api/sla
// @access  Private
export const getSlaPolicies = async (req, res) => {
  const policies = await SlaPolicy.find().sort({ responseTimeMinutes: 1 });
  res.status(200).json({ success: true, count: policies.length, data: policies });
};

// @desc    Get SLA policy by ID
// @route   GET /api/sla/:id
// @access  Private
export const getSlaPolicyById = async (req, res) => {
  const policy = await SlaPolicy.findById(req.params.id);
  if (!policy) {
    return res.status(404).json({ success: false, message: 'SLA policy not found' });
  }
  res.status(200).json({ success: true, data: policy });
};

// @desc    Create SLA policy
// @route   POST /api/sla
// @access  Private (Admin or Manager)
export const createSlaPolicy = async (req, res) => {
  const { name, priority, responseTimeMinutes, resolutionTimeMinutes, warningThresholdPercent, description } = req.body;

  if (!name || !priority || !responseTimeMinutes || !resolutionTimeMinutes) {
    return res.status(400).json({
      success: false,
      message: 'Name, priority, responseTimeMinutes, and resolutionTimeMinutes are required.',
    });
  }

  const policy = await SlaPolicy.create({
    name,
    priority,
    responseTimeMinutes,
    resolutionTimeMinutes,
    warningThresholdPercent: warningThresholdPercent || 75,
    description: description || '',
  });

  await recordAuditLog({
    actor: req.user,
    action: 'SLA_POLICY_CREATED',
    entity: 'SlaPolicy',
    entityId: policy._id,
    details: `SLA policy for ${priority} created.`,
  });

  res.status(201).json({
    success: true,
    message: 'SLA policy created successfully',
    data: policy,
  });
};

// @desc    Update SLA policy
// @route   PATCH /api/sla/:id
// @access  Private (Admin or Manager)
export const updateSlaPolicy = async (req, res) => {
  const policy = await SlaPolicy.findById(req.params.id);
  if (!policy) {
    return res.status(404).json({ success: false, message: 'SLA policy not found' });
  }

  const { name, responseTimeMinutes, resolutionTimeMinutes, warningThresholdPercent, description, active } = req.body;

  if (name) policy.name = name;
  if (responseTimeMinutes) policy.responseTimeMinutes = responseTimeMinutes;
  if (resolutionTimeMinutes) policy.resolutionTimeMinutes = resolutionTimeMinutes;
  if (warningThresholdPercent) policy.warningThresholdPercent = warningThresholdPercent;
  if (description !== undefined) policy.description = description;
  if (active !== undefined) policy.active = active;

  await policy.save();

  await recordAuditLog({
    actor: req.user,
    action: 'SLA_POLICY_UPDATED',
    entity: 'SlaPolicy',
    entityId: policy._id,
    details: `SLA policy ${policy.name} updated.`,
  });

  res.status(200).json({
    success: true,
    message: 'SLA policy updated successfully',
    data: policy,
  });
};

// @desc    Delete SLA policy
// @route   DELETE /api/sla/:id
// @access  Private (Admin)
export const deleteSlaPolicy = async (req, res) => {
  const policy = await SlaPolicy.findById(req.params.id);
  if (!policy) {
    return res.status(404).json({ success: false, message: 'SLA policy not found' });
  }

  policy.active = false;
  await policy.save();

  res.status(200).json({
    success: true,
    message: 'SLA policy deactivated successfully',
  });
};
