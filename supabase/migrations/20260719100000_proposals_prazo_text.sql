-- O campo "prazo" é texto livre (ex: "6 semanas"), não uma data.

alter table public.proposals
  alter column prazo type text using prazo::text;
