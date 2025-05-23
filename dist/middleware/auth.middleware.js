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
exports.restrictTo = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
// Protect routes - require authentication
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log(`🔐 AUTH: ${req.method} ${req.path}`);
        console.log('🔐 Headers:', {
            authorization: req.headers.authorization ? 'Present' : 'Missing',
            'content-type': req.headers['content-type'],
            'user-agent': ((_a = req.headers['user-agent']) === null || _a === void 0 ? void 0 : _a.substring(0, 50)) + '...'
        });
        let token;
        // Get token from Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            console.log('🔐 Token extracted:', token ? `${token.substring(0, 10)}...` : 'null');
        }
        else {
            console.log('🔐 No Bearer token found in authorization header');
        }
        // Check if token exists
        if (!token) {
            console.log('🔐 ❌ No token provided');
            res.status(401).json({
                status: 'fail',
                message: 'You are not logged in. Please log in to get access'
            });
            return;
        }
        // Check JWT_SECRET
        if (!process.env.JWT_SECRET) {
            console.error('🔐 ❌ JWT_SECRET not configured!');
            res.status(500).json({
                status: 'error',
                message: 'Server configuration error'
            });
            return;
        }
        // Verify token
        console.log('🔐 Verifying token...');
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log('🔐 ✅ Token verified, user ID:', decoded.id);
        // Check if user still exists
        console.log('🔐 Looking up user in database...');
        const currentUser = yield user_model_1.default.findById(decoded.id);
        if (!currentUser) {
            console.log('🔐 ❌ User not found in database for ID:', decoded.id);
            res.status(401).json({
                status: 'fail',
                message: 'The user belonging to this token no longer exists'
            });
            return;
        }
        console.log('🔐 ✅ User found:', currentUser.email, 'Role:', currentUser.role);
        // Grant access to protected route
        req.user = currentUser;
        next();
    }
    catch (error) {
        console.log('🔐 ❌ Auth error:', error.message);
        if (error.name === 'JsonWebTokenError') {
            console.log('🔐 ❌ Invalid JWT token');
        }
        else if (error.name === 'TokenExpiredError') {
            console.log('🔐 ❌ JWT token expired');
        }
        res.status(401).json({
            status: 'fail',
            message: 'Not authorized to access this route'
        });
    }
});
exports.protect = protect;
// Restrict access to specific roles
const restrictTo = (...roles) => {
    return (req, res, next) => {
        var _a;
        console.log(`🔒 ROLE CHECK: User role: ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.role}, Required roles: ${roles.join(', ')}`);
        if (!roles.includes(req.user.role)) {
            console.log('🔒 ❌ Role access denied');
            res.status(403).json({
                status: 'fail',
                message: 'You do not have permission to perform this action'
            });
            return;
        }
        console.log('🔒 ✅ Role access granted');
        next();
    };
};
exports.restrictTo = restrictTo;
