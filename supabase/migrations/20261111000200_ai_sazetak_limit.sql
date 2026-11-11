-- Najviše 10 AI sažetaka dnevno po korisniku (trošak plaća Sajam).
create table public.ai_summary_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null default current_date,
  count integer not null default 0,
  primary key (user_id, day)
);
alter table public.ai_summary_usage enable row level security;
revoke all on public.ai_summary_usage from anon, authenticated;

-- Upisuje jedan AI sažetak za prijavljenog korisnika; vraća false kad je dnevni limit potrošen.
create function public.use_ai_summary(p_limit integer default 10)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  if auth.uid() is null then
    return false;
  end if;
  insert into public.ai_summary_usage as u (user_id, day, count)
  values (auth.uid(), current_date, 1)
  on conflict (user_id, day) do update set count = u.count + 1
    where u.count < least(p_limit, 10)
  returning u.count into v_count;
  return v_count is not null;
end;
$$;
revoke execute on function public.use_ai_summary(integer) from public, anon;
grant execute on function public.use_ai_summary(integer) to authenticated;
