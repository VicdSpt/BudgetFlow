-- Schéma BudgetFlow — à exécuter dans le SQL Editor de Supabase
-- (Dashboard Supabase → SQL Editor → New query → coller → Run)

create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  target_savings numeric not null,
  current_savings numeric not null default 0,
  deadline_date date,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table fixed_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric not null,
  frequency text not null,
  category text not null,
  payment_day int
);

create table monthly_incomes (
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null,
  income numeric not null,
  primary key (user_id, month)
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null,
  category text not null,
  description text not null,
  date date not null,
  tag text not null,
  created_at timestamptz not null default now()
);

-- Row Level Security : chaque utilisateur ne voit que ses lignes
alter table goals enable row level security;
create policy "own rows" on goals for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table fixed_expenses enable row level security;
create policy "own rows" on fixed_expenses for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table monthly_incomes enable row level security;
create policy "own rows" on monthly_incomes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table transactions enable row level security;
create policy "own rows" on transactions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
