"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.getUserNotifications = void 0;
const notification_model_1 = __importDefault(require("../models/notification.model"));
const mongoose_1 = require("../utils/mongoose");
// Get user notifications
const getUserNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const notifications = yield notification_model_1.default.find({ userId })
            .sort('-createdAt');
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
    }
    catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});
exports.getUserNotifications = getUserNotifications;
// Mark notification as read
const markNotificationAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate notification ID
        if (!(0, mongoose_1.validateObjectId)(req.params.id, res, 'notification')) {
            return; // The function already sent an error response
        }
        const notification = yield notification_model_1.default.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        if (!notification) {
            res.status(404).json({
                status: 'fail',
                message: 'Notification not found'
            });
            return;
        }
        // Update notification
        notification.isRead = true;
        yield notification.save();
        res.status(200).json({
            status: 'success',
            data: {
                notification
            }
        });
    }
    catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});
exports.markNotificationAsRead = markNotificationAsRead;
// Mark all notifications as read
const markAllNotificationsAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        // Update all unread notifications for the user
        const result = yield notification_model_1.default.updateMany({ userId, isRead: false }, { isRead: true });
        res.status(200).json({
            status: 'success',
            message: `${result.modifiedCount} notifications marked as read`,
            data: {
                modifiedCount: result.modifiedCount
            }
        });
    }
    catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
