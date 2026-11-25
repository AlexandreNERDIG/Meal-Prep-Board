alter table public.user_settings drop constraint if exists user_settings_language_check;
alter table public.user_settings add constraint user_settings_language_check
    check (language is null or language in ('fr', 'en', 'es'));

alter table public.user_settings drop constraint if exists user_settings_size_check;
alter table public.user_settings add constraint user_settings_size_check
    check (octet_length(generator_options::text) <= 5000
       and (discord_webhook is null or discord_webhook ~ '^https://discord\.com/api/webhooks/[0-9]+/[A-Za-z0-9_-]+$')) not valid;

alter table public.ingredients drop constraint if exists ingredients_image_size;
alter table public.ingredients add constraint ingredients_image_size check (char_length(image) <= 600000) not valid;

alter table public.recipes drop constraint if exists recipes_size_check;
alter table public.recipes add constraint recipes_size_check
    check (char_length(image) <= 600000 and char_length(instructions) <= 20000 and char_length(coalesce(macro, '')) <= 2000) not valid;

alter table public.meal_history drop constraint if exists meal_history_size_check;
alter table public.meal_history add constraint meal_history_size_check check (octet_length(recipes::text) <= 2000000) not valid;

create or replace function public.enforce_row_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
    max_rows integer := tg_argv[0]::integer;
    current_rows integer;
begin
    execute format('select count(*) from %I.%I where user_id = $1', tg_table_schema, tg_table_name)
        into current_rows using new.user_id;
    if current_rows >= max_rows then
        raise exception 'row limit reached for %', tg_table_name using errcode = '54000';
    end if;
    return new;
end;
$$;

drop trigger if exists ingredients_row_limit on public.ingredients;
create trigger ingredients_row_limit before insert on public.ingredients
    for each row execute function public.enforce_row_limit(2000);

drop trigger if exists recipes_row_limit on public.recipes;
create trigger recipes_row_limit before insert on public.recipes
    for each row execute function public.enforce_row_limit(1000);

drop trigger if exists meal_history_row_limit on public.meal_history;
create trigger meal_history_row_limit before insert on public.meal_history
    for each row execute function public.enforce_row_limit(1500);

create index if not exists feedback_user_created_idx on public.feedback (user_id, created_at);

create or replace function public.limit_feedback()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if (select count(*) from public.feedback
         where user_id = new.user_id and created_at > now() - interval '1 day') >= 20 then
        raise exception 'feedback limit reached' using errcode = '54000';
    end if;
    return new;
end;
$$;

revoke all on function public.limit_feedback() from public, anon, authenticated;

drop trigger if exists feedback_rate_limit on public.feedback;
create trigger feedback_rate_limit before insert on public.feedback
    for each row execute function public.limit_feedback();

alter table public.feedback drop constraint if exists feedback_user_id_fkey;
alter table public.feedback add constraint feedback_user_id_fkey
    foreign key (user_id) references auth.users (id) on delete cascade;
