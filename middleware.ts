import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  console.log(`Middleware: Path: ${pathname}, Token exists: ${!!token}`);

  // Allow requests to /api/auth/* to pass through
  if (pathname.startsWith("/api/auth")) {
    console.log("Middleware: Allowing /api/auth/* request to pass through");
    return NextResponse.next();
  }

  // If token exists, allow the user to access any route
  if (token && pathname === "/signin") {
    console.log(
      "Middleware: Redirecting authenticated user away from /api/auth/signin"
    );
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If no token, redirect unauthenticated users to the sign-in page
  if (!token && pathname !== "/signin") {
    console.log(
      "Middleware: Redirecting unauthenticated user to /api/auth/signin"
    );
    return NextResponse.redirect(new URL("/api/auth/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
