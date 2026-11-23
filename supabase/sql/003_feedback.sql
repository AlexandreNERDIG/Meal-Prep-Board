create table if not exists public.feedback (
    id          bigint generated always as identity primary key,
    user_id     uuid references auth.users (id) on delete set null,
    kind        text not null check (kind in ('idea', 'bug', 'other')),
    message     text not null check (char_length(message) between 1 and 2000),
    language    text,
    created_at  timestamptz not null default now()
);

alter table public.feedback enable row level security;

drop policy if exists "insert own feedback" on public.feedback;
create policy "insert own feedback" on public.feedback
    for insert to authenticated
    with check (user_id = (select auth.uid()));

revoke all on public.feedback from anon, authenticated;
grant insert on public.feedback to authenticated;
