import { redisClient } from '../config/redis.js';

const rateLimiter = (requestsPerMinute = 10) => {
  return async (req, res, next) => {
    try {
      const ip = req.ip || req.connection.remoteAddress;
      const key = `rate_limit:${ip}`;

      // Get current count
      const current = await redisClient.get(key);

      if (current === null) {
        // First request, set key with expiry
        await redisClient.setEx(key, 60, '1');
        return next();
      }

      const count = parseInt(current);

      if (count >= requestsPerMinute) {
        return res.status(429).json({
          error: 'Too many requests',
          message: `Rate limit exceeded. Maximum ${requestsPerMinute} requests per minute.`
        });
      }

      // Increment counter
      await redisClient.incr(key);

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      // Continue without rate limiting if Redis fails
      next();
    }
  };
};

export default rateLimiter;