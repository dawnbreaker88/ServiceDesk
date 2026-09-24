import { SlaPolicy } from '../models/SlaPolicy.js';

/**
 * Calculates response and resolution deadlines for a given ticket priority
 * @param {string} priority 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
 * @param {Date} startTime (optional, defaults to now)
 */
export const calculateSlaDeadlines = async (priority = 'MEDIUM', startTime = new Date()) => {
  let policy = await SlaPolicy.findOne({ priority, active: true });

  // Fallbacks if policy not yet defined in database
  const defaults = {
    CRITICAL: { responseTimeMinutes: 15, resolutionTimeMinutes: 120 },
    HIGH: { responseTimeMinutes: 30, resolutionTimeMinutes: 240 },
    MEDIUM: { responseTimeMinutes: 120, resolutionTimeMinutes: 480 },
    LOW: { responseTimeMinutes: 480, resolutionTimeMinutes: 1440 },
  };

  const times = policy || defaults[priority] || defaults.MEDIUM;

  const responseDeadline = new Date(startTime.getTime() + times.responseTimeMinutes * 60 * 1000);
  const resolutionDeadline = new Date(startTime.getTime() + times.resolutionTimeMinutes * 60 * 1000);

  return {
    slaPolicyId: policy?._id || null,
    responseDeadline,
    resolutionDeadline,
  };
};
