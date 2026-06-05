import type { Metadata } from "next";
export const metadata: Metadata = { title: "Parampara Admin", description: "Admin Portal" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body style={{ margin:0, fontFamily:"Inter,system-ui,sans-serif", background:"#0A0A0F" }}>{children}</body></html>;
}
