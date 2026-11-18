-- ============================================================================
-- MyPrepBoard : schéma de la base de données, partie 1 (Supabase / PostgreSQL)
--
-- Security Principle : every line is owned by its own user (user_id).
-- Security by line (RLS) only allows you to write and edit your own lines.
-- The role "anon" (none connected visitor) can't access anything.
--
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1. User
-- ---------------------------------------------------------------------------

create table if not exists public.user_settings (
    user_id            uuid primary key references auth.users (id) on delete cascade,
    language           text check (language in ('fr', 'en')),
    generator_options  jsonb not null default '{}'::jsonb,
    welcome_seen       boolean not null default false,
    discord_webhook    text,                                 
    created_at         timestamptz not null default now(),
    updated_at         timestamptz not null default now()
);


-- ---------------------------------------------------------------------------
-- 2. Stock
-- ---------------------------------------------------------------------------

create table if not exists public.ingredients (
    id            uuid primary key default gen_random_uuid(),
    user_id       uuid not null references auth.users (id) on delete cascade,
    name          text not null check (char_length(name) between 1 and 120),
    category      text not null default '' check (category in ('Protéine', 'Légumes', 'Féculent', 'Boisson', 'Autre', '')),
    unit          text not null default '' check (unit in ('g', 'mL', 'unités', '')),
    quantity      numeric(12, 2) not null default 0 check (quantity >= 0),
    price         numeric(10, 2) not null default 0 check (price >= 0),
    calories      numeric(8, 2)  not null default 0 check (calories >= 0),
    protein       numeric(8, 2)  not null default 0 check (protein >= 0),
    fat           numeric(8, 2)  not null default 0 check (fat >= 0),
    carbs         numeric(8, 2)  not null default 0 check (carbs >= 0),
    image         text not null default '',
    track_stock   boolean not null default true,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now(),
    unique (id, user_id)
);

create unique index if not exists ingredients_user_name_uniq on public.ingredients (user_id, lower(name));


-- ---------------------------------------------------------------------------
-- 3. Recipes
-- ---------------------------------------------------------------------------

create table if not exists public.recipes (
    id            uuid primary key default gen_random_uuid(),
    user_id       uuid not null references auth.users (id) on delete cascade,
    name          text not null check (char_length(name) between 1 and 160),
    prep_time     integer not null default 0 check (prep_time >= 0),
    cook_time     integer not null default 0 check (cook_time >= 0),
    instructions  text not null default '',
    image         text not null default '',
    status        text not null default 'normal' check (status in ('normal', 'favorite')),
    macro         text,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now(),
    unique (id, user_id)
);

--Avoid dups
create unique index if not exists recipes_user_name_uniq on public.recipes (user_id, lower(name));


-- ---------------------------------------------------------------------------
-- 4. Ingredients
--    Foreign Keys (id, user_id) unable a recipes to link the ingredient of another user
--    Deleting an ingredient still used in a recipe is forbidden (RESTRICT) :
-- ---------------------------------------------------------------------------
create table if not exists public.recipe_ingredients (
    recipe_id      uuid not null,
    ingredient_id  uuid not null,
    user_id        uuid not null references auth.users (id) on delete cascade,
    quantity       numeric(12, 2) not null check (quantity >= 0),
    primary key (recipe_id, ingredient_id),
    foreign key (recipe_id, user_id)     references public.recipes (id, user_id)     on delete cascade,
    foreign key (ingredient_id, user_id) references public.ingredients (id, user_id) on delete restrict
);

create index if not exists recipe_ingredients_ingredient_idx on public.recipe_ingredients (ingredient_id);


-- ---------------------------------------------------------------------------
-- 5. Meal History
-- ---------------------------------------------------------------------------
create table if not exists public.meal_history (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references auth.users (id) on delete cascade,
    recipes     jsonb not null default '[]'::jsonb,
    created_at  timestamptz not null default now()
);

create index if not exists meal_history_user_date_idx on public.meal_history (user_id, created_at desc);


-- ---------------------------------------------------------------------------
-- 6. updated_at automatique
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists user_settings_updated_at on public.user_settings;
create trigger user_settings_updated_at before update on public.user_settings
    for each row execute function public.set_updated_at();

drop trigger if exists ingredients_updated_at on public.ingredients;
create trigger ingredients_updated_at before update on public.ingredients
    for each row execute function public.set_updated_at();

drop trigger if exists recipes_updated_at on public.recipes;
create trigger recipes_updated_at before update on public.recipes
    for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------------
-- 7. Security by lines (RLS) : You can only see your own lines
--    (select auth.uid()) is written that way so that Postgres doesn't recalculate it at every lines.
-- ---------------------------------------------------------------------------
alter table public.user_settings      enable row level security;
alter table public.ingredients        enable row level security;
alter table public.recipes            enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.meal_history       enable row level security;

drop policy if exists "own rows" on public.user_settings;
create policy "own rows" on public.user_settings
    for all to authenticated
    using (user_id = (select auth.uid()))
    with check (user_id = (select auth.uid()));

drop policy if exists "own rows" on public.ingredients;
create policy "own rows" on public.ingredients
    for all to authenticated
    using (user_id = (select auth.uid()))
    with check (user_id = (select auth.uid()));

drop policy if exists "own rows" on public.recipes;
create policy "own rows" on public.recipes
    for all to authenticated
    using (user_id = (select auth.uid()))
    with check (user_id = (select auth.uid()));

drop policy if exists "own rows" on public.recipe_ingredients;
create policy "own rows" on public.recipe_ingredients
    for all to authenticated
    using (user_id = (select auth.uid()))
    with check (user_id = (select auth.uid()));

drop policy if exists "own rows" on public.meal_history;
create policy "own rows" on public.meal_history
    for all to authenticated
    using (user_id = (select auth.uid()))
    with check (user_id = (select auth.uid()));


-- ---------------------------------------------------------------------------
-- 8. Access right for the API (necessary because "Automatically expose new tables" is off)
--    Only connected users ("authenticated") have access ; visitors ("anon") have nothing.
-- ---------------------------------------------------------------------------
revoke all on public.user_settings, public.ingredients, public.recipes,
              public.recipe_ingredients, public.meal_history from anon;

grant select, insert, update, delete on public.user_settings      to authenticated;
grant select, insert, update, delete on public.ingredients        to authenticated;
grant select, insert, update, delete on public.recipes            to authenticated;
grant select, insert, update, delete on public.recipe_ingredients to authenticated;
grant select, insert, update, delete on public.meal_history       to authenticated;


-- ---------------------------------------------------------------------------
-- 9. Account Suppression (RGPD)
--    The app calls supabase.rpc('delete_my_account'). Deletes on cascade so that everything is deleted
-- ---------------------------------------------------------------------------
create or replace function public.delete_my_account()
returns void
language sql
security definer
set search_path = ''
as $$
    delete from auth.users where id = (select auth.uid());
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
