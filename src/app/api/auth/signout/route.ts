import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect("https://app.systemizedsales.com/login", { status: 302 })
}

// Also handle GET in case browser follows redirect oddly
export async function GET() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect("https://app.systemizedsales.com/login", { status: 302 })
}
