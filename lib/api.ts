import { NextResponse } from "next/server";

type LimitResult = { success: boolean; remaining: number; reset: number };

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function notFound() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

/** Returns a 429 response when the limit was hit, otherwise null. */
export function rateLimitResponse({ success, remaining, reset }: LimitResult) {
  if (success) return null;

  const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return NextResponse.json(
    { error: "Too many requests. Please try again later.", retryAfter },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfter.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
      },
    },
  );
}

/** Parses a JSON body, returning null when it is missing or malformed. */
export async function readJson(req: Request): Promise<unknown | null> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
