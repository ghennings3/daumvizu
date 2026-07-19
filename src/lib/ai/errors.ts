/**
 * Erro normalizado para falhas de geração por IA, independente do provedor
 * (Anthropic, Gemini, etc). A API route trata só esse tipo, sem precisar
 * conhecer o formato de erro específico de cada SDK.
 */
export class AIGenerationError extends Error {}
