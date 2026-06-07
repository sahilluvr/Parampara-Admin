"use client";
import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";

type User = { id:string; email:string; name:string; created_at:string; last_sign_in:string|null; provider:string; is_active:boolean; plan:string; };

export default function UsersPage() {
  const [users, setUsers]     = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState<"all"|"active"|"inactive"|"pro"|"free">("all");
  const [actionId, setActionId]   = useState<string|null>(null);
  const [planId, setPlanId]       = useState<string|null>(null);
  const [toast, setToast]         = useState<string|null>(null);

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
    const res = await fetch("/api/data", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ userId:user.id, action }) });
    const data = await res.json();
    if (data.success) {
      setUsers(prev => prev.map(u => u.id===user.id ? {...u, is_active:!u.is_active} : u));
      showToast(`${user.name} ${action}d ✓`);
    }
    setActionId(null);
  }

  async function togglePlan(user: User) {
    setPlanId(user.id);
    const newPlan = user.plan === "pro" ? "free" : "pro";
    const res = await fetch("/api/data", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ userId:user.id, action:"set_plan", plan:newPlan }) });
    const data = await res.json();
    if (data.success) {
      setUsers(prev => prev.map(u => u.id===user.id ? {...u, plan:newPlan} : u));
      showToast(`${user.name} → ${newPlan.toUpperCase()} ✓`);
    }
    setPlanId(null);
  }

  const filtered = users.filter(u => {
    const s = !search || u.email.toLowerCase().includes(search.toLowerCase()) || u.name.toLowerCase().includes(search.toLowerCase());
    const f = filter==="all" || (filter==="active"&&u.is_active) || (filter==="inactive"&&!u.is_active) || (filter==="pro"&&u.plan==="pro") || (filter==="free"&&u.plan==="free");
    return s && f;
  });

  function timeAgo(d:string|null) {
    if (!d) return "Never";
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff/60000);
    if (mins<60) return `${mins}m ago`;
    const hrs = Math.floor(mins/60);
    if (hrs<24) return `${hrs}h ago`;
    return `${Math.floor(hrs/24)}d ago`;
  }
  function fmtDate(d:string) { return new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short"}); }

  const border = "rgba(255,255,255,0.08)";
  const pro = users.filter(u=>u.plan==="pro").length;
  const free = users.filter(u=>u.plan==="free").length;

  return (
    <AdminShell>
      {toast && (
        <div style={{ position:"fixed", top:20, right:20, background:toast.includes("✓")?"#22C55E":"#EF4444", color:"#fff", padding:"12px 20px", borderRadius:10, fontSize:13, fontWeight:600, zIndex:999 }}>
          {toast}
        </div>
      )}

      <div style={{ padding:"20px 16px" }}>
        <div style={{ marginBottom:20 }}>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:22, fontWeight:600, color:"#fff", margin:0 }}>Users</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.3)", marginTop:4 }}>{filtered.length} of {users.length} · {pro} Pro · {free} Free</p>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
          {[["Total",users.length,"#3B82F6"],["Active",users.filter(u=>u.is_active).length,"#22C55E"],["Pro",pro,"#C8541A"],["Free",free,"#71717A"]].map(([l,v,color])=>(
            <div key={l as string} style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${border}`, borderRadius:10, padding:"12px 10px", textAlign:"center" }}>
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"0 0 4px", textTransform:"uppercase" }}>{l}</p>
              <p style={{ fontFamily:"Georgia,serif", fontSize:22, fontWeight:700, color:"#fff", margin:0 }}>{v}</p>
              <div style={{ height:2, background:color as string, borderRadius:2, marginTop:6 }}/>
            </div>
          ))}
        </div>

        {/* Search + filter */}
        <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
            style={{ flex:1, minWidth:150, padding:"9px 12px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, fontSize:13, color:"#fff", outline:"none" }}/>
          <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
            {(["all","active","inactive","pro","free"] as const).map(f=>(
              <button key={f} onClick={()=>setFilter(f)}
                style={{ padding:"8px 12px", borderRadius:8, border:`1px solid ${filter===f?"#C8541A":"rgba(255,255,255,0.1)"}`, background:filter===f?"rgba(200,84,26,0.15)":"transparent", color:filter===f?"#E8894A":"rgba(255,255,255,0.4)", fontSize:11, fontWeight:600, cursor:"pointer" }}>
                {f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Users list — mobile cards on small screens, table on large */}
        {loading ? <p style={{ color:"rgba(255,255,255,0.4)" }}>Loading…</p> : (
          <>
            {/* Mobile cards */}
            <div className="mobile-cards">
              {filtered.map(u => (
                <div key={u.id} style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${border}`, borderRadius:12, padding:16, marginBottom:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                    <div style={{ width:40, height:40, borderRadius:"50%", background:u.plan==="pro"?"linear-gradient(135deg,#C8541A,#B8922A)":"rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:700, color:"#fff", flexShrink:0 }}>
                      {u.name.charAt(0)}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:14, fontWeight:600, color:"#fff", margin:0 }}>{u.name}</p>
                      <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email}</p>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)", background:"rgba(255,255,255,0.06)", padding:"3px 8px", borderRadius:6 }}>{u.provider}</span>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)", background:"rgba(255,255,255,0.06)", padding:"3px 8px", borderRadius:6 }}>Joined {fmtDate(u.created_at)}</span>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)", background:"rgba(255,255,255,0.06)", padding:"3px 8px", borderRadius:6 }}>{timeAgo(u.last_sign_in)}</span>
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    {/* Plan toggle */}
                    <div style={{ display:"flex", alignItems:"center", gap:6, flex:1 }}>
                      <span style={{ fontSize:11, fontWeight:700, color:u.plan==="pro"?"#D4A843":"rgba(255,255,255,0.35)" }}>{u.plan.toUpperCase()}</span>
                      <button onClick={()=>togglePlan(u)} disabled={planId===u.id}
                        style={{ width:40, height:22, borderRadius:11, border:"none", background:u.plan==="pro"?"linear-gradient(135deg,#C8541A,#B8922A)":"rgba(255,255,255,0.12)", cursor:"pointer", position:"relative", opacity:planId===u.id?0.5:1 }}>
                        <div style={{ position:"absolute", top:2, left:u.plan==="pro"?20:2, width:18, height:18, borderRadius:"50%", background:"#fff", transition:"left 0.2s" }}/>
                      </button>
                    </div>
                    {/* Status toggle */}
                    <button onClick={()=>toggleStatus(u)} disabled={actionId===u.id}
                      style={{ padding:"6px 14px", borderRadius:8, border:"none", background:u.is_active?"rgba(34,197,94,0.1)":"rgba(239,68,68,0.1)", color:u.is_active?"#22C55E":"#EF4444", fontSize:11, fontWeight:600, cursor:"pointer", opacity:actionId===u.id?0.5:1 }}>
                      {actionId===u.id?"…":u.is_active?"Active ✓":"Inactive ✗"}
                    </button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <p style={{ color:"rgba(255,255,255,0.3)", textAlign:"center", padding:"32px 0" }}>No users found</p>}
            </div>

            {/* Desktop table */}
            <div className="desktop-table" style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${border}`, borderRadius:14, overflow:"hidden" }}>
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 120px 120px", padding:"12px 20px", borderBottom:`1px solid ${border}`, background:"rgba(255,255,255,0.02)" }}>
                {["User","Provider","Joined","Last Active","Plan","Status"].map(h=>(
                  <p key={h} style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.3)", margin:0, textTransform:"uppercase", letterSpacing:0.5 }}>{h}</p>
                ))}
              </div>
              {filtered.length === 0 ? (
                <p style={{ color:"rgba(255,255,255,0.3)", textAlign:"center", padding:"32px 20px" }}>No users found</p>
              ) : filtered.map((u,i) => (
                <div key={u.id} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 120px 120px", padding:"14px 20px", borderBottom:i<filtered.length-1?`1px solid rgba(255,255,255,0.04)`:"none", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:36, height:36, borderRadius:"50%", background:u.plan==="pro"?"linear-gradient(135deg,#C8541A,#B8922A)":"rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:"#fff", flexShrink:0 }}>{u.name.charAt(0)}</div>
                    <div>
                      <p style={{ fontSize:13, fontWeight:500, color:"#fff", margin:0 }}>{u.name}</p>
                      <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", margin:0 }}>{u.email}</p>
                    </div>
                  </div>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", margin:0 }}>{u.provider}</p>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:0 }}>{fmtDate(u.created_at)}</p>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:0 }}>{timeAgo(u.last_sign_in)}</p>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:u.plan==="pro"?"#D4A843":"rgba(255,255,255,0.35)" }}>{u.plan.toUpperCase()}</span>
                    <button onClick={()=>togglePlan(u)} disabled={planId===u.id}
                      style={{ width:40, height:22, borderRadius:11, border:"none", background:u.plan==="pro"?"linear-gradient(135deg,#C8541A,#B8922A)":"rgba(255,255,255,0.12)", cursor:"pointer", position:"relative", opacity:planId===u.id?0.5:1 }}>
                      <div style={{ position:"absolute", top:2, left:u.plan==="pro"?20:2, width:18, height:18, borderRadius:"50%", background:"#fff", transition:"left 0.2s" }}/>
                    </button>
                  </div>
                  <button onClick={()=>toggleStatus(u)} disabled={actionId===u.id}
                    style={{ padding:"6px 12px", borderRadius:8, border:"none", background:u.is_active?"rgba(34,197,94,0.1)":"rgba(239,68,68,0.1)", color:u.is_active?"#22C55E":"#EF4444", fontSize:11, fontWeight:600, cursor:"pointer", opacity:actionId===u.id?0.5:1 }}>
                    {actionId===u.id?"…":u.is_active?"Active ✓":"Inactive ✗"}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.2)", marginTop:14 }}>⚡ Plan changes take effect on next login</p>
      </div>

      <style>{`
        .mobile-cards { display: none; }
        .desktop-table { display: block; }
        @media (max-width: 767px) {
          .mobile-cards { display: block; }
          .desktop-table { display: none; }
        }
      `}</style>
    </AdminShell>
  );
}
