import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const habitToggleLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  analytics: true,
  prefix: "habits-aura-toggle",
});

export const habitDeleteLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "habits-aura-delete",
});

export const habitCreateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "habits-aura-create",
});
