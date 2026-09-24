import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { emitEvent } from '../socket.js';

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
    const doc = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      relatedEntity,
      relatedId,
      isRead: false,
    });

    emitEvent('notification:new', doc, `user:${recipientId}`);
    return doc;
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

    const docs = await Notification.insertMany(notifications);
    emitEvent('notification:role', { role, title, message, relatedEntity, relatedId }, `role:${role}`);
    return docs;
  } catch (error) {
    console.error('[Notification Error] Failed to broadcast notification:', error.message);
    return [];
  }
};
