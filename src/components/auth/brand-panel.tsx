import Image from "next/image";

export function BrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-background lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 top-[26%] h-[420px] w-[420px] opacity-[0.08]"
        style={{
          backgroundImage: "url(/vizu-symbol.svg)",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
        }}
      />

      <Image
        src="/vizu-logo-dark.svg"
        alt="Vizu"
        width={110}
        height={32}
        priority
        className="relative h-8 w-auto"
      />

      <div className="relative max-w-md">
        <h1 className="text-4xl font-semibold leading-tight text-foreground">
          Proposta enviada.
          <br />
          Cliente decidindo.
        </h1>
        <p className="mt-4 text-sm text-muted">
          Monte propostas com IA, mande um link e acompanhe cada status em
          tempo real.
        </p>
      </div>

      <p className="relative font-mono text-xs text-muted">daumvizu.app</p>
    </div>
  );
}
