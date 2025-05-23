"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateObjectId = exports.isValidObjectId = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Checks if a value is a valid MongoDB ObjectId
 * @param id - The value to check
 * @returns boolean indicating if the value is a valid ObjectId
 */
const isValidObjectId = (id) => {
    if (!id)
        return false;
    return mongoose_1.default.Types.ObjectId.isValid(id);
};
exports.isValidObjectId = isValidObjectId;
/**
 * Validates that an ID is a valid MongoDB ObjectId and returns a standardized error response if not
 * @param id - The ID to validate
 * @param res - Express Response object
 * @param entityName - Name of the entity (e.g., 'User', 'Booking') for error message
 * @returns boolean indicating if validation passed
 */
const validateObjectId = (id, res, entityName = 'item') => {
    if (!(0, exports.isValidObjectId)(id)) {
        res.status(400).json({
            status: 'fail',
            message: `Invalid ${entityName} ID format`
        });
        return false;
    }
    return true;
};
exports.validateObjectId = validateObjectId;
