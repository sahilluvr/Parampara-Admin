"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("sahilaggarwal43@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/");
        router.refresh();
      } else {
        setError(data.error || "Invalid credentials. Check email and password.");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
      console.error(err);
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight:"100vh", background:"#0A0A0F", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:380 }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:48, marginBottom:10 }}>🪔</div>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:26, fontWeight:700, color:"#fff", margin:0 }}>Parampara Admin</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.3)", marginTop:6 }}>Restricted — authorised personnel only</p>
        </div>

        <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"28px 24px" }}>
          {error && (
            <div style={{ background:"rgba(220,38,38,0.12)", border:"1px solid rgba(220,38,38,0.3)", borderRadius:8, padding:"11px 14px", marginBottom:16, fontSize:13, color:"#FCA5A5", lineHeight:1.5 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <label style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.4)", display:"block", marginBottom:6, letterSpacing:0.5 }}>EMAIL</label>
            <input
              type="email" value={email}
              onChange={e=>setEmail(e.target.value)} required
              style={{ width:"100%", padding:"11px 14px", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:9, fontSize:14, color:"#fff", outline:"none", marginBottom:14, boxSizing:"border-box" }}
            />

            <label style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.4)", display:"block", marginBottom:6, letterSpacing:0.5 }}>PASSWORD</label>
            <div style={{ position:"relative", marginBottom:22 }}>
              <input
                type={showPass ? "text" : "password"} value={password}
                onChange={e=>setPassword(e.target.value)} required
                placeholder="Enter password"
                style={{ width:"100%", padding:"11px 44px 11px 14px", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:9, fontSize:14, color:"#fff", outline:"none", boxSizing:"border-box" }}
              />
              <button type="button" onClick={()=>setShowPass(v=>!v)}
                style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.35)", fontSize:14, padding:0 }}>
                {showPass ? "🙈" : "👁"}
              </button>
            </div>

            <button type="submit" disabled={loading}
              style={{ width:"100%", padding:"13px", background:"linear-gradient(135deg,#C8541A,#B8922A)", border:"none", borderRadius:10, fontSize:14, fontWeight:700, color:"#fff", cursor:"pointer", opacity:loading?0.7:1, transition:"opacity 0.2s" }}>
              {loading ? "Signing in…" : "Sign in to Admin →"}
            </button>
          </form>
        </div>

        <p style={{ textAlign:"center", fontSize:11, color:"rgba(255,255,255,0.15)", marginTop:16 }}>
          Parampara Admin Portal · Secured access
        </p>
      </div>
    </div>
  );
}
