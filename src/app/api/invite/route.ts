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

  const { email, role, client } = await req.json()
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })

  // Use Supabase invite endpoint — sends email with magic link to set password
  const res = await fetch(`${SUPABASE_URL}/auth/v1/invite`, {
    method: "POST",
    headers: {
      "apikey": SERVICE_KEY,
      "Authorization": `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      data: { role, client: client || null },
      redirect_to: "https://app.systemizedsales.com",
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    // If already invited/exists, try to fetch their existing user ID and just create profile
    if (data.error_code === "email_exists" || data.msg?.includes("already")) {
      const usersRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
        headers: { "apikey": SERVICE_KEY, "Authorization": `Bearer ${SERVICE_KEY}` },
      })
      const usersData = await usersRes.json()
      const existingUser = usersData.users?.[0]
      if (existingUser) {
        await createProfile(existingUser.id, email, role, client)
        return NextResponse.json({ success: true, userId: existingUser.id, alreadyExisted: true })
      }
    }
    return NextResponse.json({ error: data.msg || data.message || "Failed to invite user" }, { status: 500 })
  }

  const userId = data.id
  await createProfile(userId, email, role, client)
  return NextResponse.json({ success: true, userId })
}

async function createProfile(userId: string, email: string, role: string, client?: string) {
  const payload: Record<string, string> = { user_id: userId, email, role: role || "manager" }
  if (client) payload.client = client

  await fetch(`${SUPABASE_URL}/rest/v1/manager_profiles`, {
    method: "POST",
    headers: {
      "apikey": SERVICE_KEY,
      "Authorization": `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "resolution=merge-duplicates",
    },
    body: JSON.stringify(payload),
  })
}
