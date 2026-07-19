import {
  STATUS_BADGE_LABELS,
  STATUS_COLOR_CLASS,
  type ProposalStatus,
} from "@/lib/proposal-status";

export function StatusBadge({ status }: { status: ProposalStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm font-medium ${STATUS_COLOR_CLASS[status]}`}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
      {STATUS_BADGE_LABELS[status]}
    </span>
  );
}
