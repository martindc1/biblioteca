-- Biblioteca v0.9: usuarios y seguridad básica por usuario
-- Ejecutar en Supabase SQL Editor.
-- Atención: esto elimina las políticas abiertas de prueba.

alter table public.works
add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.highlights
add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.notes
add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.works
alter column user_id set default auth.uid();

alter table public.highlights
alter column user_id set default auth.uid();

alter table public.notes
alter column user_id set default auth.uid();

drop policy if exists "Allow public read works" on public.works;
drop policy if exists "Allow public insert works" on public.works;
drop policy if exists "Allow public update works" on public.works;
drop policy if exists "Allow public delete works" on public.works;

drop policy if exists "Allow public read highlights" on public.highlights;
drop policy if exists "Allow public insert highlights" on public.highlights;
drop policy if exists "Allow public delete highlights" on public.highlights;

drop policy if exists "Allow public read notes" on public.notes;
drop policy if exists "Allow public insert notes" on public.notes;
drop policy if exists "Allow public delete notes" on public.notes;

create policy "Users can read own works"
on public.works
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own works"
on public.works
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own works"
on public.works
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own works"
on public.works
for delete
to authenticated
using (auth.uid() = user_id);

create policy "Users can read own highlights"
on public.highlights
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own highlights"
on public.highlights
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.works
    where works.id = highlights.work_id
    and works.user_id = auth.uid()
  )
);

create policy "Users can delete own highlights"
on public.highlights
for delete
to authenticated
using (auth.uid() = user_id);

create policy "Users can read own notes"
on public.notes
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own notes"
on public.notes
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.works
    where works.id = notes.work_id
    and works.user_id = auth.uid()
  )
);

create policy "Users can delete own notes"
on public.notes
for delete
to authenticated
using (auth.uid() = user_id);

-- Opcional: si ya tenías datos de prueba sin usuario, quedarán invisibles.
-- Es mejor crear datos nuevos después de iniciar sesión.
