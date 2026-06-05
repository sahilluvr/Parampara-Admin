import { NextRequest, NextResponse } from "next/server";

const ADMIN_EMAIL    = "sahilaggarwal43@gmail.com";
const ADMIN_PASSWORD = "8988353532";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    console.log("Login attempt:", email, password === ADMIN_PASSWORD ? "correct" : "wrong");

    if (
      email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
      String(password).trim() === ADMIN_PASSWORD
    ) {
      const res = NextResponse.json({ success: true });
      res.cookies.set("admin_session", ADMIN_EMAIL, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 8, // 8 hours
        path: "/",
      });
      return res;
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch (err) {
    console.error("Auth error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete("admin_session");
  return res;
}
