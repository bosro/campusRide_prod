import Notification from '../models/notification.model';
import { NotificationType } from '../types';
import { emitNotification } from '../config/socket';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedItemId?: string;
  refModel?: string;
}

export const createNotification = async (params: CreateNotificationParams) => {
  const { userId, title, message, type, relatedItemId, refModel } = params;
  
  const notification = await Notification.create({
    userId,
    title,
    message,
    isRead: false,
    type,
    relatedItemId,
    refModel: refModel || 'Booking'
  });
  
  // Emit real-time notification via WebSocket
  emitNotification(userId, {
    id: notification._id,
    userId,
    title,
    message,
    isRead: false,
    type,
    createdAt: notification.createdAt,
    relatedItemId
  });
  
  return notification;
};

export const getNotificationsForUser = async (userId: string) => {
  return await Notification.find({ userId })
    .sort('-createdAt')
    .limit(50);
};

export const markNotificationAsRead = async (notificationId: string) => {
  const notification = await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
  
  return notification;
};

export const markAllNotificationsAsRead = async (userId: string) => {
  const result = await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );
  
  return result.modifiedCount;
};


// import Notification from '../models/notification.model';
// import { NotificationType } from '../types';

// interface CreateNotificationParams {
//   userId: string;
//   title: string;
//   message: string;
//   type: NotificationType;
//   relatedItemId?: string;
//   refModel?: string;
// }

// export const createNotification = async (params: CreateNotificationParams) => {
//   const { userId, title, message, type, relatedItemId, refModel } = params;
  
//   const notification = await Notification.create({
//     userId,
//     title,
//     message,
//     isRead: false,
//     type,
//     relatedItemId,
//     refModel: refModel || 'Booking'
//   });
  
//   return notification;
// };