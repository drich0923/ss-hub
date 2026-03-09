import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CommandCenterClient from "@/components/CommandCenterClient";

export default async function CommandCenterPage() {
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

  // Admins: use cookie-based active client; others: use their own profile.client
  const cookieStore = await cookies();
  const cookieClient = cookieStore.get("active_client")?.value;
  const clientName = isAdmin && cookieClient ? cookieClient : (profile?.client || "Your Team");

  return <CommandCenterClient clientName={clientName} userEmail={user.email || ""} role={role} isAdmin={isAdmin} />;
}
