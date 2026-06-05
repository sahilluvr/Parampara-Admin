"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) router.push("/");
      else setError(data.error || "Invalid credentials");
    } catch { setError("Login failed"); }
    setLoading(false);
  }

  return (
    <div style={{ minHeight:"100vh", background:"#0A0A0F", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:380 }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:40, marginBottom:8 }}>🪔</div>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:24, fontWeight:700, color:"#fff", margin:0 }}>Parampara Admin</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.3)", marginTop:6 }}>Restricted access — authorised personnel only</p>
        </div>

        <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"28px 24px" }}>
          {error && (
            <div style={{ background:"rgba(220,38,38,0.1)", border:"1px solid rgba(220,38,38,0.3)", borderRadius:8, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#F87171" }}>
              {error}
            </div>
          )}
          <form onSubmit={handleLogin}>
            <label style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.5)", display:"block", marginBottom:6 }}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
              style={{ width:"100%", padding:"11px 14px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, fontSize:14, color:"#fff", outline:"none", marginBottom:14, boxSizing:"border-box" }}/>
            <label style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.5)", display:"block", marginBottom:6 }}>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required
              style={{ width:"100%", padding:"11px 14px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, fontSize:14, color:"#fff", outline:"none", marginBottom:20, boxSizing:"border-box" }}/>
            <button type="submit" disabled={loading}
              style={{ width:"100%", padding:"12px", background:"linear-gradient(135deg,#C8541A,#B8922A)", border:"none", borderRadius:10, fontSize:14, fontWeight:700, color:"#fff", cursor:"pointer", opacity:loading?0.7:1 }}>
              {loading ? "Signing in…" : "Sign in →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
