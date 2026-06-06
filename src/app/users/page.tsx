"use client";
import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";

type User = { id:string; email:string; name:string; created_at:string; last_sign_in:string|null; provider:string; is_active:boolean; plan:string; };

const C = { border:"rgba(255,255,255,0.08)", saffron:"#C8541A" };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all"|"active"|"inactive"|"pro"|"free">("all");
  const [actionId, setActionId] = useState<string|null>(null);
  const [planActionId, setPlanActionId] = useState<string|null>(null);
  const [toast, setToast] = useState<string|null>(null);

  useEffect(() => {
    fetch("/api/data").then(r=>r.json()).then(d => {
      setUsers(d.users || []);
      setLoading(false);
    });
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function toggleStatus(user: User) {
    setActionId(user.id);
    const action = user.is_active ? "deactivate" : "activate";
    try {
      await fetch("/api/data", {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ userId:user.id, action }),
      });
      setUsers(prev => prev.map(u => u.id===user.id ? {...u, is_active:!u.is_active} : u));
      showToast(`${user.name} ${action}d ✓`);
    } catch { showToast("Action failed ✗"); }
    setActionId(null);
  }

  async function togglePlan(user: User) {
    setPlanActionId(user.id);
    const newPlan = user.plan === "pro" ? "free" : "pro";
    try {
      const res = await fetch("/api/data", {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ userId:user.id, action:"set_plan", plan:newPlan }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => u.id===user.id ? {...u, plan:newPlan} : u));
        showToast(`${user.name} moved to ${newPlan.toUpperCase()} ✓`);
      } else {
        showToast("Plan update failed ✗");
      }
    } catch { showToast("Plan update failed ✗"); }
    setPlanActionId(null);
  }

  const filtered = users.filter(u => {
    const matchSearch = !search || u.email.toLowerCase().includes(search.toLowerCase()) || u.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter==="all" || (filter==="active"&&u.is_active) || (filter==="inactive"&&!u.is_active) || (filter==="pro"&&u.plan==="pro") || (filter==="free"&&u.plan==="free");
    return matchSearch && matchFilter;
  });

  function formatDate(d:string|null) {
    if (!d) return "Never";
    return new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
  }
  function timeAgo(d:string|null) {
    if (!d) return "Never";
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff/60000);
    if (mins<60) return `${mins}m ago`;
    const hrs = Math.floor(mins/60);
    if (hrs<24) return `${hrs}h ago`;
    return `${Math.floor(hrs/24)}d ago`;
  }

  const proCount = users.filter(u=>u.plan==="pro").length;
  const freeCount = users.filter(u=>u.plan==="free").length;

  return (
    <AdminShell>
      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", top:20, right:20, background:toast.includes("✓")?"#22C55E":"#EF4444", color:"#fff", padding:"12px 20px", borderRadius:10, fontSize:13, fontWeight:600, zIndex:999, boxShadow:"0 4px 20px rgba(0,0,0,0.3)" }}>
          {toast}
        </div>
      )}

      <div style={{ padding:"32px 28px" }}>
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:24, fontWeight:600, color:"#fff", margin:0 }}>Users</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.3)", marginTop:4 }}>{filtered.length} of {users.length} users · {proCount} Pro · {freeCount} Free</p>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
          {[
            { label:"Total", value:users.length, color:"#3B82F6" },
            { label:"Active", value:users.filter(u=>u.is_active).length, color:"#22C55E" },
            { label:"Pro", value:proCount, color:"#C8541A" },
            { label:"Free", value:freeCount, color:"#71717A" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:10, padding:"14px 16px" }}>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", margin:"0 0 4px", textTransform:"uppercase", letterSpacing:0.5 }}>{label}</p>
              <p style={{ fontFamily:"Georgia,serif", fontSize:26, fontWeight:700, color:"#fff", margin:0 }}>{value}</p>
              <div style={{ height:2, background:color, borderRadius:2, marginTop:8, width:`${Math.round((value/Math.max(users.length,1))*100)}%` }}/>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or email…"
            style={{ flex:1, minWidth:200, padding:"10px 14px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, fontSize:13, color:"#fff", outline:"none" }}/>
          <div style={{ display:"flex", gap:6 }}>
            {(["all","active","inactive","pro","free"] as const).map(f=>(
              <button key={f} onClick={()=>setFilter(f)}
                style={{ padding:"9px 14px", borderRadius:9, border:`1px solid ${filter===f?"#C8541A":"rgba(255,255,255,0.1)"}`, background:filter===f?"rgba(200,84,26,0.15)":"transparent", color:filter===f?"#E8894A":"rgba(255,255,255,0.4)", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                {f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? <p style={{ color:"rgba(255,255,255,0.4)", fontSize:14 }}>Loading users…</p> : (
          <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden" }}>
            {/* Header */}
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 120px 120px", padding:"12px 20px", borderBottom:`1px solid ${C.border}`, background:"rgba(255,255,255,0.02)" }}>
              {["User","Provider","Joined","Last Active","Plan","Status"].map(h=>(
                <p key={h} style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.3)", margin:0, letterSpacing:0.5, textTransform:"uppercase" }}>{h}</p>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding:"40px 20px", textAlign:"center" }}>
                <p style={{ fontSize:14, color:"rgba(255,255,255,0.3)", margin:0 }}>No users found</p>
              </div>
            ) : filtered.map((u, i) => (
              <div key={u.id} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 120px 120px", padding:"14px 20px", borderBottom:i<filtered.length-1?`1px solid rgba(255,255,255,0.04)`:"none", alignItems:"center", background:u.id==="u1"?"rgba(200,84,26,0.04)":"transparent" }}>
                {/* User */}
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:u.plan==="pro"?"linear-gradient(135deg,#C8541A,#B8922A)":"rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:"#fff", flexShrink:0 }}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:500, color:"#fff", margin:0 }}>{u.name}</p>
                    <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", margin:0 }}>{u.email}</p>
                  </div>
                </div>
                {/* Provider */}
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", margin:0, textTransform:"capitalize" }}>{u.provider}</p>
                {/* Joined */}
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:0 }}>{formatDate(u.created_at)}</p>
                {/* Last active */}
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:0 }}>{timeAgo(u.last_sign_in)}</p>

                {/* Plan toggle */}
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:u.plan==="pro"?"#D4A843":"rgba(255,255,255,0.4)", minWidth:28 }}>
                    {u.plan==="pro"?"PRO":"FREE"}
                  </span>
                  <button
                    onClick={()=>togglePlan(u)}
                    disabled={planActionId===u.id}
                    title={`Switch to ${u.plan==="pro"?"Free":"Pro"}`}
                    style={{
                      width:44, height:24, borderRadius:12, border:"none",
                      background:u.plan==="pro"?"linear-gradient(135deg,#C8541A,#B8922A)":"rgba(255,255,255,0.12)",
                      cursor:"pointer", position:"relative", transition:"background 0.2s",
                      opacity:planActionId===u.id?0.5:1, flexShrink:0,
                    }}>
                    <div style={{
                      position:"absolute", top:2,
                      left:u.plan==="pro"?22:2,
                      width:20, height:20, borderRadius:"50%",
                      background:"#fff", transition:"left 0.2s",
                      boxShadow:"0 1px 4px rgba(0,0,0,0.3)",
                    }}/>
                  </button>
                </div>

                {/* Active toggle */}
                <button onClick={()=>toggleStatus(u)} disabled={actionId===u.id}
                  style={{ padding:"6px 12px", borderRadius:8, border:"none", background:u.is_active?"rgba(34,197,94,0.1)":"rgba(239,68,68,0.1)", color:u.is_active?"#22C55E":"#EF4444", fontSize:11, fontWeight:600, cursor:"pointer", opacity:actionId===u.id?0.5:1, width:90 }}>
                  {actionId===u.id ? "…" : u.is_active ? "Active ✓" : "Inactive ✗"}
                </button>
              </div>
            ))}
          </div>
        )}

        <p style={{ fontSize:12, color:"rgba(255,255,255,0.2)", marginTop:16 }}>
          ⚡ Plan changes take effect when the user next logs in — their localStorage updates automatically.
        </p>
      </div>
    </AdminShell>
  );
}
