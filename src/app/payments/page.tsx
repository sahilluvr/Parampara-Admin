"use client";
import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";

type Payment = { id:string; user:string; email:string; amount:number; plan:string; status:string; date:string; method:string; };

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<"all"|"captured"|"failed">("all");
  const [search, setSearch]     = useState("");

  useEffect(() => {
    fetch("/api/data").then(r=>r.json()).then(d => {
      setPayments(d.payments || []);
      setLoading(false);
    });
  }, []);

  const filtered = payments.filter(p => {
    const s = !search || p.user.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase());
    const f = filter==="all" || p.status===filter;
    return s && f;
  });

  const totalRevenue = filtered.filter(p=>p.status==="captured").reduce((s,p)=>s+p.amount,0);
  const border = "rgba(255,255,255,0.08)";

  return (
    <AdminShell>
      <div style={{ padding:"20px 16px" }}>
        <div style={{ marginBottom:20 }}>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:22, fontWeight:600, color:"#fff", margin:0 }}>Payments</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.3)", marginTop:4 }}>All transactions via Razorpay</p>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:20 }}>
          {[
            ["Total Revenue", `₹${totalRevenue.toLocaleString("en-IN")}`, "#22C55E"],
            ["Transactions", filtered.length, "#3B82F6"],
            ["Failed", filtered.filter(p=>p.status==="failed").length, "#EF4444"],
          ].map(([l,v,color])=>(
            <div key={l as string} style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${border}`, borderRadius:12, padding:"14px 12px" }}>
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"0 0 6px", textTransform:"uppercase", letterSpacing:0.5 }}>{l}</p>
              <p style={{ fontFamily:"Georgia,serif", fontSize:22, fontWeight:700, color:"#fff", margin:0 }}>{v}</p>
              <div style={{ height:2, background:color as string, borderRadius:2, marginTop:8 }}/>
            </div>
          ))}
        </div>

        {/* Razorpay link */}
        <div style={{ background:"rgba(200,84,26,0.08)", border:"1px solid rgba(200,84,26,0.2)", borderRadius:10, padding:"12px 16px", marginBottom:16, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.5)", margin:0 }}>Full payment history in Razorpay</p>
          <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer"
            style={{ fontSize:12, fontWeight:600, color:"#E8894A", textDecoration:"none", whiteSpace:"nowrap" }}>Open Razorpay →</a>
        </div>

        {/* Search + filter */}
        <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
            style={{ flex:1, minWidth:150, padding:"9px 12px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, fontSize:13, color:"#fff", outline:"none" }}/>
          <div style={{ display:"flex", gap:4 }}>
            {(["all","captured","failed"] as const).map(f=>(
              <button key={f} onClick={()=>setFilter(f)}
                style={{ padding:"8px 12px", borderRadius:8, border:`1px solid ${filter===f?"#C8541A":"rgba(255,255,255,0.1)"}`, background:filter===f?"rgba(200,84,26,0.15)":"transparent", color:filter===f?"#E8894A":"rgba(255,255,255,0.4)", fontSize:11, fontWeight:600, cursor:"pointer" }}>
                {f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? <p style={{ color:"rgba(255,255,255,0.4)" }}>Loading…</p> : filtered.length === 0 ? (
          <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${border}`, borderRadius:14, padding:"40px 20px", textAlign:"center" }}>
            <p style={{ fontSize:32, marginBottom:8 }}>💳</p>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.3)", margin:0 }}>No payments yet</p>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.2)", marginTop:6 }}>Real transactions will appear here once Razorpay env vars are added to Vercel</p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="mob">
              {filtered.map(p => (
                <div key={p.id} style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${border}`, borderRadius:12, padding:16, marginBottom:10 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                    <div>
                      <p style={{ fontSize:14, fontWeight:600, color:"#fff", margin:0 }}>{p.user}</p>
                      <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", margin:0 }}>{p.email}</p>
                    </div>
                    <p style={{ fontSize:18, fontWeight:700, color:"#22C55E", margin:0 }}>₹{p.amount.toLocaleString("en-IN")}</p>
                  </div>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)", background:"rgba(255,255,255,0.06)", padding:"3px 8px", borderRadius:6 }}>{p.plan}</span>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)", background:"rgba(255,255,255,0.06)", padding:"3px 8px", borderRadius:6 }}>{p.method}</span>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)", background:"rgba(255,255,255,0.06)", padding:"3px 8px", borderRadius:6 }}>{p.date}</span>
                    <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:20, background:p.status==="captured"?"rgba(34,197,94,0.15)":"rgba(239,68,68,0.15)", color:p.status==="captured"?"#22C55E":"#EF4444" }}>{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop table */}
            <div className="desk" style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${border}`, borderRadius:14, overflow:"hidden" }}>
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 80px", padding:"12px 20px", borderBottom:`1px solid ${border}`, background:"rgba(255,255,255,0.02)" }}>
                {["User","Amount","Plan","Method","Date","Status"].map(h=>(
                  <p key={h} style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.3)", margin:0, textTransform:"uppercase", letterSpacing:0.5 }}>{h}</p>
                ))}
              </div>
              {filtered.map((p,i) => (
                <div key={p.id} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 80px", padding:"14px 20px", borderBottom:i<filtered.length-1?`1px solid rgba(255,255,255,0.04)`:"none", alignItems:"center" }}>
                  <div>
                    <p style={{ fontSize:13, fontWeight:500, color:"#fff", margin:0 }}>{p.user}</p>
                    <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", margin:0 }}>{p.email}</p>
                  </div>
                  <p style={{ fontSize:14, fontWeight:700, color:"#22C55E", margin:0 }}>₹{p.amount.toLocaleString("en-IN")}</p>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", margin:0 }}>{p.plan}</p>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:0 }}>{p.method}</p>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:0 }}>{p.date}</p>
                  <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:20, background:p.status==="captured"?"rgba(34,197,94,0.15)":"rgba(239,68,68,0.15)", color:p.status==="captured"?"#22C55E":"#EF4444", display:"inline-block" }}>{p.status}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <style>{`
        .mob { display:none; } .desk { display:block; }
        @media (max-width: 767px) { .mob { display:block; } .desk { display:none; } }
      `}</style>
    </AdminShell>
  );
}
