import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientSlug = req.nextUrl.searchParams.get("client_slug");
  if (!clientSlug) return NextResponse.json({ error: "client_slug required" }, { status: 400 });

  const { data, error } = await supabase
    .from("closer_bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .eq("client_slug", clientSlug);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { client_slug, nav_key } = await req.json();

  const { data, error } = await supabase
    .from("closer_bookmarks")
    .upsert({
      user_id: user.id,
      client_slug,
      nav_key,
    }, { onConflict: "user_id,client_slug,nav_key" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { client_slug, nav_key } = await req.json();

  const { error } = await supabase
    .from("closer_bookmarks")
    .delete()
    .eq("user_id", user.id)
    .eq("client_slug", client_slug)
    .eq("nav_key", nav_key);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
