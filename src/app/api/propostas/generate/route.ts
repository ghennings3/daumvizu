import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ProposalBlocks } from "@/lib/proposal-blocks";
import { SERVICE_TYPES } from "@/lib/service-types";
import { AIGenerationError } from "@/lib/ai/errors";
import { generateProposalWithGemini } from "@/lib/ai/gemini";
// import { generateProposalWithClaude } from "@/lib/ai/claude";

const FREE_PLAN_MONTHLY_LIMIT = 3;

type GenerateRequestBody = {
  cliente?: string;
  projeto?: string;
  tipoServico?: string;
  escopoResumido?: string;
  valorEstimado?: number;
  prazo?: string;
};

function parseClienteInput(raw: string): {
  nome: string;
  empresa: string | null;
} {
  const trimmed = raw.trim();
  const parts = trimmed.split(/\s+[—–-]\s+/);
  if (parts.length >= 2) {
    return {
      nome: parts[0].trim(),
      empresa: parts.slice(1).join(" - ").trim() || null,
    };
  }
  return { nome: trimmed, empresa: null };
}

async function resolveClientId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  nome: string,
  empresa: string | null,
): Promise<string> {
  const { data: existing } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", userId)
    .ilike("nome", nome)
    .limit(1)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("clients")
    .insert({ user_id: userId, nome, empresa })
    .select("id")
    .single();

  if (error || !created) {
    throw new Error("Não foi possível salvar o cliente.");
  }

  return created.id;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | GenerateRequestBody
    | null;

  const cliente = body?.cliente?.trim();
  const projeto = body?.projeto?.trim();
  const tipoServico = body?.tipoServico?.trim();
  const escopoResumido = body?.escopoResumido?.trim();
  const valorEstimado =
    typeof body?.valorEstimado === "number" ? body.valorEstimado : NaN;
  const prazo = body?.prazo?.trim() || null;

  if (
    !cliente ||
    !projeto ||
    !tipoServico ||
    !SERVICE_TYPES.includes(tipoServico as (typeof SERVICE_TYPES)[number]) ||
    !escopoResumido ||
    !Number.isFinite(valorEstimado) ||
    valorEstimado <= 0
  ) {
    return NextResponse.json(
      {
        error: "invalid_input",
        message: "Preencha todos os campos obrigatórios corretamente.",
      },
      { status: 400 },
    );
  }

  const { data: profile } = await supabase
    .from("users")
    .select("plano")
    .eq("id", user.id)
    .single();

  const plano = profile?.plano ?? "free";

  if (plano === "free") {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("proposals")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth.toISOString());

    if ((count ?? 0) >= FREE_PLAN_MONTHLY_LIMIT) {
      return NextResponse.json(
        {
          error: "plan_limit_reached",
          message: `Você atingiu o limite de ${FREE_PLAN_MONTHLY_LIMIT} propostas do plano grátis.`,
        },
        { status: 403 },
      );
    }
  }

  let aiBlocks: ProposalBlocks;

  try {
    // PROVEDOR ATIVO: Gemini (temporário — trocar para Anthropic quando os
    // créditos estiverem disponíveis). Para reverter, troque a linha abaixo
    // por generateProposalWithClaude e reative o import comentado no topo.
    aiBlocks = await generateProposalWithGemini({
      cliente,
      projeto,
      tipoServico,
      escopoResumido,
      valorEstimado,
      prazo,
    });
  } catch (error) {
    if (error instanceof AIGenerationError) {
      return NextResponse.json(
        { error: "ai_error", message: error.message },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: "server_error", message: "Erro inesperado. Tente novamente." },
      { status: 500 },
    );
  }

  const blocks: ProposalBlocks = {
    ...aiBlocks,
    investimento: { ...aiBlocks.investimento, valor: valorEstimado },
  };

  try {
    const { nome: clienteNome, empresa: clienteEmpresa } =
      parseClienteInput(cliente);
    const clientId = await resolveClientId(
      supabase,
      user.id,
      clienteNome,
      clienteEmpresa,
    );

    const { data: proposal, error: insertError } = await supabase
      .from("proposals")
      .insert({
        user_id: user.id,
        client_id: clientId,
        titulo: projeto,
        status: "rascunho",
        valor: valorEstimado,
        prazo,
        blocks,
      })
      .select("id")
      .single();

    if (insertError || !proposal) {
      throw insertError ?? new Error("Insert sem retorno.");
    }

    return NextResponse.json({ id: proposal.id });
  } catch {
    return NextResponse.json(
      {
        error: "db_error",
        message: "Não foi possível salvar a proposta. Tente novamente.",
      },
      { status: 500 },
    );
  }
}
