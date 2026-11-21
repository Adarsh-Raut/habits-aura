import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type LimitResult = { success: boolean; remaining: number; reset: number };
type Limiter = { limit: (key: string) => Promise<LimitResult> };

const hasRedis =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

// Without Upstash credentials (e.g. local dev) rate limiting is disabled.
const noopLimiter: Limiter = {
  limit: async () => ({ success: true, remaining: 999, reset: Date.now() }),
};

function createLimiter(requests: number, prefix: string): Limiter {
  if (!hasRedis) return noopLimiter;
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(requests, "1 m"),
    analytics: false,
    prefix,
  });
}

export const habitToggleLimiter = createLimiter(30, "habits-aura-toggle");
export const habitDeleteLimiter = createLimiter(10, "habits-aura-delete");
export const habitCreateLimiter = createLimiter(10, "habits-aura-create");
export const habitUpdateLimiter = createLimiter(20, "habits-aura-update");
