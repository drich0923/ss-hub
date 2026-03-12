import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CloserDashboard from "@/components/CloserDashboard";

export default async function CloserDashboardPage({ params }: { params: Promise<{ client: string }> }) {
  const { client } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("manager_profiles")
    .select("role, client, email")
    .eq("user_id", user.id)
    .single();

  const role = profile?.role || "client";
  const isAdmin = role === "admin";

  const cookieStore = await cookies();
  const cookieClient = cookieStore.get("active_client")?.value;
  const clientSlug = (client || "").toLowerCase() || (isAdmin && cookieClient ? cookieClient.toLowerCase().replace(/\s+/g, '') : (profile?.client || "").toLowerCase().replace(/\s+/g, ''));

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: pages } = await adminClient
    .from("closer_pages")
    .select("*")
    .eq("client_slug", clientSlug)
    .order("position", { ascending: true });

  const { data: bookmarks } = await supabase
    .from("closer_bookmarks")
    .select("nav_key")
    .eq("user_id", user.id)
    .eq("client_slug", clientSlug);

  return (
    <CloserDashboard
      clientSlug={clientSlug}
      pages={pages || []}
      bookmarks={(bookmarks || []).map(b => b.nav_key)}
      role={role}
      isAdmin={isAdmin}
      userId={user.id}
      activeSlug={null}
    />
  );
}
