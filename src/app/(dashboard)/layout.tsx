import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("nome")
    .eq("id", user.id)
    .single();

  const userName = profile?.nome || user.email || "Você";

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userName={userName} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
