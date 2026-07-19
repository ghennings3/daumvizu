import { createClient } from "@/lib/supabase/server";
import { NovaPropostaForm } from "@/components/propostas/nova-proposta-form";

const FREE_PLAN_MONTHLY_LIMIT = 3;

export default async function NovaPropostaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let limitReached = false;

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("plano")
      .eq("id", user.id)
      .single();

    if ((profile?.plano ?? "free") === "free") {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from("proposals")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", startOfMonth.toISOString());

      limitReached = (count ?? 0) >= FREE_PLAN_MONTHLY_LIMIT;
    }
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-semibold text-foreground">
        Nova proposta
      </h1>
      <p className="mt-1 text-sm text-muted">
        Responda rápido — a IA monta o resto
      </p>

      <div className="mt-8">
        <NovaPropostaForm limitReached={limitReached} />
      </div>
    </div>
  );
}
