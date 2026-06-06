import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({ users: MOCK_USERS, payments: MOCK_PAYMENTS, stats: MOCK_STATS });
  }

  try {
    const sb = createClient(url, key);
    const { data: authUsers } = await sb.auth.admin.listUsers();
    const users = (authUsers?.users || []).map(u => ({
      id: u.id,
      email: u.email || "",
      name: u.user_metadata?.name || u.email?.split("@")[0] || "User",
      created_at: u.created_at,
      last_sign_in: u.last_sign_in_at || null,
      provider: u.app_metadata?.provider || "email",
      is_active: !u.banned_until,
      plan: u.user_metadata?.plan || "free",
    }));

    const { count: familyCount } = await sb.from("families").select("*", { count:"exact", head:true });
    const proUsers = users.filter(u => u.plan === "pro").length;

    return NextResponse.json({
      users,
      payments: MOCK_PAYMENTS,
      stats: {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.is_active).length,
        proUsers,
        freeUsers: users.length - proUsers,
        totalRevenue: proUsers * 499,
        mrr: proUsers * 499,
        totalFamilies: familyCount || 0,
        totalRituals: 0,
      }
    });
  } catch (err) {
    console.error("Data fetch error:", err);
    return NextResponse.json({ users: MOCK_USERS, payments: MOCK_PAYMENTS, stats: MOCK_STATS });
  }
}

export async function PATCH(req: Request) {
  const { userId, action, plan } = await req.json();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    // Mock mode — return success so UI updates
    return NextResponse.json({ success: true, mock: true });
  }

  try {
    const sb = createClient(url, key);

    if (action === "deactivate") {
      await sb.auth.admin.updateUserById(userId, { ban_duration: "876600h" });
    } else if (action === "activate") {
      await sb.auth.admin.updateUserById(userId, { ban_duration: "none" });
    } else if (action === "set_plan") {
      // Store plan in user metadata — app reads this on login
      await sb.auth.admin.updateUserById(userId, {
        user_metadata: { plan: plan || "free" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin action error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

const MOCK_USERS = [
  { id:"u1", email:"sahilaggarwal43@gmail.com",  name:"Sahil Aggarwal",  created_at:"2026-06-01T10:00:00Z", last_sign_in:"2026-06-05T09:00:00Z", provider:"google", is_active:true,  plan:"pro"  },
  { id:"u2", email:"priya.sharma@gmail.com",      name:"Priya Sharma",   created_at:"2026-06-02T11:30:00Z", last_sign_in:"2026-06-04T14:00:00Z", provider:"email",  is_active:true,  plan:"free" },
  { id:"u3", email:"rahul.patel@outlook.com",     name:"Rahul Patel",    created_at:"2026-06-02T14:00:00Z", last_sign_in:"2026-06-03T08:00:00Z", provider:"email",  is_active:true,  plan:"pro"  },
  { id:"u4", email:"ananya.singh@gmail.com",      name:"Ananya Singh",   created_at:"2026-06-03T09:15:00Z", last_sign_in:"2026-06-03T09:15:00Z", provider:"google", is_active:true,  plan:"free" },
  { id:"u5", email:"vikram.mehta@yahoo.com",      name:"Vikram Mehta",   created_at:"2026-06-03T16:00:00Z", last_sign_in:null,                    provider:"email",  is_active:false, plan:"free" },
];

const MOCK_PAYMENTS = [
  { id:"pay_001", user:"Rahul Patel",    email:"rahul.patel@outlook.com",   amount:499,  plan:"Pro Monthly", status:"captured", date:"2026-06-02", method:"UPI"  },
  { id:"pay_002", user:"Sahil Aggarwal", email:"sahilaggarwal43@gmail.com",  amount:499,  plan:"Pro Monthly", status:"captured", date:"2026-06-01", method:"Card" },
  { id:"pay_003", user:"Ananya Singh",   email:"ananya.singh@gmail.com",     amount:4999, plan:"Pro Yearly",  status:"captured", date:"2026-05-28", method:"UPI"  },
];

const MOCK_STATS = {
  totalUsers:5, activeUsers:4, proUsers:2, freeUsers:3,
  totalRevenue:5997, mrr:998, totalFamilies:8, totalRituals:23,
};
