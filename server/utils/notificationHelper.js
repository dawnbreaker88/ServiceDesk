import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';

/**
 * Creates a notification for a single recipient
 */
export const createNotification = async ({
  recipientId,
  type,
  title,
  message,
  relatedEntity = 'Ticket',
  relatedId = null,
}) => {
  try {
    if (!recipientId) return null;
    return await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      relatedEntity,
      relatedId,
      isRead: false,
    });
  } catch (error) {
    console.error('[Notification Error] Failed to create notification:', error.message);
    return null;
  }
};

/**
 * Creates notifications for all users with a specific role (e.g. 'MANAGER' or 'ADMIN')
 */
export const notifyRoleUsers = async ({
  role,
  type,
  title,
  message,
  relatedEntity = 'Ticket',
  relatedId = null,
  excludeUserId = null,
}) => {
  try {
    const query = { role, status: 'ACTIVE' };
    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }
    const users = await User.find(query).select('_id');
    if (!users.length) return [];

    const notifications = users.map((u) => ({
      recipient: u._id,
      type,
      title,
      message,
      relatedEntity,
      relatedId,
      isRead: false,
    }));

    return await Notification.insertMany(notifications);
  } catch (error) {
    console.error('[Notification Error] Failed to broadcast notification:', error.message);
    return [];
  }
};
