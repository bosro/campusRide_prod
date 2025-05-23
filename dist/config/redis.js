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
exports.testRedisConnection = exports.sessionCache = exports.userCache = exports.shuttleCache = exports.apiLimiter = exports.redisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Create Redis client - works for both local and production
const createRedisClient = () => {
    // Use REDIS_URL if available (production), otherwise use individual settings (local)
    if (process.env.REDIS_URL) {
        console.log('🔌 Connecting to Redis via URL (Production)...');
        return new ioredis_1.default(process.env.REDIS_URL, {
            maxRetriesPerRequest: 3,
            enableOfflineQueue: false,
            lazyConnect: true,
            // Reconnect if connection is lost
            reconnectOnError: (err) => {
                console.error('Redis connection error:', err);
                return true; // Reconnect for all errors
            }
        });
    }
    else {
        console.log('🔌 Connecting to Redis via host/port (Local)...');
        return new ioredis_1.default({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD || undefined,
            maxRetriesPerRequest: 3,
            enableOfflineQueue: false,
            lazyConnect: true,
            // Reconnect if connection is lost
            reconnectOnError: (err) => {
                console.error('Redis connection error:', err);
                return true; // Reconnect for all errors
            }
        });
    }
};
// Create Redis client
exports.redisClient = createRedisClient();
// Log Redis connection status
exports.redisClient.on('connect', () => {
    console.log('✅ Connected to Redis');
});
exports.redisClient.on('ready', () => {
    console.log('🚀 Redis is ready to accept commands');
});
exports.redisClient.on('error', (err) => {
    console.error('❌ Redis Error:', err);
});
exports.redisClient.on('close', () => {
    console.log('🔌 Redis connection closed');
});
// Graceful shutdown
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('🛑 Closing Redis connection...');
    try {
        yield exports.redisClient.quit();
        console.log('✅ Redis connection closed gracefully');
    }
    catch (error) {
        console.error('❌ Error closing Redis connection:', error);
    }
}));
process.on('SIGTERM', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('🛑 SIGTERM: Closing Redis connection...');
    try {
        yield exports.redisClient.quit();
        console.log('✅ Redis connection closed gracefully');
    }
    catch (error) {
        console.error('❌ Error closing Redis connection:', error);
    }
}));
// Create a rate limiter for API endpoints
exports.apiLimiter = new rate_limiter_flexible_1.RateLimiterRedis({
    storeClient: exports.redisClient,
    keyPrefix: 'rate_limit_api',
    points: 100, // Number of requests
    duration: 60, // Per 1 minute
});
// Shuttle availability cache service
exports.shuttleCache = {
    // Get shuttle data from cache
    get(shuttleId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield exports.redisClient.get(`shuttle:${shuttleId}`);
                return data ? JSON.parse(data) : null;
            }
            catch (error) {
                console.error('Error getting shuttle cache:', error);
                return null;
            }
        });
    },
    // Set shuttle data in cache with expiration time
    set(shuttleId_1, data_1) {
        return __awaiter(this, arguments, void 0, function* (shuttleId, data, ttl = 60) {
            try {
                yield exports.redisClient.setex(`shuttle:${shuttleId}`, ttl, JSON.stringify(data));
            }
            catch (error) {
                console.error('Error setting shuttle cache:', error);
            }
        });
    },
    // Remove shuttle data from cache
    invalidate(shuttleId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield exports.redisClient.del(`shuttle:${shuttleId}`);
            }
            catch (error) {
                console.error('Error invalidating shuttle cache:', error);
            }
        });
    },
    // Remove all shuttle data from cache
    invalidateAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const keys = yield exports.redisClient.keys('shuttle:*');
                if (keys.length > 0) {
                    yield exports.redisClient.del(...keys);
                }
            }
            catch (error) {
                console.error('Error invalidating all shuttle cache:', error);
            }
        });
    }
};
// User data cache service
exports.userCache = {
    // Get user data from cache
    get(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield exports.redisClient.get(`user:${userId}`);
                return data ? JSON.parse(data) : null;
            }
            catch (error) {
                console.error('Error getting user cache:', error);
                return null;
            }
        });
    },
    // Set user data in cache with expiration time
    set(userId_1, data_1) {
        return __awaiter(this, arguments, void 0, function* (userId, data, ttl = 300) {
            try {
                yield exports.redisClient.setex(`user:${userId}`, ttl, JSON.stringify(data));
            }
            catch (error) {
                console.error('Error setting user cache:', error);
            }
        });
    },
    // Remove user data from cache
    invalidate(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield exports.redisClient.del(`user:${userId}`);
            }
            catch (error) {
                console.error('Error invalidating user cache:', error);
            }
        });
    }
};
// Session management for auth tokens and reset codes
exports.sessionCache = {
    // Store password reset code
    setResetCode(email_1, code_1) {
        return __awaiter(this, arguments, void 0, function* (email, code, ttl = 600) {
            try {
                yield exports.redisClient.setex(`reset:${email}`, ttl, code);
            }
            catch (error) {
                console.error('Error setting reset code:', error);
            }
        });
    },
    // Get password reset code
    getResetCode(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield exports.redisClient.get(`reset:${email}`);
            }
            catch (error) {
                console.error('Error getting reset code:', error);
                return null;
            }
        });
    },
    // Remove password reset code
    removeResetCode(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield exports.redisClient.del(`reset:${email}`);
            }
            catch (error) {
                console.error('Error removing reset code:', error);
            }
        });
    },
    // Store JWT token (for logout/blacklist functionality)
    blacklistToken(token_1) {
        return __awaiter(this, arguments, void 0, function* (token, ttl = 86400) {
            try {
                yield exports.redisClient.setex(`blacklist:${token}`, ttl, '1');
            }
            catch (error) {
                console.error('Error blacklisting token:', error);
            }
        });
    },
    // Check if token is blacklisted
    isTokenBlacklisted(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield exports.redisClient.get(`blacklist:${token}`);
                return result === '1';
            }
            catch (error) {
                console.error('Error checking token blacklist:', error);
                return false;
            }
        });
    }
};
// Utility function to test Redis connection
const testRedisConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield exports.redisClient.ping();
        console.log('✅ Redis connection test successful');
        return true;
    }
    catch (error) {
        console.error('❌ Redis connection test failed:', error);
        return false;
    }
});
exports.testRedisConnection = testRedisConnection;
exports.default = exports.redisClient;
