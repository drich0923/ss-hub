import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const HEADERS = { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" }

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase.from("manager_profiles").select("role").eq("user_id", user.id).single()
  return profile?.role === "admin"
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Admin only" }, { status: 403 })
  const { id } = await params
  const body = await req.json()

  const res = await fetch(`${SUPABASE_URL}/rest/v1/hub_alerts?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...HEADERS, "Prefer": "return=representation" },
    body: JSON.stringify({ ...body, updated_at: new Date().toISOString() }),
  })
  const data = await res.json()
  return NextResponse.json(data[0] || data)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Admin only" }, { status: 403 })
  const { id } = await params

  await fetch(`${SUPABASE_URL}/rest/v1/hub_alerts?id=eq.${id}`, {
    method: "DELETE",
    headers: HEADERS,
  })
  return NextResponse.json({ ok: true })
}
