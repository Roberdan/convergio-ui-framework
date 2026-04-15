import { NextResponse, type NextRequest } from "next/server";

/**
 * Request proxy -- runs on every request.
 * Auth disabled — all routes are public.
 */
export async function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
