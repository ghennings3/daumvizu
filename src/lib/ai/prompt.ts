import type { GenerateProposalInput } from "@/lib/ai/types";

/**
 * Prompt compartilhado entre todos os provedores de IA — trocar de provedor
 * não deve mudar o conteúdo pedido, só a sintaxe da chamada à API.
 */
export function buildProposalPrompt(input: GenerateProposalInput) {
  const systemPrompt = `Você é um assistente que ajuda freelancers brasileiros a redigir propostas comerciais profissionais.
Escreva sempre em português do Brasil, com tom profissional mas natural — evite jargão corporativo e linguagem engessada.
Baseie todo o conteúdo nos dados fornecidos pelo usuário sobre o cliente, o projeto, o escopo e o investimento.`;

  const userPrompt = `Gere o conteúdo de uma proposta comercial com base nestas informações:

Cliente: ${input.cliente}
Projeto: ${input.projeto}
Tipo de serviço: ${input.tipoServico}
Escopo resumido: ${input.escopoResumido}
Valor estimado: R$ ${input.valorEstimado}
Prazo: ${input.prazo ?? "não informado"}

Gere:
- Uma capa com título chamativo para o projeto e uma tagline curta (uma frase)
- Um texto de apresentação profissional (2 a 3 parágrafos curtos) conectando o freelancer ao cliente e ao projeto
- Uma lista de 4 a 7 itens de escopo, desdobrando o escopo resumido em entregáveis concretos
- Uma descrição do investimento (1 parágrafo curto) explicando o que está incluso no valor
- Um texto de termos e validade da proposta (validade de 15 dias, forma de pagamento sugerida em até 2 parcelas)

Responda apenas com um JSON válido, sem markdown ou texto adicional, exatamente neste formato:
{
  "capa": { "titulo": "string", "tagline": "string" },
  "apresentacao": { "texto": "string" },
  "escopo": { "itens": ["string", "string"] },
  "investimento": { "valor": number, "descricao": "string" },
  "termos": { "texto": "string" }
}`;

  return { systemPrompt, userPrompt };
}
