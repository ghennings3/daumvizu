import { formatRelativeTime } from "@/lib/format";

export type ProposalStatus =
  | "rascunho"
  | "enviada"
  | "visualizada"
  | "em_negociacao"
  | "aceita"
  | "recusada";

// Ordem das abas de filtro na listagem de propostas. "recusada" não tem
// aba própria (fica visível apenas via "Todas"), seguindo o design.
export const PROPOSAL_STATUS_TABS: ProposalStatus[] = [
  "rascunho",
  "enviada",
  "visualizada",
  "em_negociacao",
  "aceita",
];

export const STATUS_TAB_LABELS: Record<ProposalStatus, string> = {
  rascunho: "Rascunho",
  enviada: "Enviada",
  visualizada: "Visualizada",
  em_negociacao: "Negociação",
  aceita: "Aceita",
  recusada: "Recusada",
};

export const STATUS_BADGE_LABELS: Record<ProposalStatus, string> = {
  rascunho: "Rascunho",
  enviada: "Enviada",
  visualizada: "Visualizada",
  em_negociacao: "Em negociação",
  aceita: "Aceita",
  recusada: "Recusada",
};

export const STATUS_COLOR_CLASS: Record<ProposalStatus, string> = {
  rascunho: "text-status-draft",
  enviada: "text-status-sent",
  visualizada: "text-status-viewed",
  em_negociacao: "text-status-negotiation",
  aceita: "text-status-accepted",
  recusada: "text-status-rejected",
};

const STATUS_TIME_VERB: Record<ProposalStatus, string> = {
  rascunho: "editado",
  enviada: "enviada",
  visualizada: "visualizada",
  em_negociacao: "em negociação",
  aceita: "aceita",
  recusada: "recusada",
};

export function formatStatusTime(
  status: ProposalStatus,
  updatedAtIso: string,
): string {
  return `${STATUS_TIME_VERB[status]} ${formatRelativeTime(updatedAtIso)}`;
}
