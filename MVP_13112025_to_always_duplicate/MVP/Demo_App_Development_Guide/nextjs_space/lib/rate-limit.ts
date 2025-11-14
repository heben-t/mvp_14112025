import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
      prefix: '@upstash/ratelimit',
    })
  : null;

const strictRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '60 s'),
      analytics: true,
      prefix: '@upstash/ratelimit/strict',
    })
  : null;

export async function rateLimit(
  request: NextRequest,
  identifier?: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number } | null> {
  if (!ratelimit) {
    return null;
  }

  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous';
  const id = identifier || ip;

  const { success, limit, remaining, reset } = await ratelimit.limit(id);

  return { success, limit, remaining, reset };
}

export async function strictRateLimit(
  request: NextRequest,
  identifier?: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number } | null> {
  if (!strictRatelimit) {
    return null;
  }

  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous';
  const id = identifier || ip;

  const { success, limit, remaining, reset } = await strictRatelimit.limit(id);

  return { success, limit, remaining, reset };
}

export function rateLimitResponse(
  limit: number,
  remaining: number,
  reset: number
): NextResponse {
  return NextResponse.json(
    {
      error: 'Too many requests',
      message: 'Please try again later',
    },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      },
    }
  );
}

export async function withRateLimit<T>(
  request: NextRequest,
  handler: () => Promise<T>,
  identifier?: string,
  strict: boolean = false
): Promise<T | NextResponse> {
  const limiter = strict ? strictRateLimit : rateLimit;
  const result = await limiter(request, identifier);

  if (result && !result.success) {
    return rateLimitResponse(result.limit, result.remaining, result.reset);
  }

  return handler();
}
