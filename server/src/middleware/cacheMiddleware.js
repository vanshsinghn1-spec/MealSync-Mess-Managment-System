const { getCache, setCache } = require('../utils/cache');

/**
 * Express middleware to cache GET requests in Redis / In-memory
 * @param {number} ttlSeconds - Cache Time To Live in seconds (default 1 hour)
 */
function cacheMiddleware(ttlSeconds = 3600) {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `express:${req.originalUrl || req.url}`;

    try {
      const cachedData = await getCache(cacheKey);
      if (cachedData) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cachedData);
      }

      // Override res.json to capture response payload
      const originalJson = res.json.bind(res);
      res.setHeader('X-Cache', 'MISS');

      res.json = (body) => {
        if (res.statusCode === 200 && body) {
          setCache(cacheKey, body, ttlSeconds).catch(() => {});
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      next();
    }
  };
}

module.exports = cacheMiddleware;
