import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SB = { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" }

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase.from("manager_profiles").select("role, client, rep_type").eq("user_id", user.id).single()
  if (!profile) return NextResponse.json([])

  // Fetch active alerts matching this user's client + role
  const alertsRes = await fetch(`${SUPABASE_URL}/rest/v1/hub_alerts?active=eq.true&order=created_at.desc`, { headers: SB })
  const allAlerts = await alertsRes.json()

  // Filter to alerts that target this user
  const myAlerts = allAlerts.filter((a: any) => {
    if (a.client !== profile.client) return false
    if (a.target_role === "all") return true
    if (a.target_role === "closer" && profile.rep_type === "closer") return true
    if (a.target_role === "setter" && profile.rep_type === "setter") return true
    if (a.target_role === "client" && profile.role === "client") return true
    return false
  })

  // Fetch read status
  const alertIds = myAlerts.map((a: any) => a.id)
  if (alertIds.length === 0) return NextResponse.json([])

  const readsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/hub_alert_reads?user_id=eq.${user.id}&alert_id=in.(${alertIds.join(",")})`,
    { headers: SB }
  )
  const reads = await readsRes.json()
  const readIds = new Set((reads || []).map((r: any) => r.alert_id))

  const enriched = myAlerts.map((a: any) => ({ ...a, is_read: readIds.has(a.id) }))
  return NextResponse.json(enriched)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { alert_id } = await req.json()
  await fetch(`${SUPABASE_URL}/rest/v1/hub_alert_reads`, {
    method: "POST",
    headers: { ...SB, "Prefer": "resolution=merge-duplicates" },
    body: JSON.stringify({ alert_id, user_id: user.id }),
  })
  return NextResponse.json({ ok: true })
}
