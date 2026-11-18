-- ============================================================================
-- MyPrepBoard : schéma v2
--
-- Added :
--   * ingredients.local_id : Id used by the app ("7", "21"...) to link recipes and stock ;
--   * load_snapshot()  : send back all the connected user data in one call ;
--   * apply_changes()  : Apply in one transaction all the changes done in the app ;
-- ============================================================================

alter table public.ingredients add column if not exists local_id text;

update public.ingredients set local_id = id::text where local_id is null;
alter table public.ingredients alter column local_id set not null;

create unique index if not exists ingredients_user_local_uniq on public.ingredients (user_id, local_id);

alter table public.recipe_ingredients add column if not exists position integer not null default 0;


-- ---------------------------------------------------------------------------
-- load_snapshot() :
-- ---------------------------------------------------------------------------
create or replace function public.load_snapshot()
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
declare
    uid uuid := (select auth.uid());
begin
    if uid is null then
        raise exception 'not authenticated' using errcode = '28000';
    end if;

    return jsonb_build_object(
        'ingredients', coalesce((
            select jsonb_agg(jsonb_build_object(
                'id', i.local_id,
                'name', i.name,
                'category', i.category,
                'unit', i.unit,
                'quantity', i.quantity,
                'price', i.price,
                'calories', i.calories,
                'protein', i.protein,
                'fat', i.fat,
                'carbs', i.carbs,
                'image', i.image,
                'trackStock', i.track_stock
            ) order by i.created_at, i.local_id)
            from public.ingredients i where i.user_id = uid
        ), '[]'::jsonb),

        'recipes', coalesce((
            select jsonb_agg(jsonb_build_object(
                'name', r.name,
                'prepTime', r.prep_time,
                'cookTime', r.cook_time,
                'instructions', r.instructions,
                'image', r.image,
                'status', r.status,
                'macro', r.macro,
                'lines', coalesce((
                    select jsonb_agg(jsonb_build_object('ingredientId', i.local_id, 'quantity', ri.quantity)
                                     order by ri.position, i.local_id)
                    from public.recipe_ingredients ri
                    join public.ingredients i on i.id = ri.ingredient_id and i.user_id = ri.user_id
                    where ri.recipe_id = r.id
                ), '[]'::jsonb)
            ) order by r.created_at, r.name)
            from public.recipes r where r.user_id = uid
        ), '[]'::jsonb),

        'history', coalesce((
            select jsonb_agg(h.recipes order by h.created_at, h.id)
            from public.meal_history h where h.user_id = uid
        ), '[]'::jsonb),

        'settings', (
            select jsonb_build_object(
                'language', s.language,
                'generatorOptions', s.generator_options,
                'welcomeSeen', s.welcome_seen,
                'discordWebhook', s.discord_webhook
            )
            from public.user_settings s where s.user_id = uid
        )
    );
end;
$$;


