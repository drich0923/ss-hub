import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientSlug = req.nextUrl.searchParams.get("client_slug");
  if (!clientSlug) return NextResponse.json({ error: "client_slug required" }, { status: 400 });

  const { data, error } = await supabase
    .from("closer_pages")
    .select("*")
    .eq("client_slug", clientSlug)
    .order("position", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("manager_profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await req.json();
  const { client_slug, nav_key, title, content, page_type, external_url, loom_url, position } = body;

  const { data, error } = await supabase
    .from("closer_pages")
    .upsert({
      client_slug,
      nav_key,
      title,
      content: content || {},
      page_type: page_type || "page",
      external_url,
      loom_url,
      position: position || 0,
      updated_at: new Date().toISOString(),
    }, { onConflict: "client_slug,nav_key" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
