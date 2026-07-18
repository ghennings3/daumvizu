export default async function PropostaPublicaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="w-full max-w-2xl rounded-card border border-border bg-surface p-8">
        <p className="text-xs font-mono text-muted">/{slug}</p>
        <h1 className="mt-2 text-xl font-semibold text-foreground">
          Visualização pública da proposta
        </h1>
        <p className="mt-2 text-sm text-muted">
          Página que o cliente acessa por link, sem login, será construída
          aqui.
        </p>
      </div>
    </div>
  );
}
