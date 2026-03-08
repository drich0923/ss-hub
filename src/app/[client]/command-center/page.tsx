import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CommandCenterClient from "@/components/CommandCenterClient";

export default async function CommandCenterPage({ params }: { params: Promise<{ client: string }> }) {
  const { client: clientSlug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("manager_profiles")
    .select("role, client, email")
    .eq("user_id", user.id)
    .single();

  // Admins/managers can view any client. Clients/reps can only see their own.
  const isInternal = profile?.role === "admin" || profile?.role === "manager";
  if (!isInternal && profile?.client?.toLowerCase().replace(/\s+/g, "-") !== clientSlug) {
    redirect("/");
  }

  const clientName = profile?.client || decodeURIComponent(clientSlug);
  return <CommandCenterClient clientName={clientName} clientSlug={clientSlug} userEmail={user.email || ""} />;
}
