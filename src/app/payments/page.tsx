"use client";
import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";

type Payment = { id:string; user:string; email:string; amount:number; plan:string; status:string; date:string; method:string; };

const C = { border:"rgba(255,255,255,0.08)" };

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all"|"captured"|"failed">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/data").then(r=>r.json()).then(d => {
      setPayments(d.payments || []);
      setLoading(false);
    });
  }, []);

  const filtered = payments.filter(p => {
    const matchSearch = !search || p.user.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter==="all" || p.status===filter;
    return matchSearch && matchFilter;
  });

  const totalRevenue = filtered.reduce((sum,p) => p.status==="captured"?sum+p.amount:sum, 0);

  return (
    <AdminShell>
      <div style={{ padding:"32px 28px" }}>
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:24, fontWeight:600, color:"#fff", margin:0 }}>Payments</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.3)", marginTop:4 }}>All transactions via Razorpay</p>
        </div>

        {/* Summary cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
          {[
            { label:"Total Revenue", value:`₹${filtered.reduce((s,p)=>p.status==="captured"?s+p.amount:s,0).toLocaleString("en-IN")}`, color:"#22C55E" },
            { label:"Transactions", value:filtered.length, color:"#3B82F6" },
            { label:"Failed", value:filtered.filter(p=>p.status==="failed").length, color:"#EF4444" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:12, padding:"16px 20px" }}>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", margin:"0 0 6px", textTransform:"uppercase", letterSpacing:0.5, fontWeight:600 }}>{label}</p>
              <p style={{ fontFamily:"Georgia,serif", fontSize:28, fontWeight:700, color:"#fff", margin:0 }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Razorpay link */}
        <div style={{ background:"rgba(200,84,26,0.08)", border:"1px solid rgba(200,84,26,0.2)", borderRadius:10, padding:"12px 16px", marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.5)", margin:0 }}>View complete payment history and refund management in Razorpay dashboard</p>
          <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer"
            style={{ fontSize:12, fontWeight:600, color:"#E8894A", textDecoration:"none", whiteSpace:"nowrap", marginLeft:16 }}>
            Open Razorpay →
          </a>
        </div>

        {/* Controls */}
        <div style={{ display:"flex", gap:12, marginBottom:16, flexWrap:"wrap" }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or email…"
            style={{ flex:1, minWidth:200, padding:"10px 14px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, fontSize:13, color:"#fff", outline:"none" }}/>
          <div style={{ display:"flex", gap:6 }}>
            {(["all","captured","failed"] as const).map(f=>(
              <button key={f} onClick={()=>setFilter(f)}
                style={{ padding:"9px 14px", borderRadius:9, border:`1px solid ${filter===f?"#C8541A":"rgba(255,255,255,0.1)"}`, background:filter===f?"rgba(200,84,26,0.15)":"transparent", color:filter===f?"#E8894A":"rgba(255,255,255,0.4)", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                {f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? <p style={{ color:"rgba(255,255,255,0.4)", fontSize:14 }}>Loading payments…</p> : (
          <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden" }}>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 80px", padding:"12px 20px", borderBottom:`1px solid ${C.border}`, background:"rgba(255,255,255,0.02)" }}>
              {["User","Amount","Plan","Method","Date","Status"].map(h=>(
                <p key={h} style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.3)", margin:0, letterSpacing:0.5, textTransform:"uppercase" }}>{h}</p>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding:"40px 20px", textAlign:"center" }}>
                <p style={{ fontSize:14, color:"rgba(255,255,255,0.3)", margin:0 }}>No payments found</p>
              </div>
            ) : filtered.map((p, i) => (
              <div key={p.id} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 80px", padding:"14px 20px", borderBottom:i<filtered.length-1?`1px solid rgba(255,255,255,0.04)`:"none", alignItems:"center" }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:500, color:"#fff", margin:0 }}>{p.user}</p>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", margin:0 }}>{p.email}</p>
                </div>
                <p style={{ fontSize:14, fontWeight:700, color:"#22C55E", margin:0 }}>₹{p.amount.toLocaleString("en-IN")}</p>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", margin:0 }}>{p.plan}</p>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:0 }}>{p.method}</p>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:0 }}>{p.date}</p>
                <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:20, background:p.status==="captured"?"rgba(34,197,94,0.15)":"rgba(239,68,68,0.15)", color:p.status==="captured"?"#22C55E":"#EF4444", display:"inline-block" }}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
