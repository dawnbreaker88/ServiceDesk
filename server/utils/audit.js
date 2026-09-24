import { AuditLog } from '../models/AuditLog.js';

/**
 * Utility helper to record an audit log event
 */
export const recordAuditLog = async ({
  actor = null,
  actorName = 'System',
  action,
  entity,
  entityId,
  previousState = null,
  newState = null,
  details = '',
}) => {
  try {
    const log = await AuditLog.create({
      actor: actor?._id || actor || null,
      actorName: actor?.name || actorName || 'System',
      action,
      entity,
      entityId,
      previousState,
      newState,
      details,
    });
    return log;
  } catch (error) {
    console.error('[AuditLog Error] Failed to write audit entry:', error.message);
    return null;
  }
};
