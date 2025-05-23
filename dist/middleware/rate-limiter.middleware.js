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
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
const redis_1 = require("../config/redis");
// Rate limiting middleware
const rateLimiter = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Use IP address as key if user is not authenticated
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || req.ip;
        yield redis_1.apiLimiter.consume(userId);
        next();
    }
    catch (error) {
        res.status(429).json({
            status: 'error',
            message: 'Too many requests. Please try again later.'
        });
    }
});
exports.rateLimiter = rateLimiter;
