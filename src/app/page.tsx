import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { APPS } from "@/lib/apps";
import AppGrid from "@/components/AppGrid";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get user profile + permissions
  const { data: profile } = await supabase
    .from("manager_profiles")
    .select("role, email, client")
    .eq("user_id", user.id)
    .single();

  const { data: permissions } = await supabase
    .from("user_permissions")
    .select("app_slug")
    .eq("user_id", user.id);

  const permittedSlugs = permissions?.map(p => p.app_slug) ?? [];
  const isAdmin = profile?.role === "admin";

  return (
    <div style={{ minHeight: "100vh", background: "#050508" }}>
      {/* Header */}
      <header style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.02)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src="/ss-logo.svg" alt="Systemized Sales" style={{ height: "28px" }} />
            <span style={{
              color: "#8ceb4c",
              fontSize: "11px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              fontWeight: 600,
              borderLeft: "1px solid rgba(140,235,76,0.3)",
              paddingLeft: "12px",
              marginLeft: "4px",
            }}>
              Portal
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {isAdmin && (
              <a href="/admin" style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#8ceb4c",
                fontSize: "12px",
                textDecoration: "none",
                fontWeight: 600,
                letterSpacing: "0.5px",
                background: "rgba(140,235,76,0.08)",
                border: "1px solid rgba(140,235,76,0.2)",
                borderRadius: "6px",
                padding: "6px 12px",
              }}>
                ⚙ Settings
              </a>
            )}
            <span style={{ color: "#666", fontSize: "13px" }}>{profile?.email ?? user.email}</span>
<a href="/api/auth/signout" style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px",
                color: "#aaa",
                fontSize: "12px",
                padding: "6px 12px",
                cursor: "pointer",
                textDecoration: "none",
              }}>
                Sign out
              </a>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px" }}>
        {/* Greeting */}
        <div style={{ marginBottom: "48px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(140,235,76,0.08)",
            border: "1px solid rgba(140,235,76,0.2)",
            borderRadius: "100px",
            padding: "4px 12px",
            marginBottom: "16px",
          }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#8ceb4c" }} />
            <span style={{ color: "#8ceb4c", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>
              All Systems Operational
            </span>
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: 700, margin: "0 0 8px", color: "#fff" }}>
            Welcome back
          </h1>
          <p style={{ color: "#555", fontSize: "15px", margin: 0 }}>
            Select an app below to get started
          </p>
        </div>

        {/* App Grid */}
        <AppGrid apps={APPS} permittedSlugs={permittedSlugs} isAdmin={isAdmin} userRole={profile?.role ?? "manager"} userClient={profile?.client ?? null} />
      </main>

      <footer style={{ textAlign: "center", padding: "32px 24px", color: "#333", fontSize: "12px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        © {new Date().getFullYear()} Systemized Sales · Internal Portal
      </footer>
    </div>
  );
}
