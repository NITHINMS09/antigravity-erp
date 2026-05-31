import NodeCache from 'node-cache';
import { Request, Response, NextFunction } from 'express';

// Cache for 5 minutes by default
export const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

export const cacheMiddleware = (duration?: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      next();
      return;
    }

    // Create a unique key based on URL and query params
    const key = `__express__${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      res.json(cachedResponse);
      return;
    }

    // Override res.json to store the response in cache before sending
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      // Store in cache
      cache.set(key, body, duration || 300);
      return originalJson(body);
    };

    next();
  };
};

export const clearCachePrefix = (prefix: string) => {
  const keys = cache.keys();
  const keysToDelete = keys.filter(k => k.includes(prefix));
  if (keysToDelete.length > 0) {
    cache.del(keysToDelete);
  }
};
