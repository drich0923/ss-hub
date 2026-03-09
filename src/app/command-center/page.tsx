import { createClient } from "@/lib/supabase/server";
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

  const clientName = profile?.client || "Your Team";
  const role = profile?.role || "client";
  const isAdmin = role === "admin";

  return <CommandCenterClient clientName={clientName} userEmail={user.email || ""} role={role} isAdmin={isAdmin} />;
}
