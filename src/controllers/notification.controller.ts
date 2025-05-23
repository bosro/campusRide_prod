import { Request, Response } from 'express';
import Notification from '../models/notification.model';
import { NotificationDocument } from '../types';
import { validateObjectId } from '../utils/mongoose';

// Get user notifications
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    
    const notifications = await Notification.find({ userId })
      .sort('-createdAt') as NotificationDocument[];
    
    // Format the response
    const formattedNotifications = notifications.map(notification => {
      const { _id, title, message, isRead, type, createdAt, relatedItemId } = notification;
      
      return {
        id: _id,
        userId,
        title,
        message,
        isRead,
        type,
        createdAt,
        relatedItemId
      };
    });
    
    res.status(200).json({
      status: 'success',
      results: notifications.length,
      data: {
        notifications: formattedNotifications
      }
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    // Validate notification ID
    if (!validateObjectId(req.params.id, res, 'notification')) {
      return; // The function already sent an error response
    }
    
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id
    }) as NotificationDocument | null;
    
    if (!notification) {
      res.status(404).json({
        status: 'fail',
        message: 'Notification not found'
      });
      return;
    }
    
    // Update notification
    notification.isRead = true;
    await notification.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        notification
      }
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    
    // Update all unread notifications for the user
    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
    
    res.status(200).json({
      status: 'success',
      message: `${result.modifiedCount} notifications marked as read`,
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};