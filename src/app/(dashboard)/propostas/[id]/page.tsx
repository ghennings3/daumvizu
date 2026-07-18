export default async function PropostaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold text-foreground">
        Proposta <span className="font-mono text-muted">{id}</span>
      </h1>
      <p className="mt-2 text-sm text-muted">
        Detalhe da proposta será construído aqui.
      </p>
    </div>
  );
}
