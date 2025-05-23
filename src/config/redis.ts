import Redis from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import dotenv from 'dotenv';

dotenv.config();

// Create Redis client
export const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  // Reconnect if connection is lost
  reconnectOnError: (err) => {
    console.error('Redis connection error:', err);
    return true; // Reconnect for all errors
  }
});

// Log Redis connection status
redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis Error:', err);
});

// Create a rate limiter for API endpoints
export const apiLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rate_limit_api',
  points: 100, // Number of requests
  duration: 60, // Per 1 minute
});

// Shuttle availability cache service
export const shuttleCache = {
  // Get shuttle data from cache
  async get(shuttleId: string) {
    const data = await redisClient.get(`shuttle:${shuttleId}`);
    return data ? JSON.parse(data) : null;
  },
  
  // Set shuttle data in cache with expiration time
  async set(shuttleId: string, data: any, ttl = 60) { // TTL in seconds
    await redisClient.setex(`shuttle:${shuttleId}`, ttl, JSON.stringify(data));
  },
  
  // Remove shuttle data from cache
  async invalidate(shuttleId: string) {
    await redisClient.del(`shuttle:${shuttleId}`);
  },
  
  // Remove all shuttle data from cache
  async invalidateAll() {
    const keys = await redisClient.keys('shuttle:*');
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  }
};

// User data cache service
export const userCache = {
  // Get user data from cache
  async get(userId: string) {
    const data = await redisClient.get(`user:${userId}`);
    return data ? JSON.parse(data) : null;
  },
  
  // Set user data in cache with expiration time
  async set(userId: string, data: any, ttl = 300) { // 5 minutes TTL
    await redisClient.setex(`user:${userId}`, ttl, JSON.stringify(data));
  },
  
  // Remove user data from cache
  async invalidate(userId: string) {
    await redisClient.del(`user:${userId}`);
  }
};