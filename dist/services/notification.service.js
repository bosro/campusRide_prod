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
exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.getNotificationsForUser = exports.createNotification = void 0;
const notification_model_1 = __importDefault(require("../models/notification.model"));
const socket_1 = require("../config/socket");
const createNotification = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, title, message, type, relatedItemId, refModel } = params;
    const notification = yield notification_model_1.default.create({
        userId,
        title,
        message,
        isRead: false,
        type,
        relatedItemId,
        refModel: refModel || 'Booking'
    });
    // Emit real-time notification via WebSocket
    (0, socket_1.emitNotification)(userId, {
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
});
exports.createNotification = createNotification;
const getNotificationsForUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield notification_model_1.default.find({ userId })
        .sort('-createdAt')
        .limit(50);
});
exports.getNotificationsForUser = getNotificationsForUser;
const markNotificationAsRead = (notificationId) => __awaiter(void 0, void 0, void 0, function* () {
    const notification = yield notification_model_1.default.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
    return notification;
});
exports.markNotificationAsRead = markNotificationAsRead;
const markAllNotificationsAsRead = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield notification_model_1.default.updateMany({ userId, isRead: false }, { isRead: true });
    return result.modifiedCount;
});
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
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
