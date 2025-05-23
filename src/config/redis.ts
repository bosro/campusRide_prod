import Redis from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import dotenv from 'dotenv';

dotenv.config();

// Create Redis client - works for both local and production
const createRedisClient = (): Redis => {
  // Use REDIS_URL if available (production), otherwise use individual settings (local)
  if (process.env.REDIS_URL) {
    console.log('🔌 Connecting to Redis via URL (Production)...');
    return new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false,
      lazyConnect: true,
      // Reconnect if connection is lost
      reconnectOnError: (err) => {
        console.error('Redis connection error:', err);
        return true; // Reconnect for all errors
      }
    });
  } else {
    console.log('🔌 Connecting to Redis via host/port (Local)...');
    return new Redis({
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
export const redisClient = createRedisClient();

// Log Redis connection status
redisClient.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redisClient.on('ready', () => {
  console.log('🚀 Redis is ready to accept commands');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Error:', err);
});

redisClient.on('close', () => {
  console.log('🔌 Redis connection closed');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Closing Redis connection...');
  try {
    await redisClient.quit();
    console.log('✅ Redis connection closed gracefully');
  } catch (error) {
    console.error('❌ Error closing Redis connection:', error);
  }
});

process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM: Closing Redis connection...');
  try {
    await redisClient.quit();
    console.log('✅ Redis connection closed gracefully');
  } catch (error) {
    console.error('❌ Error closing Redis connection:', error);
  }
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
    try {
      const data = await redisClient.get(`shuttle:${shuttleId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting shuttle cache:', error);
      return null;
    }
  },
  
  // Set shuttle data in cache with expiration time
  async set(shuttleId: string, data: any, ttl = 60) { // TTL in seconds
    try {
      await redisClient.setex(`shuttle:${shuttleId}`, ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Error setting shuttle cache:', error);
    }
  },
  
  // Remove shuttle data from cache
  async invalidate(shuttleId: string) {
    try {
      await redisClient.del(`shuttle:${shuttleId}`);
    } catch (error) {
      console.error('Error invalidating shuttle cache:', error);
    }
  },
  
  // Remove all shuttle data from cache
  async invalidateAll() {
    try {
      const keys = await redisClient.keys('shuttle:*');
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (error) {
      console.error('Error invalidating all shuttle cache:', error);
    }
  }
};

// User data cache service
export const userCache = {
  // Get user data from cache
  async get(userId: string) {
    try {
      const data = await redisClient.get(`user:${userId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user cache:', error);
      return null;
    }
  },
  
  // Set user data in cache with expiration time
  async set(userId: string, data: any, ttl = 300) { // 5 minutes TTL
    try {
      await redisClient.setex(`user:${userId}`, ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Error setting user cache:', error);
    }
  },
  
  // Remove user data from cache
  async invalidate(userId: string) {
    try {
      await redisClient.del(`user:${userId}`);
    } catch (error) {
      console.error('Error invalidating user cache:', error);
    }
  }
};

// Session management for auth tokens and reset codes
export const sessionCache = {
  // Store password reset code
  async setResetCode(email: string, code: string, ttl = 600) { // 10 minutes
    try {
      await redisClient.setex(`reset:${email}`, ttl, code);
    } catch (error) {
      console.error('Error setting reset code:', error);
    }
  },
  
  // Get password reset code
  async getResetCode(email: string) {
    try {
      return await redisClient.get(`reset:${email}`);
    } catch (error) {
      console.error('Error getting reset code:', error);
      return null;
    }
  },
  
  // Remove password reset code
  async removeResetCode(email: string) {
    try {
      await redisClient.del(`reset:${email}`);
    } catch (error) {
      console.error('Error removing reset code:', error);
    }
  },
  
  // Store JWT token (for logout/blacklist functionality)
  async blacklistToken(token: string, ttl = 86400) { // 24 hours
    try {
      await redisClient.setex(`blacklist:${token}`, ttl, '1');
    } catch (error) {
      console.error('Error blacklisting token:', error);
    }
  },
  
  // Check if token is blacklisted
  async isTokenBlacklisted(token: string) {
    try {
      const result = await redisClient.get(`blacklist:${token}`);
      return result === '1';
    } catch (error) {
      console.error('Error checking token blacklist:', error);
      return false;
    }
  }
};

// Utility function to test Redis connection
export const testRedisConnection = async (): Promise<boolean> => {
  try {
    await redisClient.ping();
    console.log('✅ Redis connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Redis connection test failed:', error);
    return false;
  }
};

export default redisClient;