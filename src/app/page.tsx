import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { APPS } from "@/lib/apps";
import AppGrid from "@/components/AppGrid";
import ClientSwitcher from "@/components/ClientSwitcher";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "#050508", display: "flex", flexDirection: "column" }}>
        {/* Nav */}
        <header style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <img src="/ss-logo.svg" alt="Systemized Sales" style={{ height: "28px" }} />
              <span style={{ color: "#8ceb4c", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase" as const, fontWeight: 600, borderLeft: "1px solid rgba(140,235,76,0.3)", paddingLeft: "12px", marginLeft: "4px" }}>Portal</span>
            </div>
            <a href="/login" style={{ background: "rgba(140,235,76,0.1)", border: "1px solid rgba(140,235,76,0.3)", borderRadius: "8px", color: "#8ceb4c", fontSize: "13px", fontWeight: 600, padding: "8px 20px", textDecoration: "none" }}>Sign In</a>
          </div>
        </header>

        {/* Hero */}
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", maxWidth: "600px", padding: "24px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(140,235,76,0.08)", border: "1px solid rgba(140,235,76,0.2)", borderRadius: "100px", padding: "4px 14px", marginBottom: "24px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#8ceb4c" }} />
              <span style={{ color: "#8ceb4c", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" as const }}>Internal Platform</span>
            </div>
            <h1 style={{ fontSize: "48px", fontWeight: 700, color: "#fff", margin: "0 0 16px", lineHeight: 1.1 }}>Systemized Sales</h1>
            <p style={{ color: "#666", fontSize: "17px", margin: "0 0 40px", lineHeight: 1.6 }}>Your team&#39;s command center for playbooks, SOPs, dashboards, and performance tracking.</p>
            <a href="/login" style={{ display: "inline-block", background: "#8ceb4c", color: "#050508", fontSize: "14px", fontWeight: 700, padding: "14px 32px", borderRadius: "10px", textDecoration: "none", letterSpacing: "0.3px" }}>Sign in with Google →</a>
          </div>
        </main>

        {/* Footer */}
        <footer style={{ textAlign: "center", padding: "32px 24px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginBottom: "12px" }}>
            <a href="/privacy" style={{ color: "#444", fontSize: "12px", textDecoration: "none" }}>Privacy Policy</a>
            <a href="/terms" style={{ color: "#444", fontSize: "12px", textDecoration: "none" }}>Terms of Service</a>
          </div>
          <p style={{ color: "#333", fontSize: "12px", margin: 0 }}>© 2026 Systemized Sales LLC</p>
        </footer>
      </div>
    );
  }

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

  // Determine active client from cookie (admins only) or profile
  const cookieStore = await cookies();
  const cookieClient = cookieStore.get("active_client")?.value;
  const activeClient = isAdmin && cookieClient ? cookieClient : (profile?.client || "Budgetdog");

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

      {/* Admin Client Switcher */}
      {isAdmin && <ClientSwitcher activeClient={activeClient} />}

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
        <AppGrid apps={APPS} permittedSlugs={permittedSlugs} isAdmin={isAdmin} userRole={profile?.role ?? "manager"} userClient={profile?.client ?? null} activeClient={activeClient} />
      </main>

      <footer style={{ textAlign: "center", padding: "32px 24px", color: "#333", fontSize: "12px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        © {new Date().getFullYear()} Systemized Sales · Internal Portal
      </footer>
    </div>
  );
}
