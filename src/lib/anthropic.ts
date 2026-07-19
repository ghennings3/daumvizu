import Anthropic from "@anthropic-ai/sdk";

/**
 * Client da Anthropic — usado apenas em Route Handlers (nunca no browser).
 * Resolve a API key a partir de ANTHROPIC_API_KEY no ambiente do servidor.
 */
export const anthropic = new Anthropic();
