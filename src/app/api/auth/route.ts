import { NextRequest, NextResponse } from "next/server";

const ADMIN_EMAIL    = "sahilaggarwal43@gmail.com";
const ADMIN_PASSWORD = "8988353532";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const res = NextResponse.json({ success: true });
    res.cookies.set("admin_session", ADMIN_EMAIL, {
      httpOnly: true, secure: true, sameSite: "lax",
      maxAge: 60 * 60 * 8,
      path: "/",
    });
    return res;
  }
  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete("admin_session");
  return res;
}
