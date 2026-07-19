# Vizu

SaaS que ajuda freelancers a criar propostas comerciais com IA, enviar por link e acompanhar o status (visualizada, aceita, recusada, em negociação).

## Stack

- [Next.js 15](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS
- [Supabase](https://supabase.com) (Postgres + Auth + Storage)
- API da Anthropic para geração de propostas (chamada apenas via Route Handler no servidor, nunca exposta no client)

## Estrutura de pastas

```
src/
  app/
    (auth)/login, (auth)/cadastro        — autenticação
    (dashboard)/propostas, /clientes,    — área logada do freelancer
      /configuracoes
    (public)/p/[slug]                    — proposta acessada pelo cliente, sem login
    layout.tsx, globals.css              — layout raiz e tema
  lib/
    supabase/client.ts                   — client Supabase (Client Components)
    supabase/server.ts                   — client Supabase (Server Components / Route Handlers)
    supabase/middleware.ts               — renovação de sessão + proteção de rotas
  middleware.ts                          — middleware do Next.js
supabase/
  migrations/                            — schema SQL (tabelas + RLS)
```

## Rodando localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie um projeto no [Supabase](https://supabase.com) e rode a migration inicial:

   ```bash
   supabase link --project-ref <seu-project-ref>
   supabase db push
   ```

   Ou cole o conteúdo dos arquivos em `supabase/migrations/` (nessa ordem) no SQL Editor do painel do Supabase.

3. Copie o arquivo de variáveis de ambiente e preencha os valores:

   ```bash
   cp .env.local.example .env.local
   ```

4. Rode o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

   Acesse [http://localhost:3000](http://localhost:3000).

## Variáveis de ambiente

Definidas em `.env.local` (veja `.env.local.example`):

| Variável | Onde encontrar | Uso |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | URL do projeto, exposta no client |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API | Publishable key (chave pública), exposta no client |
| `SUPABASE_SECRET_KEY` | Supabase → Project Settings → API | Secret key (chave de admin), **apenas server-side** (Route Handlers) |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) | Geração de propostas com IA, **apenas server-side** |

## Banco de dados

Tabelas: `users`, `clients`, `proposals`, `proposal_events`.

Row Level Security habilitada em todas as tabelas:

- Cada freelancer só acessa seus próprios `clients` e `proposals`.
- A rota pública `/p/[slug]` lê a proposta correspondente sem autenticação (policy dedicada para o role `anon`), exceto propostas em status `rascunho`.
- Eventos de `proposal_events` originados da página pública (ex.: registrar "visualizada") devem ser gravados por uma Route Handler usando a `SUPABASE_SECRET_KEY`, nunca diretamente pelo client anônimo.

## Status do setup

Este é o setup inicial do projeto: estrutura de pastas, clients do Supabase, schema do banco e tema Tailwind. As telas e funcionalidades ainda serão construídas página por página.
