import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from("manager_profiles")
    .select("role, client, email")
    .eq("user_id", user.id)
    .single()
  return profile ? { ...profile, userId: user.id } : null
}

export async function GET(req: NextRequest) {
  const profile = await getProfile()
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const client = req.nextUrl.searchParams.get("client")
  if (!client) return NextResponse.json({ error: "client param required" }, { status: 400 })

  // Non-admins can only fetch their own client
  if (profile.role !== "admin" && profile.client !== client) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/command_center_configs?client=eq.${encodeURIComponent(client)}&select=*`,
    { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
  )
  const data = await res.json()
  return NextResponse.json(data?.[0] ?? null)
}

export async function POST(req: NextRequest) {
  const profile = await getProfile()
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 })
  }

  const body = await req.json()
  const { client, quick_links, team_members, support_channels } = body
  if (!client) return NextResponse.json({ error: "client required" }, { status: 400 })

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/command_center_configs?on_conflict=client`,
    {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation,resolution=merge-duplicates",
      },
      body: JSON.stringify({
        client,
        quick_links,
        team_members,
        support_channels,
        updated_at: new Date().toISOString(),
        updated_by: profile.email,
      }),
    }
  )
  const data = await res.json()
  if (!res.ok) return NextResponse.json({ error: data.message || "Failed to save" }, { status: 500 })
  return NextResponse.json(data[0])
}
