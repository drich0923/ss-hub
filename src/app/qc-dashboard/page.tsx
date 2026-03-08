import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import QCDashboardClient from "@/components/QCDashboardClient"

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

export default async function QCDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("manager_profiles").select("role").eq("user_id", user.id).single()
  if (!["admin","manager"].includes(profile?.role ?? "")) redirect("/")

  const [reportsRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/qc_reports?select=*&order=report_date.desc,created_at.desc&limit=200`, {
      headers: { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}` },
      cache: "no-store",
    }),
  ])
  const reports = await reportsRes.json()

  return <QCDashboardClient reports={reports} />
}
