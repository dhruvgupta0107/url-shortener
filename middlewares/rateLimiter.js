import { redisClient } from '../config/redis.js';

const rateLimiter = (requestsPerMinute = 10) => {
  return async (req, res, next) => {
    try {
      // ✅ IMPORTANT: ensure Redis is connected
      if (!redisClient.isOpen) {
        console.log("⚠️ Redis not connected, skipping rate limit");
        return next();
      }

      // ✅ Better IP handling (important for proxies like Vercel)
      const ip =
        req.headers['x-forwarded-for']?.split(',')[0] ||
        req.socket.remoteAddress;

      const key = `rate_limit:${ip}`;

      // Get current count
      const current = await redisClient.get(key);

      if (current === null) {
        // First request
        await redisClient.setEx(key, 60, '1');
        return next();
      }

      const count = parseInt(current, 10);

      if (count >= requestsPerMinute) {
        return res.status(429).json({
          error: 'Too many requests',
          message: `Rate limit exceeded. Max ${requestsPerMinute}/min`
        });
      }

      // Increment counter
      await redisClient.incr(key);

      next();
    } catch (error) {
      console.error('❌ Rate limiter error:', error);

      // ✅ NEVER block request if Redis fails
      next();
    }
  };
};

export default rateLimiter;