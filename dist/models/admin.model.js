"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = __importDefault(require("./user.model"));
const Admin = user_model_1.default.discriminator('admin', new mongoose_1.default.Schema({
    adminLevel: {
        type: Number,
        default: 1,
        min: 1,
        max: 3
    },
    department: {
        type: String,
        default: 'Transportation',
        trim: true
    },
    canApproveDrivers: {
        type: Boolean,
        default: true
    },
    canManageShuttles: {
        type: Boolean,
        default: true
    },
    canViewAllReports: {
        type: Boolean,
        default: true
    },
    lastLoginDate: {
        type: Date,
        default: Date.now
    }
}));
exports.default = Admin;
