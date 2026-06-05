"use client";
import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";

type Stats = { totalUsers:number; activeUsers:number; proUsers:number; freeUsers:number; totalRevenue:number; mrr:number; totalFamilies:number; totalRituals:number; };

const C = { border:"rgba(255,255,255,0.08)", saffron:"#C8541A", gold:"#B8922A", green:"#22C55E", red:"#EF4444", blue:"#3B82F6" };

function StatCard({ label, value, sub, color, emoji }: { label:string; value:string|number; sub?:string; color:string; emoji:string }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:14, padding:"20px 20px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:color }}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
        <p style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.4)", margin:0, letterSpacing:0.5, textTransform:"uppercase" }}>{label}</p>
        <span style={{ fontSize:20 }}>{emoji}</span>
      </div>
      <p style={{ fontFamily:"Georgia,serif", fontSize:36, fontWeight:700, color:"#fff", margin:0, lineHeight:1 }}>{value}</p>
      {sub && <p style={{ fontSize:12, color:"rgba(255,255,255,0.3)", margin:"6px 0 0" }}>{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats|null>(null);
  const [recentUsers, setRecentUsers] = useState<{email:string;name:string;plan:string;created_at:string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/data").then(r=>r.json()).then(d => {
      setStats(d.stats);
      setRecentUsers((d.users||[]).slice(0,5));
      setLoading(false);
    });
  }, []);

  function formatDate(d:string) { return new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}); }

  return (
    <AdminShell>
      <div style={{ padding:"32px 28px", maxWidth:1100, margin:"0 auto" }}>
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:26, fontWeight:600, color:"#fff", margin:0 }}>Dashboard</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.3)", marginTop:4 }}>Welcome back, Sahil. Here&apos;s what&apos;s happening.</p>
        </div>

        {loading ? (
          <p style={{ color:"rgba(255,255,255,0.4)", fontSize:14 }}>Loading…</p>
        ) : stats && (
          <>
            {/* Stats grid */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:32 }}>
              <StatCard label="Total Users"     value={stats.totalUsers}    sub={`${stats.activeUsers} active`}    color={C.blue}    emoji="👥"/>
              <StatCard label="Pro Users"       value={stats.proUsers}      sub={`${stats.freeUsers} on free`}     color={C.saffron} emoji="✨"/>
              <StatCard label="MRR"             value={`₹${stats.mrr}`}     sub="Monthly recurring"                color={C.green}   emoji="💰"/>
              <StatCard label="Total Revenue"   value={`₹${stats.totalRevenue}`} sub="All time"                  color={C.gold}    emoji="📈"/>
              <StatCard label="Family Spaces"   value={stats.totalFamilies} sub="Created by users"               color="#8B5CF6"   emoji="🏠"/>
              <StatCard label="Rituals Logged"  value={stats.totalRituals}  sub="Across all families"            color="#06B6D4"   emoji="📜"/>
            </div>

            {/* Two col */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
              {/* Recent users */}
              <div style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <p style={{ fontSize:14, fontWeight:600, color:"#fff", margin:0 }}>Recent Signups</p>
                  <a href="/users" style={{ fontSize:12, color:"#E8894A", textDecoration:"none" }}>View all →</a>
                </div>
                {recentUsers.map(u => (
                  <div key={u.email} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:`1px solid rgba(255,255,255,0.05)` }}>
                    <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#C8541A,#B8922A)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#fff", flexShrink:0 }}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:500, color:"#fff", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.name}</p>
                      <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", margin:0 }}>{formatDate(u.created_at)}</p>
                    </div>
                    <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, background:u.plan==="pro"?"rgba(200,84,26,0.2)":"rgba(255,255,255,0.06)", color:u.plan==="pro"?"#E8894A":"rgba(255,255,255,0.35)" }}>
                      {u.plan.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Quick actions */}
              <div style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
                <p style={{ fontSize:14, fontWeight:600, color:"#fff", margin:"0 0 16px" }}>Quick Actions</p>
                {[
                  { label:"View all users", href:"/users", emoji:"👥", color:"#3B82F6" },
                  { label:"View payments", href:"/payments", emoji:"💳", color:"#22C55E" },
                  { label:"Analytics overview", href:"/analytics", emoji:"📈", color:"#8B5CF6" },
                  { label:"Open live site", href:"https://ourparampara.com", emoji:"🌐", color:"#06B6D4", ext:true },
                  { label:"Open Supabase", href:"https://supabase.com/dashboard", emoji:"🗄️", color:"#F59E0B", ext:true },
                  { label:"Open Razorpay", href:"https://dashboard.razorpay.com", emoji:"💰", color:"#C8541A", ext:true },
                ].map(({ label, href, emoji, color, ext }) => (
                  <a key={label} href={href} target={ext?"_blank":"_self"} rel="noopener noreferrer"
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:9, textDecoration:"none", marginBottom:4, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize:16 }}>{emoji}</span>
                    <span style={{ fontSize:13, color:"rgba(255,255,255,0.6)", flex:1 }}>{label}</span>
                    <span style={{ fontSize:10, color }}>→</span>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}
