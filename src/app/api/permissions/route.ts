import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase.from("manager_profiles").select("role").eq("user_id", user.id).single()
  if (profile?.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 })

  const { userId, appSlug, grant } = await req.json()

  if (grant) {
    await fetch(`${SUPABASE_URL}/rest/v1/user_permissions`, {
      method: "POST",
      headers: {
        "apikey": SERVICE_KEY,
        "Authorization": `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
      },
      body: JSON.stringify({ user_id: userId, app_slug: appSlug, granted_by: user.id }),
    })
  } else {
    await fetch(`${SUPABASE_URL}/rest/v1/user_permissions?user_id=eq.${userId}&app_slug=eq.${appSlug}`, {
      method: "DELETE",
      headers: {
        "apikey": SERVICE_KEY,
        "Authorization": `Bearer ${SERVICE_KEY}`,
      },
    })
  }

  return NextResponse.json({ success: true })
}
