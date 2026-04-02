import { NextResponse, type NextRequest } from "next/server";
import { verifyValue } from "@/lib/session";

const PUBLIC_PATHS = ["/login", "/api/health"];

/**
 * Request proxy -- runs on every request.
 *
 * Verifies HMAC-signed session cookies for authenticated routes.
 * Public paths bypass the proxy. Invalid or missing sessions
 * redirect to /login (with cookie cleared on tampered sessions).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const session = request.cookies.get("session")?.value;
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const value = await verifyValue(session);
  if (!value) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("session");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
