import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const rzpKeyId     = process.env.RAZORPAY_KEY_ID;
  const rzpKeySecret = process.env.RAZORPAY_KEY_SECRET;

  let users    = MOCK_USERS;
  let payments: Payment[] = [];
  let stats    = { ...MOCK_STATS };

  // ── Fetch real users from Supabase ──
  if (supabaseUrl && serviceKey) {
    try {
      const sb = createClient(supabaseUrl, serviceKey);
      const { data: authData } = await sb.auth.admin.listUsers();
      if (authData?.users?.length) {
        users = authData.users.map(u => ({
          id:           u.id,
          email:        u.email || "",
          name:         u.user_metadata?.name || u.email?.split("@")[0] || "User",
          created_at:   u.created_at,
          last_sign_in: u.last_sign_in_at || null,
          provider:     u.app_metadata?.provider || "email",
          is_active:    !u.banned_until,
          plan:         u.user_metadata?.plan || "free",
        }));
      }
      const { count: familyCount } = await sb.from("families").select("*", { count:"exact", head:true });
      const proUsers = users.filter(u => u.plan === "pro").length;
      stats = {
        totalUsers:    users.length,
        activeUsers:   users.filter(u => u.is_active).length,
        proUsers,
        freeUsers:     users.length - proUsers,
        totalRevenue:  0, // filled from Razorpay below
        mrr:           proUsers * 499,
        totalFamilies: familyCount || 0,
        totalRituals:  0,
      };
    } catch (err) { console.error("Supabase error:", err); }
  }

  // ── Fetch real payments from Razorpay ──
  if (rzpKeyId && rzpKeySecret) {
    try {
      const creds = Buffer.from(`${rzpKeyId}:${rzpKeySecret}`).toString("base64");
      const res = await fetch("https://api.razorpay.com/v1/payments?count=100&expand[]=customer", {
        headers: { "Authorization": `Basic ${creds}`, "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        const rzpPayments = data.items || [];
        payments = rzpPayments.map((p: RzpPayment) => ({
          id:     p.id,
          user:   p.email?.split("@")[0] || p.contact || "Customer",
          email:  p.email || "",
          amount: Math.round(p.amount / 100), // paise to rupees
          plan:   p.amount >= 4000 ? "Pro Yearly" : "Pro Monthly",
          status: p.status,
          date:   new Date(p.created_at * 1000).toISOString().split("T")[0],
          method: p.method || "—",
        }));
        stats.totalRevenue = payments
          .filter(p => p.status === "captured")
          .reduce((sum, p) => sum + p.amount, 0);
      }
    } catch (err) { console.error("Razorpay error:", err); }
  }

  // If no real payments fetched, show empty (not mock)
  return NextResponse.json({ users, payments, stats });
}

export async function PATCH(req: Request) {
  const { userId, action, plan } = await req.json();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ success: true, mock: true });

  try {
    const sb = createClient(url, key);
    if (action === "deactivate") {
      await sb.auth.admin.updateUserById(userId, { ban_duration: "876600h" });
    } else if (action === "activate") {
      await sb.auth.admin.updateUserById(userId, { ban_duration: "none" });
    } else if (action === "set_plan") {
      await sb.auth.admin.updateUserById(userId, { user_metadata: { plan: plan || "free" } });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── Types ──
type User    = { id:string; email:string; name:string; created_at:string; last_sign_in:string|null; provider:string; is_active:boolean; plan:string; };
type Payment = { id:string; user:string; email:string; amount:number; plan:string; status:string; date:string; method:string; };
type RzpPayment = { id:string; amount:number; status:string; method:string; email:string; contact:string; created_at:number; };

// ── Mock data — shown only when env vars not configured ──
const MOCK_USERS: User[] = [];  // Empty — no fake users shown

const MOCK_STATS = {
  totalUsers:0, activeUsers:0, proUsers:0, freeUsers:0,
  totalRevenue:0, mrr:0, totalFamilies:0, totalRituals:0,
};
