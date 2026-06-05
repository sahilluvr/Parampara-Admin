import { NextRequest, NextResponse } from "next/server";

const ADMIN_EMAIL = "sahilaggarwal43@gmail.com";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/login" || pathname.startsWith("/api/")) return NextResponse.next();

  const session = req.cookies.get("admin_session")?.value;
  if (!session || session !== ADMIN_EMAIL) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
