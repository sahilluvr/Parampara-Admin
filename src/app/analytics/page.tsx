"use client";
import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";

const C = { border:"rgba(255,255,255,0.08)" };

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Record<string,number>|null>(null);

  useEffect(() => {
    fetch("/api/data").then(r=>r.json()).then(d => setStats(d.stats));
  }, []);

  const METRICS = stats ? [
    { label:"Conversion Rate",    value:`${stats.proUsers&&stats.totalUsers?((stats.proUsers/stats.totalUsers)*100).toFixed(1):0}%`, sub:"Free → Pro",       color:"#C8541A" },
    { label:"Avg Revenue/User",   value:`₹${stats.proUsers?Math.round(stats.mrr/stats.proUsers):0}`,  sub:"Per paying user",   color:"#22C55E" },
    { label:"User Growth",        value:"+"+stats.totalUsers,  sub:"Total signups",     color:"#3B82F6" },
    { label:"Active Rate",        value:`${stats.totalUsers?Math.round((stats.activeUsers/stats.totalUsers)*100):0}%`, sub:"Active / total", color:"#8B5CF6" },
    { label:"Avg Rituals/Family", value:stats.totalFamilies?Math.round(stats.totalRituals/stats.totalFamilies):0, sub:"Content depth", color:"#F59E0B" },
    { label:"Families/User",      value:stats.totalUsers?Math.round(stats.totalFamilies/stats.totalUsers*10)/10:0, sub:"Avg per user", color:"#06B6D4" },
  ] : [];

  return (
    <AdminShell>
      <div style={{ padding:"32px 28px" }}>
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:24, fontWeight:600, color:"#fff", margin:0 }}>Analytics</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.3)", marginTop:4 }}>Key performance metrics</p>
        </div>

        {stats && (
          <>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:32 }}>
              {METRICS.map(({ label, value, sub, color }) => (
                <div key={label} style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:14, padding:"20px", position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:color }}/>
                  <p style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.35)", margin:"0 0 8px", textTransform:"uppercase", letterSpacing:0.5 }}>{label}</p>
                  <p style={{ fontFamily:"Georgia,serif", fontSize:36, fontWeight:700, color:"#fff", margin:0, lineHeight:1 }}>{value}</p>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,0.25)", margin:"6px 0 0" }}>{sub}</p>
                </div>
              ))}
            </div>

            {/* Growth chart placeholder */}
            <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${C.border}`, borderRadius:14, padding:24, marginBottom:20 }}>
              <p style={{ fontSize:14, fontWeight:600, color:"#fff", margin:"0 0 16px" }}>Growth Overview</p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
                {[
                  { period:"This week", users:stats.totalUsers, color:"#3B82F6" },
                  { period:"Free users", users:stats.freeUsers, color:"#71717A" },
                  { period:"Pro users", users:stats.proUsers, color:"#C8541A" },
                  { period:"Families", users:stats.totalFamilies, color:"#8B5CF6" },
                ].map(({ period, users, color }) => (
                  <div key={period} style={{ textAlign:"center", padding:16, background:"rgba(255,255,255,0.03)", borderRadius:10 }}>
                    <div style={{ height:4, background:color, borderRadius:2, marginBottom:10 }}/>
                    <p style={{ fontFamily:"Georgia,serif", fontSize:28, fontWeight:700, color:"#fff", margin:0 }}>{users}</p>
                    <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", margin:"4px 0 0" }}>{period}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* External links */}
            <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
              <p style={{ fontSize:14, fontWeight:600, color:"#fff", margin:"0 0 14px" }}>Deep Analytics</p>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", margin:"0 0 14px", lineHeight:1.7 }}>
                For detailed analytics, connect these tools:
              </p>
              {[
                { label:"Vercel Analytics",  href:"https://vercel.com/analytics",       desc:"Page views, web vitals, visitors"      },
                { label:"Supabase Dashboard",href:"https://supabase.com/dashboard",     desc:"Database queries, auth metrics"        },
                { label:"Razorpay Analytics",href:"https://dashboard.razorpay.com",     desc:"Revenue, payment success rate"         },
                { label:"Resend Dashboard",  href:"https://resend.com",                 desc:"Email open rates, delivery stats"      },
              ].map(({ label, href, desc }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", borderRadius:9, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", textDecoration:"none", marginBottom:6 }}>
                  <div>
                    <p style={{ fontSize:13, fontWeight:500, color:"#fff", margin:0 }}>{label}</p>
                    <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", margin:0 }}>{desc}</p>
                  </div>
                  <span style={{ fontSize:12, color:"#E8894A" }}>→</span>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}
