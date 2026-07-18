-- Preenche nome/empresa em public.users a partir do user_metadata enviado
-- no supabase.auth.signUp({ options: { data: { nome, empresa } } }).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, nome, empresa)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'nome',
    new.raw_user_meta_data ->> 'empresa'
  );
  return new;
end;
$$;
