-- Run this if you already ran schema.sql before store_items was added

create table if not exists public.store_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  price numeric(12, 2) not null check (price > 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists store_items_user_name_idx
  on public.store_items (user_id, lower(trim(name)));

create index if not exists store_items_user_id_idx on public.store_items (user_id);

alter table public.store_items enable row level security;

create policy "Users can view own store items"
  on public.store_items for select
  using (auth.uid() = user_id);

create policy "Users can insert own store items"
  on public.store_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update own store items"
  on public.store_items for update
  using (auth.uid() = user_id);

create policy "Users can delete own store items"
  on public.store_items for delete
  using (auth.uid() = user_id);
