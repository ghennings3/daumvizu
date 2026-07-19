import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  PropostasView,
  type ProposalListItem,
} from "@/components/propostas/propostas-view";
import type { ProposalStatus } from "@/lib/proposal-status";

type ProposalRow = {
  id: string;
  titulo: string;
  status: ProposalStatus;
  valor: number | null;
  updated_at: string;
  clients: { nome: string } | null;
};

export default async function PropostasPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("proposals")
    .select("id, titulo, status, valor, updated_at, clients ( nome )")
    .order("updated_at", { ascending: false })
    .returns<ProposalRow[]>();

  if (error) {
    throw error;
  }

  const proposals: ProposalListItem[] = (data ?? []).map((proposal) => ({
    id: proposal.id,
    titulo: proposal.titulo,
    status: proposal.status,
    valor: proposal.valor,
    updatedAt: proposal.updated_at,
    clientNome: proposal.clients?.nome ?? null,
  }));

  return (
    <div className="p-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Propostas
          </h1>
          <p className="mt-1 font-mono text-sm text-muted">
            {proposals.length}{" "}
            {proposals.length === 1 ? "proposta" : "propostas"}
          </p>
        </div>
        <Link
          href="/propostas/nova"
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
        >
          + Nova proposta
        </Link>
      </div>

      <div className="mt-8">
        <PropostasView proposals={proposals} />
      </div>
    </div>
  );
}
