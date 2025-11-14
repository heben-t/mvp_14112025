import { Redis } from '@upstash/redis';

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const DEFAULT_TTL = 60 * 5;

export async function getCached<T>(
  key: string,
  fallback: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  if (!redis) {
    return fallback();
  }

  try {
    const cached = await redis.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fallback();
    await redis.setex(key, ttl, JSON.stringify(data));
    return data;
  } catch (error) {
    console.error('Cache error:', error);
    return fallback();
  }
}

export async function setCache<T>(
  key: string,
  value: T,
  ttl: number = DEFAULT_TTL
): Promise<void> {
  if (!redis) return;

  try {
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

export async function invalidateCache(key: string): Promise<void> {
  if (!redis) return;

  try {
    await redis.del(key);
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

export async function invalidateCachePattern(pattern: string): Promise<void> {
  if (!redis) return;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Cache pattern invalidation error:', error);
  }
}

export function getCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return `${prefix}:${parts.join(':')}`;
}

export const CacheKeys = {
  campaign: (id: string) => getCacheKey('campaign', id),
  campaigns: (filters: string) => getCacheKey('campaigns', filters),
  recommendations: (userId: string) => getCacheKey('recommendations', userId),
  investorMetrics: (userId: string) => getCacheKey('metrics', 'investor', userId),
  startupMetrics: (userId: string) => getCacheKey('metrics', 'startup', userId),
  investments: (userId: string, type: 'investor' | 'startup') => 
    getCacheKey('investments', type, userId),
};

// Simple in-memory cache for external metrics
const inMemoryCache = new Map<string, { data: any; expires: number }>();

export const metricsCache = {
  get: (key: string) => {
    const item = inMemoryCache.get(key);
    if (!item || item.expires < Date.now()) {
      inMemoryCache.delete(key);
      return null;
    }
    return item.data;
  },
  set: (key: string, data: any, ttlSeconds: number = 300) => {
    inMemoryCache.set(key, {
      data,
      expires: Date.now() + ttlSeconds * 1000,
    });
  },
  delete: (key: string) => {
    inMemoryCache.delete(key);
  },
};
