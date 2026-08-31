const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
let redisClient = null;
let isRedisConnected = false;

try {
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    connectTimeout: 1500,
    enableOfflineQueue: false,
    retryStrategy(times) {
      if (times > 2) {
        return null; // Gracefully stop retrying after 2 attempts, fallback to memory cache
      }
      return 200;
    }
  });

  redisClient.on('connect', () => {
    isRedisConnected = true;
    console.log('✅ Connected to Redis cache cluster');
  });

  redisClient.on('error', () => {
    isRedisConnected = false;
  });
} catch (error) {
  isRedisConnected = false;
}

module.exports = {
  getRedisClient: () => (isRedisConnected ? redisClient : null),
  isRedisConnected: () => isRedisConnected
};
