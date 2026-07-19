"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SERVICE_TYPES, type ServiceType } from "@/lib/service-types";

type FieldErrors = Partial<
  Record<
    "cliente" | "projeto" | "tipoServico" | "escopoResumido" | "valorEstimado",
    string
  >
>;

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="font-mono text-xs uppercase tracking-wide text-muted"
      >
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {error ? (
        <p className="mt-1.5 text-xs text-status-rejected">{error}</p>
      ) : null}
    </div>
  );
}

const inputClassName =
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted/60 outline-none transition-colors focus:border-accent disabled:cursor-not-allowed disabled:opacity-60";

function formatValorDisplay(digits: string): string {
  if (!digits) return "";
  return new Intl.NumberFormat("pt-BR").format(parseInt(digits, 10));
}

const AI_GENERATED_ITEMS = [
  "Capa personalizada",
  "Apresentação",
  "Escopo detalhado",
  "Investimento",
  "Termos e validade",
];

export function NovaPropostaForm({
  limitReached,
}: {
  limitReached: boolean;
}) {
  const router = useRouter();
  const [cliente, setCliente] = useState("");
  const [projeto, setProjeto] = useState("");
  const [tipoServico, setTipoServico] = useState<ServiceType | null>(null);
  const [escopoResumido, setEscopoResumido] = useState("");
  const [valorDigits, setValorDigits] = useState("");
  const [prazo, setPrazo] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const errors: FieldErrors = {};
    if (!cliente.trim()) errors.cliente = "Informe o cliente.";
    if (!projeto.trim()) errors.projeto = "Informe o nome do projeto.";
    if (!tipoServico) errors.tipoServico = "Selecione o tipo de serviço.";
    if (!escopoResumido.trim())
      errors.escopoResumido = "Descreva o escopo resumido.";
    if (!valorDigits || parseInt(valorDigits, 10) <= 0) {
      errors.valorEstimado = "Informe o valor estimado.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/propostas/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: cliente.trim(),
          projeto: projeto.trim(),
          tipoServico,
          escopoResumido: escopoResumido.trim(),
          valorEstimado: parseInt(valorDigits, 10),
          prazo: prazo.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data?.message ?? "Algo deu errado. Tente novamente.");
        setLoading(false);
        return;
      }

      router.push(`/propostas/${data.id}/editar`);
    } catch {
      setFormError(
        "Não foi possível conectar. Verifique sua internet e tente novamente.",
      );
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <form
        noValidate
        onSubmit={handleSubmit}
        className="flex max-w-xl flex-col gap-5"
      >
        <Field id="cliente" label="Cliente" error={fieldErrors.cliente}>
          <input
            id="cliente"
            type="text"
            disabled={limitReached}
            value={cliente}
            onChange={(event) => setCliente(event.target.value)}
            className={inputClassName}
            placeholder="Nome — Empresa"
          />
        </Field>

        <Field
          id="projeto"
          label="Nome do projeto"
          error={fieldErrors.projeto}
        >
          <input
            id="projeto"
            type="text"
            disabled={limitReached}
            value={projeto}
            onChange={(event) => setProjeto(event.target.value)}
            className={inputClassName}
            placeholder="App mobile — MVP de treinos"
          />
        </Field>

        <div>
          <span className="font-mono text-xs uppercase tracking-wide text-muted">
            Tipo de serviço
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {SERVICE_TYPES.map((type) => {
              const isActive = tipoServico === type;
              return (
                <button
                  key={type}
                  type="button"
                  disabled={limitReached}
                  onClick={() => setTipoServico(type)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "bg-surface text-muted hover:text-foreground"
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
          {fieldErrors.tipoServico ? (
            <p className="mt-1.5 text-xs text-status-rejected">
              {fieldErrors.tipoServico}
            </p>
          ) : null}
        </div>

        <Field
          id="escopo"
          label="Escopo resumido"
          error={fieldErrors.escopoResumido}
        >
          <textarea
            id="escopo"
            rows={4}
            disabled={limitReached}
            value={escopoResumido}
            onChange={(event) => setEscopoResumido(event.target.value)}
            className={`${inputClassName} resize-none`}
            placeholder="Descreva rapidamente o que será entregue..."
          />
        </Field>

        <div className="flex gap-4">
          <div className="flex-1">
            <Field
              id="valor"
              label="Valor estimado"
              error={fieldErrors.valorEstimado}
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">
                  R$
                </span>
                <input
                  id="valor"
                  type="text"
                  inputMode="numeric"
                  disabled={limitReached}
                  value={formatValorDisplay(valorDigits)}
                  onChange={(event) =>
                    setValorDigits(event.target.value.replace(/\D/g, ""))
                  }
                  className={`${inputClassName} pl-10`}
                  placeholder="18.500"
                />
              </div>
            </Field>
          </div>
          <div className="flex-1">
            <Field id="prazo" label="Prazo">
              <input
                id="prazo"
                type="text"
                disabled={limitReached}
                value={prazo}
                onChange={(event) => setPrazo(event.target.value)}
                className={inputClassName}
                placeholder="6 semanas"
              />
            </Field>
          </div>
        </div>

        {formError ? (
          <p className="text-sm text-status-rejected">{formError}</p>
        ) : null}

        {limitReached ? (
          <PlanLimitNotice />
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground/30 border-t-accent-foreground"
              />
            ) : (
              <span aria-hidden="true">✦</span>
            )}
            {loading ? "Gerando proposta..." : "Gerar proposta com IA"}
          </button>
        )}
      </form>

      <aside className="h-fit rounded-card border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold text-foreground">
          A IA vai gerar
        </h2>
        <ul className="mt-4 flex flex-col gap-2.5 text-sm text-foreground">
          {AI_GENERATED_ITEMS.map((item) => (
            <li key={item} className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-5 border-t border-border pt-4">
          <p className="text-xs text-muted">
            Tudo editável em blocos depois — nada é enviado sem sua revisão.
          </p>
        </div>
      </aside>
    </div>
  );
}

function PlanLimitNotice() {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-sm text-foreground">
        Você atingiu o limite de 3 propostas do plano grátis.
      </p>
      <Link
        href="/configuracoes"
        className="mt-3 inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
      >
        Ver planos
      </Link>
    </div>
  );
}
