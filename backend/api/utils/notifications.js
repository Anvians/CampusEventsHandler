import Notification from '../models/Notification.model.js';
import { io } from '../../index.js';  // Import io from index.js
import prisma from "../db/prisma.connection.js";

// Fetch enriched notification (MongoDB + Prisma for originator details)
export async function getNotificationById(id) {
  const notif = await Notification.findById(id);

  if (!notif) return null;

  const originator = notif.originator_id
    ? await prisma.user.findUnique({
        where: { id: notif.originator_id },
        select: { id: true, name: true, profile_photo: true }
      })
    : null;

  return {
    id: notif._id.toString(),
    message: notif.message,
    link: notif.link,
    type: notif.type,
    is_read: notif.is_read,
    created_at: notif.created_at,
    originator
  };
}

// Create notification and emit via socket
export const createNotification = async (
  receiver_id,
  message,
  link,
  type,
  originator_id = null
) => {
  try {
    if (receiver_id === originator_id) return null;

    const saved = await Notification.create({
      receiver_id: Number(receiver_id),
      message,
      link,
      type,
      originator_id: originator_id ? Number(originator_id) : null,
    });

    const fullNotification = await getNotificationById(saved._id);

    if (fullNotification) {
      if (io) {
        io.to(`user_${receiver_id}`).emit("notification:new", fullNotification);
        console.log(`Socket emitted to user_${receiver_id}`); // Debug log
      } else {
        console.error("Socket IO instance is undefined - Circular dependency issue suspected.");
      }
    }

    return saved._id.toString();
  } catch (err) {
    console.error("Error creating notification:", err.message);
    return null;
  }
};

// Fetch notifications for a user
export const getNotificationsForUser = async (userId, limit = 30) => {
  const notifications = await Notification.find({ receiver_id: Number(userId) })
    .sort({ created_at: -1 })
    .limit(limit);

  // Enrich all notifications with originator details
  const enriched = await Promise.all(
    notifications.map(n => getNotificationById(n._id))
  );

  return enriched;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId) => {
  await Notification.updateMany(
    { receiver_id: Number(userId), is_read: false },
    { $set: { is_read: true } }
  );
};

// Cleanup old notifications
export const deleteOldNotifications = async (daysOld = 60) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysOld);
  await Notification.deleteMany({ created_at: { $lt: cutoff } });
};