-- ---------------------------------------------------------------------------
-- apply_changes(p) : p is a JSON Object ; no keys are mandatory here
--   ingredients_delete : ["7", "21"]                         (local_id)
--   recipes_delete     : ["Poulet basquaise"]                (noms)
--   ingredients_upsert : [{id, name, category, unit, quantity, price, calories, protein, fat, carbs, image, trackStock}]
--   recipes_upsert     : [{name, prepTime, cookTime, instructions, image, status, macro, lines:[{ingredientId, quantity}]}]
--   history            : [[recette, ...], ...]               (remplace tout l'historique)
--   settings           : {language, generatorOptions, welcomeSeen, discordWebhook}
-- ---------------------------------------------------------------------------
create or replace function public.apply_changes(p jsonb)
returns void
language plpgsql
set search_path = ''
as $$
declare
    uid uuid := (select auth.uid());
    rec record;
    rid uuid;
begin
    if uid is null then
        raise exception 'not authenticated' using errcode = '28000';
    end if;

    delete from public.recipes
     where user_id = uid
       and name in (select jsonb_array_elements_text(coalesce(p->'recipes_delete', '[]'::jsonb)));

    delete from public.recipe_ingredients ri
     using public.ingredients i
     where ri.ingredient_id = i.id and ri.user_id = uid and i.user_id = uid
       and i.local_id in (select jsonb_array_elements_text(coalesce(p->'ingredients_delete', '[]'::jsonb)));

    delete from public.ingredients
     where user_id = uid
       and local_id in (select jsonb_array_elements_text(coalesce(p->'ingredients_delete', '[]'::jsonb)));

    -- 2. Ingredients modified or deleted
    insert into public.ingredients (user_id, local_id, name, category, unit, quantity, price, calories, protein, fat, carbs, image, track_stock, created_at)
    select uid, x.id, x.name, coalesce(x.category, ''), coalesce(x.unit, ''),
           coalesce(x.quantity, 0), coalesce(x.price, 0),
           coalesce(x.calories, 0), coalesce(x.protein, 0), coalesce(x.fat, 0), coalesce(x.carbs, 0),
           coalesce(x.image, ''), coalesce(x."trackStock", true),
           now() + e.ord * interval '1 millisecond'
      from jsonb_array_elements(coalesce(p->'ingredients_upsert', '[]'::jsonb)) with ordinality as e(value, ord),
           lateral jsonb_to_record(e.value) as x(
               id text, name text, category text, unit text, quantity numeric, price numeric,
               calories numeric, protein numeric, fat numeric, carbs numeric, image text, "trackStock" boolean)
    on conflict (user_id, local_id) do update set
        name = excluded.name, category = excluded.category, unit = excluded.unit,
        quantity = excluded.quantity, price = excluded.price,
        calories = excluded.calories, protein = excluded.protein, fat = excluded.fat, carbs = excluded.carbs,
        image = excluded.image, track_stock = excluded.track_stock;

    -- 3. Recipes added deleted or modified
    for rec in
        select x.*, e.ord
          from jsonb_array_elements(coalesce(p->'recipes_upsert', '[]'::jsonb)) with ordinality as e(value, ord),
               lateral jsonb_to_record(e.value) as x(
                   name text, "prepTime" integer, "cookTime" integer, instructions text,
                   image text, status text, macro text, lines jsonb)
    loop
        insert into public.recipes (user_id, name, prep_time, cook_time, instructions, image, status, macro, created_at)
        values (uid, rec.name, coalesce(rec."prepTime", 0), coalesce(rec."cookTime", 0),
                coalesce(rec.instructions, ''), coalesce(rec.image, ''),
                coalesce(rec.status, 'normal'), rec.macro,
                now() + rec.ord * interval '1 millisecond')
        on conflict (user_id, lower(name)) do update set
            name = excluded.name, prep_time = excluded.prep_time, cook_time = excluded.cook_time,
            instructions = excluded.instructions, image = excluded.image,
            status = excluded.status, macro = excluded.macro
        returning id into rid;

        delete from public.recipe_ingredients where recipe_id = rid and user_id = uid;

        -- A line that points toward a deleted ingredient is simply ignored
        insert into public.recipe_ingredients (recipe_id, ingredient_id, user_id, quantity, position)
        select rid, i.id, uid, max((l.value->>'quantity')::numeric), min(l.ord)
          from jsonb_array_elements(coalesce(rec.lines, '[]'::jsonb)) with ordinality as l(value, ord)
          join public.ingredients i on i.user_id = uid and i.local_id = l.value->>'ingredientId'
         group by i.id;
    end loop;

    -- 4. History replace by a bloc in chronological order
    if p ? 'history' then
        delete from public.meal_history where user_id = uid;
        insert into public.meal_history (user_id, recipes, created_at)
        select uid, w.value, now() + (w.ord * interval '1 millisecond')
          from jsonb_array_elements(p->'history') with ordinality as w(value, ord);
    end if;

    -- 5. Settings
    if p ? 'settings' and jsonb_typeof(p->'settings') = 'object' then
        insert into public.user_settings (user_id, language, generator_options, welcome_seen, discord_webhook)
        values (uid,
                nullif(p->'settings'->>'language', ''),
                coalesce(p->'settings'->'generatorOptions', '{}'::jsonb),
                coalesce((p->'settings'->>'welcomeSeen')::boolean, false),
                nullif(p->'settings'->>'discordWebhook', ''))
        on conflict (user_id) do update set
            language = excluded.language,
            generator_options = excluded.generator_options,
            welcome_seen = excluded.welcome_seen,
            discord_webhook = excluded.discord_webhook;
    end if;
end;
$$;

revoke all on function public.load_snapshot() from public, anon;
revoke all on function public.apply_changes(jsonb) from public, anon;
grant execute on function public.load_snapshot() to authenticated;
grant execute on function public.apply_changes(jsonb) to authenticated;
