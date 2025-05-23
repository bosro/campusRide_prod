"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Import middleware
const error_middleware_1 = require("./middleware/error.middleware");
const rate_limiter_middleware_1 = require("./middleware/rate-limiter.middleware");
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const shuttle_routes_1 = __importDefault(require("./routes/shuttle.routes"));
const booking_routes_1 = __importDefault(require("./routes/booking.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
// Create Express app
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: ((_a = process.env.ALLOWED_ORIGINS) === null || _a === void 0 ? void 0 : _a.split(',')) || 'http://localhost:3000',
    credentials: true
}));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Apply rate limiting to all routes
app.use(rate_limiter_middleware_1.rateLimiter);
// API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/shuttles', shuttle_routes_1.default);
app.use('/api/bookings', booking_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Server is running',
        environment: process.env.NODE_ENV,
        timestamp: new Date()
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    return (0, error_middleware_1.errorHandler)(err, req, res, next);
});
exports.default = app;
