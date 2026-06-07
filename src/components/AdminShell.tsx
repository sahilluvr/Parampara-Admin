"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href:"/",          emoji:"📊", label:"Dashboard" },
  { href:"/users",     emoji:"👥", label:"Users"     },
  { href:"/payments",  emoji:"💳", label:"Payments"  },
  { href:"/analytics", emoji:"📈", label:"Analytics" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname   = usePathname();
  const router     = useRouter();
  const [open, setOpen]       = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Close menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  async function handleSignOut() {
    setSigningOut(true);
    await fetch("/api/auth", { method:"DELETE" });
    router.push("/login");
  }

  const Sidebar = () => (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      {/* Logo */}
      <div style={{ padding:"20px 20px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#C8541A,#B8922A)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🪔</div>
          <div>
            <p style={{ fontSize:14, fontWeight:700, color:"#fff", margin:0, fontFamily:"Georgia,serif" }}>Parampara</p>
            <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", margin:0, letterSpacing:1 }}>ADMIN PORTAL</p>
          </div>
        </div>
        {/* Close button on mobile */}
        <button onClick={()=>setOpen(false)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", cursor:"pointer", fontSize:20, display:"flex", padding:4 }}>✕</button>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:"12px 10px" }}>
        {NAV.map(({ href, emoji, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} onClick={()=>setOpen(false)} style={{
              display:"flex", alignItems:"center", gap:12, padding:"12px 14px",
              borderRadius:10, marginBottom:4, textDecoration:"none", fontSize:14,
              background: active ? "rgba(200,84,26,0.15)" : "transparent",
              color: active ? "#E8894A" : "rgba(255,255,255,0.5)",
              fontWeight: active ? 600 : 400,
              borderLeft: `3px solid ${active ? "#C8541A" : "transparent"}`,
            }}>
              <span style={{ fontSize:20 }}>{emoji}</span>{label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding:"12px 10px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ padding:"10px 12px", marginBottom:8, background:"rgba(255,255,255,0.03)", borderRadius:8 }}>
          <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", margin:0 }}>Signed in as</p>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.6)", margin:"2px 0 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>sahilaggarwal43@gmail.com</p>
        </div>
        <button onClick={handleSignOut} disabled={signingOut}
          style={{ width:"100%", padding:"10px 12px", background:"rgba(220,38,38,0.1)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:8, fontSize:13, color:"#F87171", cursor:"pointer", textAlign:"left", fontWeight:500 }}>
          {signingOut ? "Signing out…" : "🚪 Sign out"}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#0A0A0F" }}>

      {/* Desktop sidebar */}
      <aside style={{ width:220, background:"rgba(255,255,255,0.03)", borderRight:"1px solid rgba(255,255,255,0.06)", flexShrink:0, display:"flex", flexDirection:"column" }}
        className="desktop-sidebar">
        <Sidebar/>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div style={{ position:"fixed", inset:0, zIndex:300 }}>
          {/* Backdrop */}
          <div onClick={()=>setOpen(false)} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.7)" }}/>
          {/* Drawer */}
          <aside style={{ position:"absolute", top:0, left:0, bottom:0, width:260, background:"#13131A", borderRight:"1px solid rgba(255,255,255,0.08)", display:"flex", flexDirection:"column", zIndex:1 }}>
            <Sidebar/>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>

        {/* Mobile top bar */}
        <div style={{ padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(255,255,255,0.02)" }}
          className="mobile-topbar">
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <button onClick={()=>setOpen(true)}
              style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"8px 10px", cursor:"pointer", color:"rgba(255,255,255,0.7)", fontSize:18, display:"flex", lineHeight:1 }}>
              ☰
            </button>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:26, height:26, borderRadius:"50%", background:"linear-gradient(135deg,#C8541A,#B8922A)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>🪔</div>
              <p style={{ fontSize:14, fontWeight:700, color:"#fff", margin:0, fontFamily:"Georgia,serif" }}>Parampara Admin</p>
            </div>
          </div>
          {/* Active page indicator */}
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)", margin:0 }}>
            {NAV.find(n=>n.href===pathname)?.emoji} {NAV.find(n=>n.href===pathname)?.label}
          </p>
        </div>

        {/* Mobile bottom nav */}
        <main style={{ flex:1, overflowY:"auto" }}>{children}</main>
        <nav style={{ borderTop:"1px solid rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.03)", display:"flex", padding:"8px 0 12px" }}
          className="mobile-bottomnav">
          {NAV.map(({ href, emoji, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, textDecoration:"none", padding:"6px 4px", color: active ? "#E8894A" : "rgba(255,255,255,0.35)" }}>
                <span style={{ fontSize:22 }}>{emoji}</span>
                <span style={{ fontSize:10, fontWeight:active?700:400 }}>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .mobile-topbar { display: none !important; }
          .mobile-bottomnav { display: none !important; }
        }
        @media (max-width: 767px) {
          .desktop-sidebar { display: none !important; }
        }
      `}</style>
    </div>
  );
}
