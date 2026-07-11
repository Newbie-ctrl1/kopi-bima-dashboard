import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("admin-session");
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (!session && !isLoginPage) {
    // Redirect to login page if no session
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && isLoginPage) {
    // Redirect to home if already logged in and trying to access login page
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Protect all paths except static assets, favicon, logo, etc.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Public images (webp, png, jpg, svg)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.webp|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};
