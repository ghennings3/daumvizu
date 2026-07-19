"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrencyBRL } from "@/lib/format";
import {
  PROPOSAL_STATUS_TABS,
  STATUS_TAB_LABELS,
  formatStatusTime,
  type ProposalStatus,
} from "@/lib/proposal-status";
import { StatusBadge } from "@/components/propostas/status-badge";

export type ProposalListItem = {
  id: string;
  titulo: string;
  status: ProposalStatus;
  valor: number | null;
  updatedAt: string;
  clientNome: string | null;
};

type TabValue = ProposalStatus | "todas";

const TABS: { value: TabValue; label: string }[] = [
  { value: "todas", label: "Todas" },
  ...PROPOSAL_STATUS_TABS.map((status) => ({
    value: status as TabValue,
    label: STATUS_TAB_LABELS[status],
  })),
];

export function PropostasView({
  proposals,
}: {
  proposals: ProposalListItem[];
}) {
  const [activeTab, setActiveTab] = useState<TabValue>("todas");

  const filtered = useMemo(() => {
    if (activeTab === "todas") return proposals;
    return proposals.filter((proposal) => proposal.status === activeTab);
  }, [proposals, activeTab]);

  if (proposals.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={`rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-surface text-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted">
            Nenhuma proposta com esse status.
          </p>
        ) : (
          filtered.map((proposal) => (
            <Link
              key={proposal.id}
              href={`/propostas/${proposal.id}`}
              className="flex items-center gap-4 rounded-card border border-border bg-surface px-5 py-4 transition-colors hover:bg-surface-hover"
            >
              <div className="h-10 w-10 shrink-0 rounded-lg bg-background" />

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">
                  {proposal.clientNome ?? "Cliente não informado"}
                </p>
                <p className="truncate text-sm text-muted">
                  {proposal.titulo}
                </p>
              </div>

              <p className="w-28 shrink-0 text-right font-mono text-sm text-foreground">
                {formatCurrencyBRL(proposal.valor)}
              </p>

              <div className="w-40 shrink-0">
                <StatusBadge status={proposal.status} />
              </div>

              <p className="w-36 shrink-0 text-right font-mono text-xs text-muted">
                {formatStatusTime(proposal.status, proposal.updatedAt)}
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-border">
        <Image
          src="/vizu-symbol.svg"
          alt=""
          aria-hidden="true"
          width={28}
          height={28}
        />
      </div>
      <h2 className="mt-6 text-lg font-semibold text-foreground">
        Nenhuma proposta ainda
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Responda um formulário rápido e deixe a IA montar sua primeira
        proposta — capa, escopo e investimento inclusos.
      </p>
      <Link
        href="/propostas/nova"
        className="mt-6 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
      >
        Criar primeira proposta
      </Link>
    </div>
  );
}
