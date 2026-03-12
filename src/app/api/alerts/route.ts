import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const HEADERS = { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" }

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { data: profile } = await supabase.from("manager_profiles").select("role").eq("user_id", user.id).single()
  if (profile?.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 })

  const res = await fetch(`${SUPABASE_URL}/rest/v1/hub_alerts?order=created_at.desc`, { headers: HEADERS })
  const alerts = await res.json()
  return NextResponse.json(alerts)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { data: profile } = await supabase.from("manager_profiles").select("role,email").eq("user_id", user.id).single()
  if (profile?.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 })

  const body = await req.json()
  const payload = { ...body, created_by: profile.email }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/hub_alerts`, {
    method: "POST",
    headers: { ...HEADERS, "Prefer": "return=representation" },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) return NextResponse.json({ error: data }, { status: 500 })
  return NextResponse.json(data[0] || data)
}
