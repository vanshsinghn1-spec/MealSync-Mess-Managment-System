const { getRedisClient } = require('../config/redis');

// In-memory fallback storage
const memoryCache = new Map();

/**
 * Get cached payload by key
 * @param {string} key 
 */
async function getCache(key) {
  const redis = getRedisClient();
  if (redis) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      // Fallback on Redis read error
    }
  }

  // Memory fallback
  const item = memoryCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return item.value;
}

/**
 * Set cached payload with TTL (seconds)
 * @param {string} key 
 * @param {any} value 
 * @param {number} ttlSeconds 
 */
async function setCache(key, value, ttlSeconds = 3600) {
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
      return;
    } catch (e) {
      // Fallback on Redis write error
    }
  }

  // Memory fallback
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000
  });
}

/**
 * Flush/Invalidate all cached keys (called on menu updates)
 */
async function flushCache() {
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.flushdb();
    } catch (e) {}
  }
  memoryCache.clear();
}

module.exports = {
  getCache,
  setCache,
  flushCache
};
