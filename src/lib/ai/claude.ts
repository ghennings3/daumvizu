import Anthropic from "@anthropic-ai/sdk";
import { anthropic } from "@/lib/anthropic";
import {
  PROPOSAL_BLOCKS_SCHEMA,
  safeParseProposalBlocks,
  type ProposalBlocks,
} from "@/lib/proposal-blocks";
import { buildProposalPrompt } from "@/lib/ai/prompt";
import { AIGenerationError } from "@/lib/ai/errors";
import type { GenerateProposalInput } from "@/lib/ai/types";

export async function generateProposalWithClaude(
  input: GenerateProposalInput,
): Promise<ProposalBlocks> {
  const { systemPrompt, userPrompt } = buildProposalPrompt(input);

  try {
    const response = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      output_config: {
        format: { type: "json_schema", schema: PROPOSAL_BLOCKS_SCHEMA },
      },
    });

    if (response.stop_reason === "refusal") {
      throw new AIGenerationError(
        "A IA não conseguiu gerar essa proposta. Tente reformular o escopo.",
      );
    }

    const textBlock = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === "text",
    );

    if (!textBlock) {
      throw new AIGenerationError("A IA não retornou conteúdo.");
    }

    return safeParseProposalBlocks(textBlock.text);
  } catch (error) {
    if (error instanceof AIGenerationError) throw error;

    if (error instanceof Anthropic.APIError) {
      console.error("[claude] erro na geração da proposta:", error.status, error.message);
      throw new AIGenerationError(
        "Erro ao gerar a proposta com IA. Tente novamente.",
      );
    }

    console.error("[claude] erro inesperado ao gerar/parsear a proposta:", error);
    throw new AIGenerationError(
      "A IA retornou uma resposta em formato inesperado.",
    );
  }
}
