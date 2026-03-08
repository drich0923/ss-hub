import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from("manager_profiles").select("role").eq("user_id", user.id).single()
  return profile?.role === "admin" ? user : null
}

export async function GET() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/clients?select=*&order=name.asc`, {
    headers: { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}` },
  })
  const data = await res.json()
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const user = await assertAdmin()
  if (!user) return NextResponse.json({ error: "Admin only" }, { status: 403 })
  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 })

  const res = await fetch(`${SUPABASE_URL}/rest/v1/clients`, {
    method: "POST",
    headers: {
      "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json", "Prefer": "return=representation",
    },
    body: JSON.stringify({ name: name.trim() }),
  })
  const data = await res.json()
  if (!res.ok) return NextResponse.json({ error: data.message || "Failed" }, { status: 500 })
  return NextResponse.json(data[0])
}

export async function DELETE(req: NextRequest) {
  const user = await assertAdmin()
  if (!user) return NextResponse.json({ error: "Admin only" }, { status: 403 })
  const { id } = await req.json()
  await fetch(`${SUPABASE_URL}/rest/v1/clients?id=eq.${id}`, {
    method: "DELETE",
    headers: { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}` },
  })
  return NextResponse.json({ success: true })
}
