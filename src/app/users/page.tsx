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

  useEffect(() => {
    fetch("/api/data").then(r=>r.json()).then(d => {
      setUsers(d.users || []);
      setLoading(false);
    });
  }, []);

  async function toggleStatus(user: User) {
    setActionId(user.id);
    const action = user.is_active ? "deactivate" : "activate";
    try {
      await fetch("/api/data", {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ userId:user.id, action }),
      });
      setUsers(prev => prev.map(u => u.id===user.id ? {...u, is_active:!u.is_active} : u));
      alert(`${user.name} ${action}d successfully`);
    } catch { alert("Action failed. Please try again."); }
    setActionId(null);
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

  return (
    <AdminShell>
      <div style={{ padding:"32px 28px" }}>
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:24, fontWeight:600, color:"#fff", margin:0 }}>Users</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.3)", marginTop:4 }}>{filtered.length} of {users.length} users</p>
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
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 100px", padding:"12px 20px", borderBottom:`1px solid ${C.border}`, background:"rgba(255,255,255,0.02)" }}>
              {["User","Plan","Provider","Joined","Last Active","Status"].map(h=>(
                <p key={h} style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.3)", margin:0, letterSpacing:0.5, textTransform:"uppercase" }}>{h}</p>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding:"40px 20px", textAlign:"center" }}>
                <p style={{ fontSize:14, color:"rgba(255,255,255,0.3)", margin:0 }}>No users found</p>
              </div>
            ) : filtered.map((u, i) => (
              <div key={u.id} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 100px", padding:"14px 20px", borderBottom:i<filtered.length-1?`1px solid rgba(255,255,255,0.04)`:"none", alignItems:"center" }}>
                {/* User */}
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#C8541A,#B8922A)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:"#fff", flexShrink:0 }}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:500, color:"#fff", margin:0 }}>{u.name}</p>
                    <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", margin:0 }}>{u.email}</p>
                  </div>
                </div>
                {/* Plan */}
                <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:u.plan==="pro"?"rgba(200,84,26,0.2)":"rgba(255,255,255,0.06)", color:u.plan==="pro"?"#E8894A":"rgba(255,255,255,0.4)", display:"inline-block" }}>
                  {u.plan.toUpperCase()}
                </span>
                {/* Provider */}
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", margin:0, textTransform:"capitalize" }}>{u.provider}</p>
                {/* Joined */}
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:0 }}>{formatDate(u.created_at)}</p>
                {/* Last active */}
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:0 }}>{timeAgo(u.last_sign_in)}</p>
                {/* Toggle */}
                <button onClick={()=>toggleStatus(u)} disabled={actionId===u.id}
                  style={{ padding:"6px 12px", borderRadius:8, border:"none", background:u.is_active?"rgba(34,197,94,0.1)":"rgba(239,68,68,0.1)", color:u.is_active?"#22C55E":"#EF4444", fontSize:11, fontWeight:600, cursor:"pointer", opacity:actionId===u.id?0.5:1 }}>
                  {actionId===u.id?"…":u.is_active?"Active ✓":"Inactive ✗"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
