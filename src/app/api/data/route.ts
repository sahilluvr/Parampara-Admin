import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Return mock data when Supabase not configured
    return NextResponse.json({
      users: MOCK_USERS,
      payments: MOCK_PAYMENTS,
      stats: {
        totalUsers: 12,
        activeUsers: 9,
        proUsers: 3,
        freeUsers: 9,
        totalRevenue: 1497,
        mrr: 499,
        totalFamilies: 18,
        totalRituals: 47,
      }
    });
  }

  try {
    const sb = createClient(url, key);
    // Fetch users from auth
    const { data: authUsers } = await sb.auth.admin.listUsers();
    const users = (authUsers?.users || []).map(u => ({
      id: u.id,
      email: u.email || "",
      name: u.user_metadata?.name || u.email?.split("@")[0] || "User",
      created_at: u.created_at,
      last_sign_in: u.last_sign_in_at || null,
      provider: u.app_metadata?.provider || "email",
      is_active: !u.banned_until,
      plan: "free", // update when you have a plans table
    }));

    // Fetch families count
    const { count: familyCount } = await sb.from("families").select("*", { count:"exact", head:true });

    return NextResponse.json({
      users,
      payments: MOCK_PAYMENTS, // replace with real Razorpay data
      stats: {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.is_active).length,
        proUsers: 0,
        freeUsers: users.length,
        totalRevenue: 0,
        mrr: 0,
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
  const { userId, action } = await req.json();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ success: true, mock: true });

  const sb = createClient(url, key);
  if (action === "deactivate") {
    await sb.auth.admin.updateUserById(userId, { ban_duration: "876600h" });
  } else if (action === "activate") {
    await sb.auth.admin.updateUserById(userId, { ban_duration: "none" });
  }
  return NextResponse.json({ success: true });
}

const MOCK_USERS = [
  { id:"u1", email:"sahilaggarwal43@gmail.com",  name:"Sahil Aggarwal",  created_at:"2026-06-01T10:00:00Z", last_sign_in:"2026-06-05T09:00:00Z", provider:"google", is_active:true,  plan:"pro"  },
  { id:"u2", email:"priya.sharma@gmail.com",       name:"Priya Sharma",    created_at:"2026-06-02T11:30:00Z", last_sign_in:"2026-06-04T14:00:00Z", provider:"email",  is_active:true,  plan:"free" },
  { id:"u3", email:"rahul.patel@outlook.com",      name:"Rahul Patel",     created_at:"2026-06-02T14:00:00Z", last_sign_in:"2026-06-03T08:00:00Z", provider:"email",  is_active:true,  plan:"pro"  },
  { id:"u4", email:"ananya.singh@gmail.com",       name:"Ananya Singh",    created_at:"2026-06-03T09:15:00Z", last_sign_in:"2026-06-03T09:15:00Z", provider:"google", is_active:true,  plan:"free" },
  { id:"u5", email:"vikram.mehta@yahoo.com",       name:"Vikram Mehta",    created_at:"2026-06-03T16:00:00Z", last_sign_in:null,                    provider:"email",  is_active:false, plan:"free" },
];

const MOCK_PAYMENTS = [
  { id:"pay_001", user:"Rahul Patel",    email:"rahul.patel@outlook.com",  amount:499,  plan:"Pro Monthly", status:"captured", date:"2026-06-02", method:"UPI"  },
  { id:"pay_002", user:"Sahil Aggarwal", email:"sahilaggarwal43@gmail.com", amount:499,  plan:"Pro Monthly", status:"captured", date:"2026-06-01", method:"Card" },
  { id:"pay_003", user:"Ananya Singh",   email:"ananya.singh@gmail.com",    amount:4999, plan:"Pro Yearly",  status:"captured", date:"2026-05-28", method:"UPI"  },
];

const MOCK_STATS = {
  totalUsers:5, activeUsers:4, proUsers:2, freeUsers:3,
  totalRevenue:5997, mrr:998, totalFamilies:8, totalRituals:23,
};
