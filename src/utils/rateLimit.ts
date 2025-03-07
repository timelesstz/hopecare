import { NextApiRequest, NextApiResponse } from 'next';
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

interface RateLimitOptions {
  windowMs: number;
  max: number;
}

export const rateLimit = (options: RateLimitOptions) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const key = `rate-limit:${req.headers['x-forwarded-for'] || req.socket.remoteAddress}`;
    
    try {
      // Get current count
      const current = await redis.get(key);
      const currentCount = current ? parseInt(current) : 0;

      if (currentCount >= options.max) {
        res.setHeader('Retry-After', Math.ceil(options.windowMs / 1000));
        throw new Error('Too many requests');
      }

      // Increment count
      if (currentCount === 0) {
        await redis.setex(key, Math.ceil(options.windowMs / 1000), '1');
      } else {
        await redis.incr(key);
      }

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', options.max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, options.max - (currentCount + 1)));
      res.setHeader('X-RateLimit-Reset', Math.ceil(options.windowMs / 1000));

    } catch (error) {
      if (error.message === 'Too many requests') {
        return res.status(429).json({
          error: 'Too many requests, please try again later'
        });
      }
      throw error;
    }
  };
}; 