"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "cadastro";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "E-mail ou senha inválidos.",
  "User already registered": "Este e-mail já está cadastrado.",
  "Email not confirmed": "Confirme seu e-mail antes de entrar.",
  "Password should be at least 6 characters.":
    "A senha deve ter pelo menos 6 caracteres.",
};

function translateAuthError(message: string): string {
  return AUTH_ERROR_MESSAGES[message] ?? "Algo deu errado. Tente novamente.";
}

type FieldErrors = Partial<
  Record<"email" | "password" | "nome", string>
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
      {error ? <p className="mt-1.5 text-xs text-status-rejected">{error}</p> : null}
    </div>
  );
}

const inputClassName =
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted/60 outline-none transition-colors focus:border-accent";

export function AuthForm({ initialMode }: { initialMode: Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isCadastro = mode === "cadastro";

  function validate(): boolean {
    const errors: FieldErrors = {};
    if (!EMAIL_REGEX.test(email)) {
      errors.email = "Informe um e-mail válido.";
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
    }
    if (isCadastro && !nome.trim()) {
      errors.nome = "Informe seu nome.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function toggleMode() {
    setMode((current) => (current === "login" ? "cadastro" : "login"));
    setFormError(null);
    setInfoMessage(null);
    setFieldErrors({});
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setInfoMessage(null);

    if (!validate()) return;

    setLoading(true);
    const supabase = createClient();

    if (isCadastro) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nome: nome.trim(), empresa: empresa.trim() } },
      });

      setLoading(false);

      if (error) {
        setFormError(translateAuthError(error.message));
        return;
      }

      if (!data.session) {
        setInfoMessage(
          "Cadastro realizado! Confirme seu e-mail para continuar.",
        );
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setLoading(false);

      if (error) {
        setFormError(translateAuthError(error.message));
        return;
      }
    }

    router.push("/propostas");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold text-foreground">
        {isCadastro ? "Criar conta" : "Entrar"}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {isCadastro
          ? "Comece a enviar propostas em minutos."
          : "Acesse suas propostas e clientes."}
      </p>

      <form
        noValidate
        onSubmit={handleSubmit}
        className="mt-8 flex flex-col gap-5"
      >
        {isCadastro ? (
          <Field id="nome" label="Nome" error={fieldErrors.nome}>
            <input
              id="nome"
              type="text"
              autoComplete="name"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              className={inputClassName}
              placeholder="Seu nome"
            />
          </Field>
        ) : null}

        {isCadastro ? (
          <Field id="empresa" label="Empresa (opcional)">
            <input
              id="empresa"
              type="text"
              autoComplete="organization"
              value={empresa}
              onChange={(event) => setEmpresa(event.target.value)}
              className={inputClassName}
              placeholder="Nome fantasia"
            />
          </Field>
        ) : null}

        <Field id="email" label="E-mail" error={fieldErrors.email}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClassName}
            placeholder="voce@estudio.com"
          />
        </Field>

        <Field id="password" label="Senha" error={fieldErrors.password}>
          <input
            id="password"
            type="password"
            autoComplete={isCadastro ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClassName}
            placeholder="••••••••••"
          />
        </Field>

        {formError ? (
          <p className="text-sm text-status-rejected">{formError}</p>
        ) : null}
        {infoMessage ? (
          <p className="text-sm text-accent">{infoMessage}</p>
        ) : null}

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
          ) : null}
          {isCadastro ? "Criar conta" : "Entrar"}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase text-muted">ou</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        {isCadastro ? "Já tem conta?" : "Não tem conta?"}{" "}
        <button
          type="button"
          onClick={toggleMode}
          className="font-medium text-accent hover:text-accent-hover"
        >
          {isCadastro ? "Entrar" : "Criar conta grátis"}
        </button>
      </p>
    </div>
  );
}
