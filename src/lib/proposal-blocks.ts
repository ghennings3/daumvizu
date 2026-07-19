export type ProposalBlocks = {
  capa: { titulo: string; tagline: string };
  apresentacao: { texto: string };
  escopo: { itens: string[] };
  investimento: { valor: number; descricao: string };
  termos: { texto: string };
};

/**
 * JSON Schema usado no output_config.format da Anthropic para forçar a
 * resposta a vir exatamente nesse formato — elimina a necessidade de
 * heurísticas de parsing (crases, markdown, etc).
 */
export const PROPOSAL_BLOCKS_SCHEMA = {
  type: "object",
  properties: {
    capa: {
      type: "object",
      properties: {
        titulo: { type: "string" },
        tagline: { type: "string" },
      },
      required: ["titulo", "tagline"],
      additionalProperties: false,
    },
    apresentacao: {
      type: "object",
      properties: {
        texto: { type: "string" },
      },
      required: ["texto"],
      additionalProperties: false,
    },
    escopo: {
      type: "object",
      properties: {
        itens: { type: "array", items: { type: "string" } },
      },
      required: ["itens"],
      additionalProperties: false,
    },
    investimento: {
      type: "object",
      properties: {
        valor: { type: "number" },
        descricao: { type: "string" },
      },
      required: ["valor", "descricao"],
      additionalProperties: false,
    },
    termos: {
      type: "object",
      properties: {
        texto: { type: "string" },
      },
      required: ["texto"],
      additionalProperties: false,
    },
  },
  required: ["capa", "apresentacao", "escopo", "investimento", "termos"],
  additionalProperties: false,
} as const;

/**
 * Faz parse seguro do texto retornado pela IA. Com output_config.format a
 * API já garante JSON válido no formato do schema, mas mantemos uma limpeza
 * defensiva (crases/markdown) caso o texto venha com blocos de código.
 */
export function safeParseProposalBlocks(text: string): ProposalBlocks {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("A IA retornou uma resposta em formato inválido.");
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("capa" in parsed) ||
    !("apresentacao" in parsed) ||
    !("escopo" in parsed) ||
    !("investimento" in parsed) ||
    !("termos" in parsed)
  ) {
    throw new Error("A IA retornou uma resposta em formato inesperado.");
  }

  return parsed as ProposalBlocks;
}
