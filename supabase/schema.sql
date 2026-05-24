-- Run this in Supabase Dashboard → SQL Editor

-- Profiles (store owner name for "Tindahan ni ...")
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null,
  created_at timestamptz default now()
);

-- Debtors (mga umutang)
create table if not exists public.debtors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  contact text default '',
  created_at timestamptz default now()
);

-- Transactions (utang + bayad)
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  debtor_id uuid references public.debtors on delete cascade not null,
  type text not null check (type in ('utang', 'bayad')),
  amount numeric(12, 2) not null check (amount > 0),
  description text default '',
  date date not null,
  created_at timestamptz default now()
);

create index if not exists debtors_user_id_idx on public.debtors (user_id);
create index if not exists transactions_user_id_idx on public.transactions (user_id);
create index if not exists transactions_debtor_id_idx on public.transactions (debtor_id);

alter table public.profiles enable row level security;
alter table public.debtors enable row level security;
alter table public.transactions enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Debtors policies
create policy "Users can view own debtors"
  on public.debtors for select
  using (auth.uid() = user_id);

create policy "Users can insert own debtors"
  on public.debtors for insert
  with check (auth.uid() = user_id);

create policy "Users can update own debtors"
  on public.debtors for update
  using (auth.uid() = user_id);

create policy "Users can delete own debtors"
  on public.debtors for delete
  using (auth.uid() = user_id);

-- Transactions policies
create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- Auto-create profile on sign up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Store items (presyo ng binebenta)
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
