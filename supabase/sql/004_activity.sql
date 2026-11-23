create table if not exists public.daily_activity (
    user_id  uuid not null references auth.users (id) on delete cascade,
    day      date not null,
    primary key (user_id, day)
);

alter table public.daily_activity enable row level security;
revoke all on public.daily_activity from anon, authenticated;

create or replace function public.record_activity()
returns void
language sql
security definer
set search_path = ''
as $$
    insert into public.daily_activity (user_id, day)
    values ((select auth.uid()), (now() at time zone 'utc')::date)
    on conflict do nothing;
$$;

revoke all on function public.record_activity() from public, anon;
grant execute on function public.record_activity() to authenticated;

-- Weekly active users (run in the SQL editor):
-- select date_trunc('week', day)::date as week, count(distinct user_id) as active_users
-- from public.daily_activity group by 1 order by 1;

-- Week-2 retention by signup week (run in the SQL editor):
-- with first_seen as (select user_id, min(day) as d0 from public.daily_activity group by 1)
-- select date_trunc('week', f.d0)::date as signup_week,
--        count(*) as users,
--        count(*) filter (where exists (
--            select 1 from public.daily_activity a
--            where a.user_id = f.user_id and a.day between f.d0 + 7 and f.d0 + 13)) as back_in_week_2
-- from first_seen f group by 1 order by 1;
