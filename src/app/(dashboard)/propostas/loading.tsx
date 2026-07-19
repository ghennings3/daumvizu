export default function PropostasLoading() {
  return (
    <div className="p-10">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-32 animate-pulse rounded bg-surface" />
          <div className="mt-2 h-4 w-20 animate-pulse rounded bg-surface" />
        </div>
        <div className="h-10 w-36 animate-pulse rounded-xl bg-surface" />
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-[72px] animate-pulse rounded-card border border-border bg-surface"
          />
        ))}
      </div>
    </div>
  );
}
