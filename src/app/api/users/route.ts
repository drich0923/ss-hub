import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase.from("manager_profiles").select("role").eq("user_id", user.id).single()
  if (profile?.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 })

  const { userId } = await req.json()
  if (userId === user.id) return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 })

  // Delete manager_profile + permissions
  await fetch(`${SUPABASE_URL}/rest/v1/manager_profiles?user_id=eq.${userId}`, {
    method: "DELETE",
    headers: { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}` },
  })
  await fetch(`${SUPABASE_URL}/rest/v1/user_permissions?user_id=eq.${userId}`, {
    method: "DELETE",
    headers: { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}` },
  })
  // Delete auth user
  await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}` },
  })

  return NextResponse.json({ success: true })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { data: profile } = await supabase.from("manager_profiles").select("role").eq("user_id", user.id).single()
  if (profile?.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 })

  const { userId, client } = await req.json()
  await fetch(`${SUPABASE_URL}/rest/v1/manager_profiles?user_id=eq.${userId}`, {
    method: "PATCH",
    headers: {
      "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ client: client || null }),
  })
  return NextResponse.json({ success: true })
}
