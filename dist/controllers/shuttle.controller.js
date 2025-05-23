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
exports.toggleShuttleStatus = exports.updateShuttleAvailability = exports.updateShuttle = exports.createShuttle = exports.getShuttleById = exports.getAvailableShuttles = exports.getAllShuttles = void 0;
const shuttle_model_1 = __importDefault(require("../models/shuttle.model"));
const driver_model_1 = __importDefault(require("../models/driver.model"));
const mongoose_1 = require("../utils/mongoose");
// Get all shuttles
const getAllShuttles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shuttles = yield shuttle_model_1.default.find().populate({
            path: 'driver',
            select: 'name _id'
        });
        // Format the response
        const formattedShuttles = shuttles.map(shuttle => {
            const { _id, name, capacity, availableSeats, route, isActive, driver } = shuttle;
            return {
                id: _id,
                name,
                capacity,
                availableSeats,
                route,
                isActive,
                driverId: driver ? driver._id : undefined,
                driverName: driver ? driver.name : undefined
            };
        });
        res.status(200).json({
            status: 'success',
            results: shuttles.length,
            data: {
                shuttles: formattedShuttles
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
exports.getAllShuttles = getAllShuttles;
// Get available shuttles
const getAvailableShuttles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shuttles = yield shuttle_model_1.default.find({
            isActive: true,
            availableSeats: { $gt: 0 }
        }).populate({
            path: 'driver',
            select: 'name _id'
        });
        // Format the response
        const formattedShuttles = shuttles.map(shuttle => {
            const { _id, name, capacity, availableSeats, route, isActive, driver } = shuttle;
            return {
                id: _id,
                name,
                capacity,
                availableSeats,
                route,
                isActive,
                driverId: driver ? driver._id : undefined,
                driverName: driver ? driver.name : undefined
            };
        });
        res.status(200).json({
            status: 'success',
            results: shuttles.length,
            data: {
                shuttles: formattedShuttles
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
exports.getAvailableShuttles = getAvailableShuttles;
// Get shuttle by ID
const getShuttleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate shuttle ID
        if (!(0, mongoose_1.validateObjectId)(req.params.id, res, 'shuttle')) {
            return;
        }
        const shuttle = yield shuttle_model_1.default.findById(req.params.id).populate({
            path: 'driver',
            select: 'name _id'
        });
        if (!shuttle) {
            res.status(404).json({
                status: 'fail',
                message: 'Shuttle not found'
            });
            return;
        }
        // Format the response
        const { _id, name, capacity, availableSeats, route, isActive, driver } = shuttle;
        const formattedShuttle = {
            id: _id,
            name,
            capacity,
            availableSeats,
            route,
            isActive,
            driverId: driver ? driver._id : undefined,
            driverName: driver ? driver.name : undefined
        };
        res.status(200).json({
            status: 'success',
            data: {
                shuttle: formattedShuttle
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
exports.getShuttleById = getShuttleById;
// Create a new shuttle
const createShuttle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, capacity, route, driverId } = req.body;
        // Validate driver ID if provided
        if (driverId && !(0, mongoose_1.validateObjectId)(driverId, res, 'driver')) {
            return;
        }
        // Create shuttle first
        const newShuttle = yield shuttle_model_1.default.create({
            name,
            capacity,
            availableSeats: capacity, // Initially all seats are available
            driverId,
            route,
            isActive: true
        });
        // Validate driver exists and is approved (after creating shuttle to get the ID)
        if (driverId) {
            const driver = yield driver_model_1.default.findById(driverId);
            if (!driver) {
                res.status(404).json({
                    status: 'fail',
                    message: 'Driver not found'
                });
                return;
            }
            if (!driver.isApproved) {
                res.status(400).json({
                    status: 'fail',
                    message: 'Driver is not approved'
                });
                return;
            }
            // Update driver's shuttleId
            driver.shuttleId = newShuttle.id;
            yield driver.save();
        }
        res.status(201).json({
            status: 'success',
            data: {
                shuttle: newShuttle
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
exports.createShuttle = createShuttle;
// Update shuttle
const updateShuttle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Validate shuttle ID
        if (!(0, mongoose_1.validateObjectId)(req.params.id, res, 'shuttle')) {
            return;
        }
        const { name, capacity, route, isActive, driverId } = req.body;
        // Validate driver ID if provided
        if (driverId && !(0, mongoose_1.validateObjectId)(driverId, res, 'driver')) {
            return;
        }
        const shuttle = yield shuttle_model_1.default.findById(req.params.id);
        if (!shuttle) {
            res.status(404).json({
                status: 'fail',
                message: 'Shuttle not found'
            });
            return;
        }
        // Update driver if changed
        if (driverId && driverId !== ((_a = shuttle.driverId) === null || _a === void 0 ? void 0 : _a.toString())) {
            // Validate new driver exists and is approved
            const newDriver = yield driver_model_1.default.findById(driverId);
            if (!newDriver) {
                res.status(404).json({
                    status: 'fail',
                    message: 'Driver not found'
                });
                return;
            }
            if (!newDriver.isApproved) {
                res.status(400).json({
                    status: 'fail',
                    message: 'Driver is not approved'
                });
                return;
            }
            // Remove shuttle assignment from old driver if exists
            if (shuttle.driverId) {
                const oldDriver = yield driver_model_1.default.findById(shuttle.driverId);
                if (oldDriver && ((_b = oldDriver.shuttleId) === null || _b === void 0 ? void 0 : _b.toString()) === shuttle.id) {
                    oldDriver.shuttleId = undefined;
                    yield oldDriver.save();
                }
            }
            // Update new driver's shuttleId
            newDriver.shuttleId = shuttle.id;
            yield newDriver.save();
        }
        // Update shuttle
        const updatedShuttle = yield shuttle_model_1.default.findByIdAndUpdate(req.params.id, { name, capacity, route, isActive, driverId }, { new: true, runValidators: true }).populate({
            path: 'driver',
            select: 'name _id'
        });
        res.status(200).json({
            status: 'success',
            data: {
                shuttle: updatedShuttle
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
exports.updateShuttle = updateShuttle;
// Update shuttle availability
const updateShuttleAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate shuttle ID
        if (!(0, mongoose_1.validateObjectId)(req.params.id, res, 'shuttle')) {
            return;
        }
        const { availableSeats } = req.body;
        if (availableSeats === undefined) {
            res.status(400).json({
                status: 'fail',
                message: 'Please provide available seats'
            });
            return;
        }
        const shuttle = yield shuttle_model_1.default.findById(req.params.id);
        if (!shuttle) {
            res.status(404).json({
                status: 'fail',
                message: 'Shuttle not found'
            });
            return;
        }
        // Validate available seats is not greater than capacity
        if (availableSeats > shuttle.capacity) {
            res.status(400).json({
                status: 'fail',
                message: 'Available seats cannot exceed capacity'
            });
            return;
        }
        // Update shuttle
        shuttle.availableSeats = availableSeats;
        yield shuttle.save();
        res.status(200).json({
            status: 'success',
            data: {
                shuttle
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
exports.updateShuttleAvailability = updateShuttleAvailability;
// Toggle shuttle active status
const toggleShuttleStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate shuttle ID
        if (!(0, mongoose_1.validateObjectId)(req.params.id, res, 'shuttle')) {
            return;
        }
        const shuttle = yield shuttle_model_1.default.findById(req.params.id);
        if (!shuttle) {
            res.status(404).json({
                status: 'fail',
                message: 'Shuttle not found'
            });
            return;
        }
        // Toggle status
        shuttle.isActive = !shuttle.isActive;
        yield shuttle.save();
        res.status(200).json({
            status: 'success',
            data: {
                shuttle
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
exports.toggleShuttleStatus = toggleShuttleStatus;
