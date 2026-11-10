-- Registracija mejlom (Figma „Registruj se putem mejla“) šalje i korisničko ime.
-- Ako je ispravno i slobodno, profil ga dobija; inače se pravi od mejla kao do sada.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  wanted text;
  base text;
  candidate text;
  n int := 0;
begin
  wanted := lower(btrim(coalesce(new.raw_user_meta_data ->> 'username', '')));
  if wanted ~ '^[a-z0-9_.]{3,30}$' and not exists (select 1 from public.profiles where username = wanted) then
    candidate := wanted;
  else
    base := lower(regexp_replace(public.f_unaccent(split_part(coalesce(new.email, ''), '@', 1)), '[^a-zA-Z0-9_.]', '', 'g'));
    if char_length(base) < 3 then
      base := 'korisnik';
    end if;
    base := left(base, 24);
    candidate := base;
    while exists (select 1 from public.profiles where username = candidate) loop
      n := n + 1;
      candidate := base || n::text;
    end loop;
  end if;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    candidate,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      nullif(new.raw_user_meta_data ->> 'username', ''),
      candidate
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Provera „da li je korisničko ime slobodno“ pre registracije (vraća samo da/ne).
create or replace function public.username_available(p_username text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select lower(btrim(p_username)) ~ '^[a-z0-9_.]{3,30}$'
     and not exists (select 1 from public.profiles where username = lower(btrim(p_username)))
$$;
