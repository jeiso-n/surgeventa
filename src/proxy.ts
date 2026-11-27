import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE_NAMES = [
  "surgeventa.session_token",
  "__Secure-surgeventa.session_token",
];

/**
 * Next.js 16 Proxy performing optimistic cookie-presence checks for protected
 * workspace routes. Authoritative database session validation is STILL enforced
 * inside every protected Server Component and API Route Handler.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = SESSION_COOKIE_NAMES.some((name) =>
    Boolean(request.cookies.get(name)?.value),
  );

  const isProtectedWorkspace =
    pathname === "/" || pathname.startsWith("/settings");

  if (isProtectedWorkspace && !hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("reason", "auth_required");
    if (pathname !== "/") {
      loginUrl.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/settings/:path*"],
};
