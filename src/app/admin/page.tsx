import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { APPS } from "@/lib/apps"
import AdminPanel from "@/components/AdminPanel"
import AlertsPanel from "@/components/AlertsPanel"

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("manager_profiles").select("role").eq("user_id", user.id).single()
  if (profile?.role !== "admin") redirect("/")

  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

  // Fetch all users + all permissions via service key
  const [usersRes, permsRes, clientsRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/manager_profiles?select=*&order=created_at.desc`, {
      headers: { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}` },
    }),
    fetch(`${SUPABASE_URL}/rest/v1/user_permissions?select=*`, {
      headers: { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}` },
    }),
    fetch(`${SUPABASE_URL}/rest/v1/clients?select=*&order=name.asc`, {
      headers: { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}` },
      cache: "no-store",
    }),
  ])

  const users = await usersRes.json()
  const permissions = await permsRes.json()
  const clients = await clientsRes.json()

  return (
    <div>
      <AdminPanel users={users} permissions={permissions} apps={APPS} clients={clients} currentUserId={user.id} />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 48px" }}>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            🔔 Recurring Alerts
          </h2>
          <AlertsPanel clients={clients} />
        </div>
      </div>
    </div>
  )
}
