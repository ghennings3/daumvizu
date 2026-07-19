import { GoogleGenAI, ApiError } from "@google/genai";
import { safeParseProposalBlocks, type ProposalBlocks } from "@/lib/proposal-blocks";
import { buildProposalPrompt } from "@/lib/ai/prompt";
import { AIGenerationError } from "@/lib/ai/errors";
import type { GenerateProposalInput } from "@/lib/ai/types";

// gemini-2.5-flash foi descontinuado para novos usuários (404 na API) —
// usando o sucessor estável direto, gemini-3.5-flash.
const GEMINI_MODEL = "gemini-3.5-flash";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateProposalWithGemini(
  input: GenerateProposalInput,
): Promise<ProposalBlocks> {
  const { systemPrompt, userPrompt } = buildProposalPrompt(input);

  try {
    const response = await genAI.models.generateContent({
      model: GEMINI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) {
      throw new AIGenerationError("A IA não retornou conteúdo.");
    }

    return safeParseProposalBlocks(text);
  } catch (error) {
    if (error instanceof AIGenerationError) throw error;

    if (error instanceof ApiError && error.status === 429) {
      throw new AIGenerationError(
        "Limite de requisições do Gemini atingido. Tente novamente em instantes.",
      );
    }
    if (error instanceof ApiError) {
      console.error(
        "[gemini] erro na geração da proposta:",
        error.status,
        error.message,
      );
      throw new AIGenerationError(
        "Erro ao gerar a proposta com IA. Tente novamente.",
      );
    }

    console.error("[gemini] erro inesperado ao gerar/parsear a proposta:", error);
    throw new AIGenerationError(
      "A IA retornou uma resposta em formato inesperado.",
    );
  }
}
