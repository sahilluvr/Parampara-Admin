"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href:"/",          emoji:"📊", label:"Dashboard"  },
  { href:"/users",     emoji:"👥", label:"Users"       },
  { href:"/payments",  emoji:"💳", label:"Payments"    },
  { href:"/analytics", emoji:"📈", label:"Analytics"   },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await fetch("/api/auth", { method:"DELETE" });
    router.push("/login");
  }

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#0A0A0F" }}>
      {/* Sidebar */}
      <aside style={{ width:220, background:"rgba(255,255,255,0.03)", borderRight:"1px solid rgba(255,255,255,0.06)", display:"flex", flexDirection:"column", flexShrink:0 }}>
        {/* Logo */}
        <div style={{ padding:"20px 20px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#C8541A,#B8922A)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🪔</div>
            <div>
              <p style={{ fontSize:14, fontWeight:700, color:"#fff", margin:0, fontFamily:"Georgia,serif" }}>Parampara</p>
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", margin:0, letterSpacing:1 }}>ADMIN PORTAL</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"12px 10px" }}>
          {NAV.map(({ href, emoji, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} style={{
                display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
                borderRadius:9, marginBottom:2, textDecoration:"none", fontSize:13,
                background: active ? "rgba(200,84,26,0.15)" : "transparent",
                color: active ? "#E8894A" : "rgba(255,255,255,0.5)",
                fontWeight: active ? 600 : 400,
                borderLeft: `3px solid ${active ? "#C8541A" : "transparent"}`,
                transition:"all 0.15s",
              }}>
                <span style={{ fontSize:16 }}>{emoji}</span>{label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding:"12px 10px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ padding:"10px 12px", marginBottom:8 }}>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)", margin:0 }}>Signed in as</p>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.6)", margin:"2px 0 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>sahilaggarwal43@gmail.com</p>
          </div>
          <button onClick={handleSignOut} disabled={signingOut}
            style={{ width:"100%", padding:"9px 12px", background:"rgba(220,38,38,0.1)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:8, fontSize:12, color:"#F87171", cursor:"pointer", textAlign:"left" }}>
            {signingOut ? "Signing out…" : "🚪 Sign out"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex:1, overflowY:"auto" }}>{children}</main>
    </div>
  );
}
