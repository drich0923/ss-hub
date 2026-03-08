import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { APPS } from "@/lib/apps"
import AdminPanel from "@/components/AdminPanel"

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("manager_profiles").select("role").eq("user_id", user.id).single()
  if (profile?.role !== "admin") redirect("/")

  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

  // Fetch all users + all permissions via service key
  const [usersRes, permsRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/manager_profiles?select=*&order=created_at.desc`, {
      headers: { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}` },
    }),
    fetch(`${SUPABASE_URL}/rest/v1/user_permissions?select=*`, {
      headers: { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}` },
    }),
  ])

  const users = await usersRes.json()
  const permissions = await permsRes.json()

  return <AdminPanel users={users} permissions={permissions} apps={APPS} currentUserId={user.id} />
}
