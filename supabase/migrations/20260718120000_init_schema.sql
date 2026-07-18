-- Vizu — schema inicial
-- Tabelas: users, clients, proposals, proposal_events
-- + Row Level Security básica

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- users
-- Perfil do freelancer, 1:1 com auth.users. O id É o mesmo id do auth.users.
-- ---------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  nome text,
  empresa text,
  cnpj_cpf text,
  chave_pix text,
  termos_padrao text,
  plano text not null default 'free' check (plano in ('free', 'pro')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.users is 'Perfil do freelancer (dono da conta), 1:1 com auth.users.';

-- Cria automaticamente uma linha em public.users quando um novo usuário
-- se cadastra via Supabase Auth.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- clients
-- Clientes cadastrados por cada freelancer.
-- ---------------------------------------------------------------------------
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  nome text not null,
  email text,
  empresa text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clients_user_id_idx on public.clients (user_id);

-- ---------------------------------------------------------------------------
-- proposals
-- ---------------------------------------------------------------------------
create type public.proposal_status as enum (
  'rascunho',
  'enviada',
  'visualizada',
  'em_negociacao',
  'aceita',
  'recusada'
);

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  client_id uuid references public.clients (id) on delete set null,
  titulo text not null,
  status public.proposal_status not null default 'rascunho',
  valor numeric(12, 2),
  prazo date,
  blocks jsonb not null default '[]'::jsonb,
  link_slug text not null unique default encode(gen_random_bytes(8), 'hex'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index proposals_user_id_idx on public.proposals (user_id);
create index proposals_client_id_idx on public.proposals (client_id);
create index proposals_link_slug_idx on public.proposals (link_slug);

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger proposals_set_updated_at
  before update on public.proposals
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- proposal_events
-- Linha do tempo de eventos de uma proposta (visualizada, aceita, etc).
-- Escrita a partir de eventos públicos (ex: cliente visualizando /p/[slug])
-- deve passar por uma Route Handler no servidor usando a service role key —
-- nunca diretamente pelo client anônimo.
-- ---------------------------------------------------------------------------
create table public.proposal_events (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals (id) on delete cascade,
  tipo text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index proposal_events_proposal_id_idx on public.proposal_events (proposal_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.clients enable row level security;
alter table public.proposals enable row level security;
alter table public.proposal_events enable row level security;

-- users: cada freelancer só acessa/edita o próprio perfil.
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- clients: acesso restrito ao dono.
create policy "clients_all_own" on public.clients
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- proposals: dono tem acesso total às próprias propostas.
create policy "proposals_all_own" on public.proposals
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- proposals: leitura pública por link_slug (rota /p/[slug]), sem autenticação.
-- Propostas em rascunho nunca são expostas publicamente, mesmo que o slug
-- seja conhecido.
create policy "proposals_public_select_by_slug" on public.proposals
  for select
  to anon
  using (status <> 'rascunho');

-- proposal_events: apenas o dono da proposta lê/escreve.
-- Eventos originados da página pública (ex: "visualizada") são gravados por
-- uma Route Handler no servidor com a service role key, que ignora RLS.
create policy "proposal_events_all_own" on public.proposal_events
  for all
  using (
    exists (
      select 1 from public.proposals
      where proposals.id = proposal_events.proposal_id
        and proposals.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.proposals
      where proposals.id = proposal_events.proposal_id
        and proposals.user_id = auth.uid()
    )
  );
