"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = __importDefault(require("./user.model"));
const Driver = user_model_1.default.discriminator('driver', new mongoose_1.default.Schema({
    licenseNumber: {
        type: String,
        required: [true, 'License number is required'],
        unique: true,
        trim: true
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    isAvailable: {
        type: Boolean,
        default: false
    },
    shuttleId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Shuttle'
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalTrips: {
        type: Number,
        default: 0
    }
}));
exports.default = Driver;
