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
exports.updateDriverAvailability = exports.updateUser = exports.approveDriver = exports.getUserById = exports.getAllDrivers = exports.getAllStudents = exports.getAllUsers = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const student_model_1 = __importDefault(require("../models/student.model"));
const driver_model_1 = __importDefault(require("../models/driver.model"));
const mongoose_1 = require("../utils/mongoose");
// Get all users
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_model_1.default.find();
        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users
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
exports.getAllUsers = getAllUsers;
// Get all students
const getAllStudents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const students = yield student_model_1.default.find();
        res.status(200).json({
            status: 'success',
            results: students.length,
            data: {
                students
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
exports.getAllStudents = getAllStudents;
// Get all drivers
const getAllDrivers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const drivers = yield driver_model_1.default.find();
        res.status(200).json({
            status: 'success',
            results: drivers.length,
            data: {
                drivers
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
exports.getAllDrivers = getAllDrivers;
// Get user by ID
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Use req.params.id if provided, otherwise use the authenticated user's ID
        const userId = req.params.id || req.user._id;
        // Validate user ID
        if (!(0, mongoose_1.validateObjectId)(userId, res, 'user')) {
            return;
        }
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
            return;
        }
        res.status(200).json({
            status: 'success',
            data: {
                user
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
exports.getUserById = getUserById;
// Approve driver
const approveDriver = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate driver ID
        if (!(0, mongoose_1.validateObjectId)(req.params.id, res, 'driver')) {
            return;
        }
        const driver = yield driver_model_1.default.findById(req.params.id);
        if (!driver) {
            res.status(404).json({
                status: 'fail',
                message: 'Driver not found'
            });
            return;
        }
        // Update driver approval status
        driver.isApproved = true;
        yield driver.save();
        res.status(200).json({
            status: 'success',
            data: {
                driver
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
exports.approveDriver = approveDriver;
// Update user
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Prevent password updates via this route
        if (req.body.password) {
            res.status(400).json({
                status: 'fail',
                message: 'This route is not for password updates. Please use /updatePassword'
            });
            return;
        }
        // Get fields to update
        const fieldsToUpdate = {
            name: req.body.name,
            phoneNumber: req.body.phoneNumber,
            profilePicture: req.body.profilePicture
        };
        // Remove undefined fields
        Object.keys(fieldsToUpdate).forEach(key => {
            if (fieldsToUpdate[key] === undefined) {
                delete fieldsToUpdate[key];
            }
        });
        // Update user
        const updatedUser = yield user_model_1.default.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
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
exports.updateUser = updateUser;
// Update driver availability
const updateDriverAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { isAvailable } = req.body;
        if (isAvailable === undefined) {
            res.status(400).json({
                status: 'fail',
                message: 'Please provide availability status'
            });
            return;
        }
        const driver = yield driver_model_1.default.findById(req.user._id);
        if (!driver) {
            res.status(404).json({
                status: 'fail',
                message: 'Driver not found'
            });
            return;
        }
        // Update driver availability
        driver.isAvailable = isAvailable;
        yield driver.save();
        res.status(200).json({
            status: 'success',
            data: {
                driver
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
exports.updateDriverAvailability = updateDriverAvailability;
