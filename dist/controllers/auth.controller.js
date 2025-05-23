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
exports.resetPassword = exports.forgotPassword = exports.getCurrentUser = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const user_model_1 = __importDefault(require("../models/user.model"));
const student_model_1 = __importDefault(require("../models/student.model"));
const driver_model_1 = __importDefault(require("../models/driver.model"));
const admin_model_1 = __importDefault(require("../models/admin.model"));
const email_service_1 = require("../services/email.service");
const redis_1 = require("../config/redis");
// Generate JWT token
const signToken = (id) => {
    const secret = process.env.JWT_SECRET || 'fallback-secret-for-development';
    const expiresIn = process.env.JWT_EXPIRES_IN || '1d'; // Default to 1 day
    return jsonwebtoken_1.default.sign({ id }, secret, {
        expiresIn: expiresIn
    });
};
// Create and send token with response
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id.toString());
    // Remove password from output
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};
// Register a new user
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, phoneNumber, role, studentId, licenseNumber } = req.body;
        // Check if user already exists
        const existingUser = yield user_model_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                status: 'fail',
                message: 'Email already in use'
            });
            return;
        }
        let newUser;
        // Create user based on role
        switch (role) {
            case 'student':
                newUser = yield student_model_1.default.create({
                    name,
                    email,
                    password,
                    phoneNumber,
                    role,
                    studentId
                });
                break;
            case 'driver':
                newUser = yield driver_model_1.default.create({
                    name,
                    email,
                    password,
                    phoneNumber,
                    role,
                    licenseNumber,
                    isApproved: false,
                    isAvailable: false
                });
                break;
            case 'admin':
                newUser = yield admin_model_1.default.create({
                    name,
                    email,
                    password,
                    phoneNumber,
                    role,
                    adminLevel: 1,
                    department: 'Transportation',
                    canApproveDrivers: true,
                    canManageShuttles: true,
                    canViewAllReports: true,
                    lastLoginDate: new Date()
                });
                break;
            default:
                res.status(400).json({
                    status: 'fail',
                    message: 'Invalid role'
                });
                return;
        }
        createSendToken(newUser, 201, res);
    }
    catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});
exports.register = register;
// Login user
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        console.log('=== LOGIN DEBUG ===');
        console.log('Received email:', email);
        console.log('Received password:', password);
        console.log('Email type:', typeof email);
        console.log('Password type:', typeof password);
        // Check if email and password exist
        if (!email || !password) {
            res.status(400).json({
                status: 'fail',
                message: 'Please provide email and password'
            });
            return;
        }
        // With discriminators, all users are in the same collection
        // So we only need to query the User model
        console.log('Querying User collection (includes all discriminators)...');
        const user = yield user_model_1.default.findOne({ email }).select('+password');
        console.log('User found:', user ? 'YES' : 'NO');
        if (user) {
            console.log('User details:', {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                hasPassword: !!user.password
            });
        }
        // Check if user exists and password is correct
        if (!user) {
            console.log('No user found with email:', email);
            res.status(401).json({
                status: 'fail',
                message: 'Incorrect email or password'
            });
            return;
        }
        console.log('About to compare passwords...');
        console.log('User has comparePassword method:', typeof user.comparePassword);
        const isPasswordCorrect = yield user.comparePassword(password);
        console.log('Password comparison result:', isPasswordCorrect);
        if (!isPasswordCorrect) {
            console.log('Password comparison failed');
            res.status(401).json({
                status: 'fail',
                message: 'Incorrect email or password'
            });
            return;
        }
        // Handle role-specific logic
        if (user.role === 'driver') {
            // For drivers, we need to check the discriminator model for additional fields
            const driver = yield driver_model_1.default.findById(user._id);
            if (driver && !driver.isApproved) {
                res.status(401).json({
                    status: 'fail',
                    message: 'Your driver account is pending approval'
                });
                return;
            }
            // Update driver's last login date
            if (driver) {
                driver.lastLoginDate = new Date();
                yield driver.save({ validateBeforeSave: false });
            }
        }
        // If admin, update last login date
        if (user.role === 'admin') {
            const admin = yield admin_model_1.default.findById(user._id);
            if (admin) {
                admin.lastLoginDate = new Date();
                yield admin.save({ validateBeforeSave: false });
            }
        }
        // Add user to cache
        yield redis_1.userCache.set(user._id.toString(), {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role
        });
        console.log('Login successful for:', user.email, 'with role:', user.role);
        createSendToken(user, 200, res);
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});
exports.login = login;
// Get current user profile
const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // User is already available in req.user from the middleware
        res.status(200).json({
            status: 'success',
            data: {
                user: req.user
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
exports.getCurrentUser = getCurrentUser;
// Request password reset
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        // Find user by email
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({
                status: 'fail',
                message: 'There is no user with this email address'
            });
            return;
        }
        // Generate a 6-digit numeric code instead of long hex string
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        // Hash the code and store it
        user.passwordResetToken = crypto_1.default
            .createHash('sha256')
            .update(resetCode)
            .digest('hex');
        // Set token expiry (10 minutes)
        user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
        console.log('Generated reset code:', resetCode);
        console.log('Hashed token stored:', user.passwordResetToken);
        // Save the user with reset token
        yield user.save({ validateBeforeSave: false });
        try {
            // Send email with the 6-digit code (not the hash)
            yield (0, email_service_1.sendPasswordResetEmail)(user.email, user.name, resetCode);
            res.status(200).json({
                status: 'success',
                message: 'Reset code sent to email'
            });
        }
        catch (err) {
            // Reset token fields if email fails
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            yield user.save({ validateBeforeSave: false });
            throw new Error('Error sending email. Please try again later.');
        }
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});
exports.forgotPassword = forgotPassword;
// Reset password
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, code, password } = req.body;
        // Hash the provided reset code
        const hashedToken = crypto_1.default
            .createHash('sha256')
            .update(code)
            .digest('hex');
        // Find user with the token and check if token is still valid
        const user = yield user_model_1.default.findOne({
            email,
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        }).select('+password');
        if (!user) {
            res.status(400).json({
                status: 'fail',
                message: 'Invalid or expired reset token'
            });
            return;
        }
        console.log('User entered code:', code);
        console.log('Hashed user code:', hashedToken);
        console.log('Looking for user with email:', email);
        // Set new password and remove reset token fields
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        // Save user
        yield user.save();
        // Clear user from cache
        yield redis_1.userCache.invalidate(user._id.toString());
        // Log user in by sending JWT
        createSendToken(user, 200, res);
    }
    catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});
exports.resetPassword = resetPassword;
